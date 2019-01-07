export class Pad {

// changed: removed "specimen_id", and "direction" arguments
  constructor(view, target, id, name, array_xy_pos, width, height, min, max, now, show_value, left_margin) {

    this.container = document.getElementById( target );
    this.specimen = null;
    this.value_width = 60;
    this.mouse = view.mouse;
    this.view = view;
    this.width = width;
    this.height = height;
    this.min = 0;
    this.max = 100;
    this.now = now;
    this.background = { color : "#888" };

    this.lastvalue = 0;

    this.returning = false; // is knob returning to original position?
    this.timer = null;

/* replaced this:
    if (this.direction == HORIZONTAL)
        this.scrubber = { x : 0, y : 0, width : 25, height: this.height, color : "silver" };

    if (this.direction == VERTICAL)
        this.scrubber = { x : 0, y : 0, height : 25, width: this.width, color : "silver" }; */

// added: define center of the pad
    this.original = { x : (width / 2) - (32 / 2), y : (height / 2) - (32 / 2) };

// changed: to this (move knob to the middle of the element)
    this.scrubber = { x : this.original.x, y: this.original.y, width : 32, height: 32, color : "silver" };

    this.canDrag = false;
    this.isDragging = false;
    this.memory = { x : 0, y : 0};
    this.name = name;

// changed: replaced val with valx, and valy
    this.valx = null;
    this.valy = null;

    // Main slider area
    this.div = document.createElement("div");
    this.div.setAttribute("id", id);
    this.div.style.marginTop = "8px";

// changed: always "relative" (removed "absolute")
    this.div.style.position = "relative";
    this.div.style.left = "unset"; // array_xy_pos[0] + "px";
    this.div.style.top = "unset"; // array_xy_pos[1] + "px";

// changed: block to inline-block
    this.div.style.display = "inline-block";

    this.div.style.width = this.width + "px";
    this.div.style.height = this.height + "px";
    this.div.style.background = this.background.color;
    this.div.style.color = "gray";
    this.div.innerHTML = "<span style = 'padding-left: 8px; width: 100%; display: inline-block; text-align: left;'>" + name + "</span>";
    this.div.style.fontFamily = "Arial";
    this.div.style.fontSize = "14px";
    this.div.style.color = "white";
    this.div.style.lineHeight = this.height + "px";
    if (left_margin) this.div.style.marginLeft = left_margin + "px";
    this.div.style.zIndex = 1;

    // Draggable scrubber
    this.knob = document.createElement("div");
    this.knob.setAttribute("id", id + "_knob");
    this.knob.setAttribute("class", "scrubber");
    this.knob.style.position = "absolute";
    this.knob.style.display = "block";
    this.knob.style.left = this.scrubber.x + "px";
    this.knob.style.top = this.scrubber.y + "px";
    this.knob.style.width = this.scrubber.width + "px";
    this.knob.style.height = this.scrubber.height + "px";
    this.knob.style.background = this.scrubber.color;
    this.knob.style.cursor = "hand";
    this.knob.style.zIndex = 2;

    // value display
    if (show_value) {
      this.val = document.createElement("input");
      this.val.setAttribute("id", id + "_value");
      this.val.style.position = "absolute";
      this.val.style.top = 0;
      this.val.style.right = -this.value_width + "px";
      this.val.style.display = "block";
      this.val.style.width = this.value_width + "px";
      this.val.style.height = this.height + "px";
      this.val.style.background = "white";
      this.val.style.border = "1px solid gray";
      this.val.style.color = "#333";
      this.val.style.fontFamily = "Arial";
      this.val.style.fontSize = "12px";
      this.val.value = this.now;
      this.val.style.zIndex = 3;
    }

    if (this.val) this.div.appendChild( this.val );
    this.div.appendChild( this.knob );
    this.container.appendChild( this.div );

    this.enable_drag();
  }

  knob_is_away() {
      return (parseInt(this.knob.style.left) != this.original.x || parseInt(this.knob.style.top) != this.original.y);
  }

  step_to_center() {
      if (this.returning) {
          let x = this.scrubber.x;
          let y = this.scrubber.y;
          let dx = (this.original.x - x) / 10;
          let dy = (this.original.y - y) / 10;
          if ( this.knob_is_away() ) {
              this.scrubber.x += dx;
              this.scrubber.y += dy;
              this.knob.style.left = x + dx + "px";
              this.knob.style.top = (y + dy) + "px";
          } else {
              this.knob.style.left = parseInt(x + dx) + "px";
              this.knob.style.top = parseInt((y + dy)) + "px";
              this.returning = false;
          }
      }
  }

  enable_drag() {

    // knob
    this.knob.addEventListener("mousedown", e => {
      if (this.isDragging == false) {
        this.isDragging = true;
        this.memory.x = parseInt(this.knob.style.left);
        this.memory.y = parseInt(this.knob.style.top);
      }
      e.preventDefault(); //e.stopPropagation();
    });

    this.knob.addEventListener("mouseup", e => {
      this.isDragging = false;
      if ( this.knob_is_away() ) { // now we need to start returning the knob to original position, unless it never moved

          // update selected element data
          if (this.specimen && this.name == "scale") {
            this.specimen.setAttribute("data-scale", this.lastvalue);
            this.specimen.style.transform = "scale(" + this.lastvalue + "deg)";
          }

          if (!this.returning) {
              this.returning = true;
              this.timer = setInterval(() => { this.step_to_center(); }, 1);
          };
      }
    });

    // main events
    document.body.addEventListener("mousemove", e => {

        // must be dragging, but not returning
      if (this.isDragging == true && this.returning == false) {

        let valx = this.memory.x + this.mouse.difference.x;
        let boundx = this.width - this.scrubber.width;
        if (valx < 0) valx = 0;
        if (valx > boundx) valx = boundx;
        this.knob.style.left = valx + "px";

        let valy = this.memory.y + this.mouse.difference.y;
        let boundy = this.height - this.scrubber.height;
        if (valy < 0) valy = 0;
        if (valy > boundy) valy = boundy;

        this.scrubber.x = valx;
        this.scrubber.y = valy;

        this.knob.style.left = valx + "px";
        this.knob.style.top = valy + "px";
        this.knob.style.background = "lime";

        // console.log("this.knob.style.top = ", this.knob.style.top);

        // get currently selected object
        this.specimen = this.view.selectedElement;

        // does selected object exist?
        if (this.specimen) {
          if (this.name == "scale") {
            let s = parseFloat(this.specimen.getAttribute("data-scale"));
            let r = parseInt(this.specimen.getAttribute("data-rotate"));
            let v = this.lastvalue = s + ((this.mouse.difference.x + this.mouse.difference.y) * 0.005);
            this.specimen.style.transform = "rotate(" + r + "deg) scale(" + v + ")";
          }
        }
      }
    });

    document.body.addEventListener("mouseup", e => {

      if (this.specimen) {
        //if (this.name == "scale") {
            //console.log("name!");



      }

      this.isDragging = false;
      this.knob.style.background = this.scrubber.color;
    });
  }
}