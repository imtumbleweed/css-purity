export let HORIZONTAL = 0;
export let VERTICAL = 1;

let orc = [

    0,    0,
  0,        0,
// global storage for oval rounded corners
  0,        0,
    0,    0

];

export class Slider {

  constructor(view, target, specimen_id, id, name, array_xy_pos, direction,   width, height,     min, max, now,   show_value) {

    this.container = document.getElementById( target );
    this.specimen = null; // document.getElementById( specimen_id );
    this.specimen_corners = document.getElementById( "specimen_corners" );
    this.direction = direction;
    this.value_width = 60;
    this.mouse = view.mouse;
    this.view = view;

    // flip axis
    if (this.direction == VERTICAL) { let save = width; width = height; height = save; }

    this.width = width;
    this.height = height;
    this.min = 0;
    this.max = 100;
    this.now = now;
    this.background = { color : "#888" };

    if (this.direction == HORIZONTAL)
        this.scrubber = { x : 0, y : 0, width : 25, height: this.height, color : "silver" };

    if (this.direction == VERTICAL)
        this.scrubber = { x : 0, y : 0, height : 25, width: this.width, color : "silver" };

    this.canDrag = false;
    this.isDragging = false;
    this.memory = { x : 0, y : 0};
    this.name = name;

    this.val = null;

    // Main slider area
    this.div = document.createElement("div");
    this.div.setAttribute("id", id);
    this.div.style.marginTop = "8px";

    if (array_xy_pos == null) {
      this.div.style.position = "relative";
    } else {
      this.div.style.position = "absolute";
      this.div.style.left = array_xy_pos[0] + "px";
      this.div.style.top = array_xy_pos[1] + "px";
    }

    this.div.setAttribute("class", "noselect");
    this.div.style.display = "block";
    this.div.style.width = this.width + "px";
    this.div.style.height = this.height + "px";
    this.div.style.background = this.background.color;
    this.div.style.color = "gray";
    this.div.innerHTML = "<span style = 'padding-left: 8px; width: 100%; display: inline-block; text-align: left;'>" + name + "</span>";
    this.div.style.fontFamily = "Arial";
    this.div.style.fontSize = "14px";
    this.div.style.color = "white";
    this.div.style.lineHeight = this.height + "px";
    this.div.style.zIndex = 1;
    //this.div.style.background = "conic-gradient(red, yellow, lime, aqua, transparent, magenta, red)";
    this.div.style.overflow = "hidden";

    // Draggable scrubber
    this.knob = document.createElement("div");
    this.knob.setAttribute("id", id + "_knob");
    this.knob.setAttribute("class", "scrubber");
    this.knob.style.position = "absolute";
    this.knob.style.display = "block";
    this.knob.style.left = this.scrubber.x + "px";
    this.knob.style.top = 0 + "px";
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

  enable_drag() {

    // knob
    this.knob.addEventListener("mousedown", e => {
      if (this.isDragging == false)
      {
        this.isDragging = true;
        this.memory.x = parseInt(this.knob.style.left);
        this.memory.y = parseInt(this.knob.style.top);
        //console.log(this.memory);
      }
      //e.stopPropagation();
      e.preventDefault();
    });
    this.knob.addEventListener("mouseup", e => {
      this.isDragging = false;
    });

    // main events
    document.body.addEventListener("mousemove", e => {
      if (this.isDragging == true) {
        let val, bound;
        if (this.direction == HORIZONTAL) {
          val = this.memory.x + this.mouse.difference.x;
          bound = this.width - this.scrubber.width;
          if (val < 0) val = 0;
          if (val > bound) val = bound;
          this.knob.style.left = val + "px";
        } else {
          val = this.memory.y + this.mouse.difference.y;
          bound = this.height - this.scrubber.height;
          if (val < 0) val = 0;
          if (val > bound) val = bound;
          this.knob.style.top = val + "px";
        }

        this.knob.style.background = "lime";

        if (this.val) this.val.value = val;

        this.specimen = this.view.selectedElement; // this.view.selectedElement;

        // view zoom
        if (this.name == "zoom") {
            document.getElementById("View").style.transform = "scale(" + (1.0 + (val * 0.001)) + ")";
        }

        if (this.specimen) {

          this.specimen.style.background = "conic-gradient(white, silver, white, silver, white, transparent, white, silver)";

          if (this.name == "angle") { this.specimen.setAttribute("data-rotate", val); let s = this.specimen.getAttribute("data-scale"); this.specimen.style.transform = "rotate(" + val + "deg) scale(" + s + ")"; }
          if (this.name == "width") this.specimen.style.width = val + "px";
          if (this.name == "height") this.specimen.style.height = val + "px";

          if (this.name == "border") { this.specimen.style.borderWidth = val + "px"; }

            // corners
            if (this.name == "rc_1") { orc[0] = val*2 + "px"; }
            if (this.name == "rc_2") { orc[1] = val*2 + "px"; }
            if (this.name == "rc_3") { orc[2] = val*2 + "px"; }
            if (this.name == "rc_4") { orc[3] = val*2 + "px"; }
            if (this.name == "rc_5") { orc[4] = val*2 + "px"; }
            if (this.name == "rc_6") { orc[5] = val*2 + "px"; }
            if (this.name == "rc_7") { orc[6] = val*2 + "px"; }
            if (this.name == "rc_8") { orc[7] = val*2 + "px"; }

            // update all oval_rounded_corners
            this.specimen_corners.style.borderTopLeftRadius = this.specimen.style.borderTopLeftRadius = orc[0] + " " + orc[1];
            this.specimen_corners.style.borderTopRightRadius = this.specimen.style.borderTopRightRadius = orc[2] + " " + orc[3];
            this.specimen_corners.style.borderBottomLeftRadius = this.specimen.style.borderBottomLeftRadius = orc[4] + " " + orc[5];
            this.specimen_corners.style.borderBottomRightRadius = this.specimen.style.borderBottomRightRadius = orc[6] + " " + orc[7];
        }
      }
    });
    document.body.addEventListener("mouseup", e => {
      this.isDragging = false;
      this.knob.style.background = this.scrubber.color;
    });
  }
}