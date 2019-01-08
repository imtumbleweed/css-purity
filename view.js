import { Mouse } from "./mouse.js";
import { absolute } from "./common-styles.js";

class Point {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
};

export class View {

    constructor( toolbar ) {

        this.mouse = new Mouse( this );
        this.toolbar = toolbar;
        this.memory = {x:0,y:0};

        console.log("View.constructor();");

        this.div = document.createElement("div");
        this.statusbar = document.createElement("div");
        this.disableSelection = false;
        this.selectedElement = null;
        this.imDrawing = false;
        this.isDragging = false;
        this.show_status = true;

        // view
        this.div.setAttribute("id", "View");
        this.div.style.position = "absolute";
        this.div.style.top = 0;
        this.div.style.left = 0;
        this.div.style.width = "calc(100% - 360px)";
        this.div.style.height = "100%";
        this.div.style.border = "unset";
        this.div.style.background = "url(checkered.png) repeat";
        //this.div.style.pointerEvents = "none";
        this.target = this.div;

        // status bar
        this.statusbar.setAttribute("id", "status");
        this.statusbar.style.position = "absolute";
        this.statusbar.style.bottom = 0;
        this.statusbar.style.left = 0;
        this.statusbar.style.width = "100%";
        this.statusbar.style.height = "32px";
        this.statusbar.style.fontFamily = "Arial";
        this.statusbar.style.fontSize = "14px";
        this.statusbar.style.color = "white";
        this.statusbar.style.background = "#333";
        this.statusbar.style.pointerEvents = "none";

        this.div.appendChild( this.statusbar );

        document.body.appendChild( this.div );

        this.offset = { x : 0, y : 0 };
        this.updatestatus("Default", 0, 0);
        this.element = document.getElementById("selection"); // selection element
        this.selection = { status : false, x : 0, y : 0, width : 0, height : 0 };

        this.events(); // attach view events
    }

    sel(s, x, y, w, h, mx, my) {
        this.selection.status = s;
        if ( this.selection.status )
             this.selection = { status : true,  x : x, y : y, width : w, height : h }; else
             this.selection = { status : false, x : 0, y : 0, width : 0, height : 0 };
    }

    // add element to stage (a = angle, s = scale)
    add(x, y, w, h, transform, background, radius, border) {

        let e = absolute("element_" + this.all().length, x, y, w, h, this.z++);

        if (transform) e.style.transform = transform; // copy transforms
        if (background) e.style.background = background; // copy background
        if (border) e.style.border = border; // copy border

        if (radius) {
            e.style.borderTopLeftRadius = radius[0];
            e.style.borderTopRightRadius = radius[1];
            e.style.borderBottomLeftRadius = radius[2];
            e.style.borderBottomRightRadius = radius[3];
        }; // copy border radius

        e.addEventListener("mouseup", (e) => {
            //this.isDragging = false;
            //e.target.setAttribute("data-can-drag", 0);
            //e.target.setAttribute("data-selected", 0);
        });

        e.addEventListener("mousedown", (e) => {
            if (this.toolbar.toolbar.currentTool == 0) {

                this.all().map((object, index)=>{
                    let o = object[1];
                    o.style.borderColor = "gray";
                    o.setAttribute("data-selected", 0);
                    o.setAttribute("data-can-drag", 0);
                });

                e.target.setAttribute("data-selected", 1);
                e.target.setAttribute("data-can-drag", 1);
                //e.target.style.border = "1px solid gray";
                e.target.borderColor = "green";
                //this.isDragging = true;
                this.selectedElement = e.target;
            }
        });

        e.addEventListener("mouseover", (e) => {
            if (this.selectedElement) {
                this.selectedElement.setAttribute("data-can-drag", 1);
            }
        });

        e.addEventListener("mouseleave", (e) => {
            if (this.selectedElement) {
                this.selectedElement.setAttribute("data-can-drag", 0);
            }
        });

        // noselect here means no text select
        e.setAttribute("class", "specimen noselect");
        e.setAttribute("data-scale", "1.0");
        e.setAttribute("data-rotate", "0");
        e.setAttribute("data-selected", "0");
        e.style.overflow = "hidden";
        //e.style.border = "1px solid gray";
        if (!background && background != undefined) e.style.background = "black";
        e.style.color = "#555";
        e.style.fontSize = "48px";
        e.style.fontFamily = "Arial";
        e.style.textAlign  = "center";
        e.style.lineHeight = h + "px";
        e.style.cursor = "pointer";
        e.innerHTML = "Specimen";

        document.getElementById("View").appendChild( e );

        this.toolbar.toolbar.select(0); // reset toolbox to "select" mode

        return e;
    }

    delete_selected() {
        if (this.selectedElement) {
            let o = this.selectedElement;
            o.remove();
        }
    }

    copy_selected() {
        if (this.selectedElement) {
            let o = this.selectedElement;
            // copy location
            let x = (parseInt(o.style.left) + 32) + "px";
            let y = (parseInt(o.style.top) + 32) + "px";
            let w = parseInt(o.style.width) + "px";
            let h = parseInt(o.style.height) + "px";
            let t = o.style.transform;
            let b = o.style.background;
            let bor = o.style.border;
            let r = [o.style.borderTopLeftRadius, o.style.borderTopRightRadius, o.style.borderBottomLeftRadius, o.style.borderBottomRightRadius];
            this.selectedElement = this.add(x, y, w, h, t, b, r, bor);
        }
    }

    // select all elements
    all() {
        return Object.entries(document.querySelectorAll(".specimen"));
    }

    // select all selected elements
    all_selected() {
        return Object.entries(document.querySelectorAll(".specimen[data-selected='1']"));
    }

    // Events that take place on the view stage
    events() {
        console.log("View.events();");

        document.body.addEventListener("keyup", (e) => {
            let C = 67;
            let Delete = 46;
            let key = e.which || e.keyCode;
            //console.log(key);
            if (key == C)
                this.copy_selected();
            if (key == Delete)
                this.delete_selected();
        });

        this.div.addEventListener("mousedown", (e) => {
            if (this.disableSelection) return;
            this.imDrawing = true;
            // select or drag tool is chosen
            if (this.selectedElement && this.toolbar.toolbar.currentTool == 0 || this.toolbar.toolbar.currentTool == 1) {
                this.memory.x = parseInt(this.selectedElement.style.left);
                this.memory.y = parseInt(this.selectedElement.style.top);
                // start dragging selected element
                if (this.selectedElement)
                    if (this.selectedElement.getAttribute("data-can-drag") == 1)
                        this.isDragging = true;
            }
            // only if selection tool is selected
            if (this.toolbar.toolbar.currentTool == 2)
                this.selection.status = true;
            this.sel.x = this.mouse.current.x;
            this.sel.y = this.mouse.current.y;
            this.sel.width = 0;
            this.sel.height = 0;
            // remove selection class from all elements
        });
        this.div.addEventListener("mouseup", (e) => {
           if (this.disableSelection) return;
           this.imDrawing = false;
           this.isDragging = false;
           this.selection.status = false;

           console.log([this.sel.width,this.sel.height]);

           // add new element to view
           if (this.toolbar.toolbar.currentTool == 2)
               this.add(this.sel.x, this.sel.y, this.sel.width, this.sel.height, null, null, null, "1px solid red");
           //this.mouse.difference.x = 0;
           //this.mouse.difference.y = 0;
           // reset selection box
           this.element.style.left = 0;
           this.element.style.top = 0;
           this.element.style.width = 0;
           this.element.style.height = 0;
        });
        this.div.addEventListener("mousemove", (e) => {

            if (this.isDragging) { // Drag selected element
                if (this.toolbar.toolbar.currentTool == 0 || this.toolbar.toolbar.currentTool == 1) {
                    if (this.selectedElement) {
                        this.selectedElement.style.top = (this.memory.y + this.mouse.difference.y) + "px";
                        this.selectedElement.style.left = (this.memory.x + this.mouse.difference.x) + "px"
                    }
                }
            }

            if (this.disableSelection) return;
            //console.log("sel.w/h", [this.sel.width, this.sel.height]);
            this.sel.width = Math.abs(this.mouse.difference.x);
            this.sel.height = Math.abs(this.mouse.difference.y);
            if (this.mouse.current.x < this.mouse.memory.x) { this.sel.x = this.mouse.inverse.x; } // swap x
            if (this.mouse.current.y < this.mouse.memory.y) { this.sel.y = this.mouse.inverse.y; } // swap y
            // move the element
            // draw selection only if selection tool is selected
            if (this.toolbar.toolbar.currentTool == 2) {
                if (this.selection) {
                    this.element.style.left = this.sel.x + "px";
                    this.element.style.top = this.sel.y + "px";
                    this.element.style.width = Math.abs(this.mouse.difference.x) + "px";
                    this.element.style.height = Math.abs(this.mouse.difference.y) + "px";
                }
            }
        });
    }

    rectangle() {
        //this.start = (x, y) => { console.log("Start drawing rectangle."); }
        //this.end = (x, y) => { console.log("Start drawing rectangle."); }
    }

    updatestatus(tool_name, mouse_x, mouse_y) {
        let msg = tool_name + " " + "[" + mouse_x + "," + mouse_y + "]";
        let el = document.getElementById("status");
        el.innerHTML = msg;
    }

    status( flag ) {
        if ( flag )
            document.getElemeentById("status").display = "block";
        else
            document.getElemeentById("status").display = "none";
    }
}