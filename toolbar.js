import { absolute, grid, grid_item } from "./common-styles.js";

export class Toolbar {

    constructor( view ) {
        this.view = view;
        this.div = null;
        this.buttons = [];
        this.x = 100; // original
        this.y = 50;
        this.w = 72;
        this.h = 200;
        this.mx = 0; // memorized
        this.my = 0;
        this.mw = 0;
        this.mh = 0;
        this.dx = 0; // target destination
        this.dy = 0;
        this.dw = 0;
        this.dh = 0;
        this.min = { width: 32, height: 100 };
        this.willResize = false;
        this.willDrag = false;
        this.isResizing = false;
        this.isDragging = false;
        this.currentTool = 0;
        console.log("Toolbar.constructor();");
    }

    create() {
        this.div = grid("Tools", 2, this.x, this.y, this.w, this.h, 100000);
        this.div.style.overflow = "hidden";
        this.div.style.paddingTop = "24px";
        this.div.style.background = "#555555 url('toolbox-top.png') top center no-repeat";
        this.div.style.zIndex = 100000000;
        let tc = absolute("tools-corner", 0, 0, 22, 22, 100, true, true);
        tc.style.background = "url('toolscorner.png')";
// tc.style.pointerEvents = "none";
        this.div.appendChild( tc );
        this.div.addEventListener("mousemove", e => {
            const x = e.clientX - parseInt(this.div.style.left);
            const y = e.clientY - parseInt(this.div.style.top);
            const w = parseInt(this.div.style.width);
            const h = parseInt(this.div.style.height);
// Are we in resize-safe area (lower right corner 20 x 20)?
            this.willResize = false
            if (x > w - 20)
                if (y > h - 52)
                    this.willResize = true;
// Are we in drag-safe area?
            this.willDrag = false;
            //console.log(y);
            if (y < 25 && y > 0)
                this.willDrag = true;
        });
        this.div.addEventListener("mousedown", e => { // Mouse is anywhere on toolbar
            if (this.willDrag) {
                //console.log("will drag");
                this.mx = this.x;
                this.my = this.y;
                this.isDragging = true;
            }
        });
        tc.addEventListener("mousedown", e => { // Mouse is in lower right corner of toolbox
            if (this.willResize) this.isResizing = true;
            if (this.willResize) {
                //console.log("will resize");
                this.mx = this.x;
                this.my = this.y;
                this.mw = this.w;
                this.mh = this.h;
            }
//e.stopPropagation(); -- no, this will not properly work in this case (because this will disable mouse differenec calculation)
            e.preventDefault();
        });
        document.body.addEventListener("mouseup", e => { this.isResizing = false; });
        document.body.appendChild( this.div );
        this.enable_resize(); // listen for resize
        this.enable_drag(); // listen for drag and drop
// Add buttons to the toolbar
        this.add("T0", "Select",    "arrow.png",     false, true);
        this.add("T1", "Move",      "direction.png",     false);
        this.add("T2", "Select",    "marquee.png",       false);
        this.add("T3", "Circle",    "circle-tool.png",   false);
        this.add("T4", "Rectangle", "draw-element.png",  false);
        this.add("T5", "Text",      "css-text.png",      false);
        this.add("T6", "Zoom",      "zoom.png",          false);
        //this.add("T7", "Move",      "direction.png",     false);
        //this.add("T8", "Move",      "direction.png",     false);
        this.select(0);
    }

    select(tool_id) {
        this.currentTool = tool_id;
        //console.log("select tool, ", this.currentTool);
        this.view.disableSelection = false;
        if (this.currentTool != 2)
            this.view.disableSelection = true;
        //console.log(this.buttons); return;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].div.style.background = "unset";
            this.buttons[i].image.style.opacity = 0.7;
        }
        this.buttons[tool_id].div.style.background = "#444";
        this.buttons[tool_id].image.style.opacity = 1.0;

        return this;
    }

    enable_resize() {
        /* Implemented in enable_drag */
    }

    enable_drag() {
        console.log("Toolbar.enable_drag()");
        document.body.addEventListener("mousemove", e => {
            // console.log("willDrag,", this.willDrag);
            // console.log("isDragging,", this.isDragging);
            let diff_x = this.view.mouse.difference.x;
            let diff_y = this.view.mouse.difference.y;
            if (this.isResizing) {
                this.dw = this.w = this.mw + diff_x;
                this.dh = this.h = this.mh + diff_y;
                if (this.dw > this.min.width) { this.div.style.width = this.dw + "px";
                    let val = ""; for (let i = 0; i < (this.buttons.length / 2) + 1; i++)
                        val += this.dw/2 + "px ";
                    this.div.style.gridTemplateRows = val;
                }
                if (this.dh > this.min.height) this.div.style.height = this.dh + "px";
            } else if (this.isDragging) {
                this.dx = this.x = this.mx + diff_x;
                this.dy = this.y = this.my + diff_y;
                this.div.style.left = this.dx + "px";
                this.div.style.top = this.dy + "px";
            }
        });
        this.div.addEventListener("mousedown", e => { // console.log("Toolbar() mouse down");
            this.view.disableSelection = true;
            if (this.willDrag)
                this.isDragging = true;
//e.stopPropagation(); -- no, this will not properly work in this case (because this will disable mouse differenec calculation)
            e.preventDefault();
        });
        document.body.addEventListener("mouseup", e => {
            this.view.disableSelection = false;
            if (this.isDragging) {
                this.isDragging = false;
            }
        });
    }

    resize(new_width, new_height) {
        this.div.style.width = new_width + "px";
        this.div.style.height = new_height + "px";
    }

    add(i, name, image, state, large) { // add button to toolbar
        let id = this.buttons.length;
        this.buttons[id] = new Array(1);
        this.buttons[id].name = name;
        this.buttons[id].image = document.createElement("img");
        this.buttons[id].image.setAttribute("src", image);
        this.buttons[id].image.style.width = "100%";
        this.buttons[id].image.style.height = "100%";
        this.buttons[id].image.setAttribute("id", "img_" + id);
        this.buttons[id].div = grid_item(id, state ? "on" : "off" , image, 1);
        if (large) {
            this.buttons[id].div.style.gridColumn = "span 2";
            this.buttons[id].div.style.gridRow = "span 2";
        }
        this.buttons[id].div.appendChild(this.buttons[id].image);
        this.buttons[id].div.addEventListener("click", E => this.select(id));
        this.div.appendChild(this.buttons[id].div);
        //this.buttons.length++;
    }

};