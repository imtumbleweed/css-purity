import { absolute } from "./common-styles.js";

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

    // the view
    this.view = view;

    // grab globally available mouse object
    this.mouse = view.mouse;

    // get element object of the container it will be embedded into
    this.container = document.getElementById( target );

    // store a reference to the object the values on this slider control will modify
    this.specimen = null;

    // The gradient preview in the main dashboard
    this.specimen_corners = document.getElementById( "specimen_corners" );

    this.direction = direction;

    // width of the box where numeric value of this
    // slider is displayed (to the right of actual slider)
    // *not used if "show_value" argument is false or null
    this.value_width = 60;

    // Slider can be horizontal or vertical, horizontal is default, but flip axis if its vertical
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

    // Create slider container
    this.div = absolute(id,
                        array_xy_pos == null ? 0 : array_xy_pos[0],
                        array_xy_pos == null ? 0 : array_xy_pos[1],
                        this.width,
                        this.height,
                        1);
    this.div.style.marginTop = "8px";
    // if position is not provided, make this element "relative" (position works only with "absolute" display location)
    if (array_xy_pos == null) this.div.style.position = "relative";
    this.div.setAttribute("class", "noselect");
    this.div.style.background = this.background.color;
    this.div.style.color = "gray";
    // Print name of this control inside it
    this.div.innerHTML = "<span style = 'padding-left: 8px; width: 100%; display: inline-block; text-align: left;'>" + name + "</span>";
    // Determine color and font of the name displayed inside the element
    this.div.style.fontFamily = "Arial";
    this.div.style.fontSize = "14px";
    this.div.style.color = "white";
    // Match line height to the height of the element
    this.div.style.lineHeight = this.height + "px";
    // Add overflow hidden
    //this.div.style.overflow = "hidden";

    // Create the draggable knob
    this.knob =  absolute(id + "_knob",
                          0,
                          this.scrubber.x,
                          this.scrubber.width,
                          this.scrubber.height,
                          12);
    this.knob.setAttribute("class", "scrubber");
    this.knob.style.background = this.scrubber.color;
    this.knob.style.cursor = "hand";

    // Create value display <div> (if enabled)
    if (show_value) {
         this.val =  absolute(id + "_value",
                              0,
                              0,
                              this.value_width,
                              this.height,
                              13,
                              -this.value_width); // align to right side
         this.val.style.background = "white";
         this.val.style.border = "1px solid gray";
         this.val.style.color = "#333";
         this.val.style.fontFamily = "Arial";
         this.val.style.fontSize = "12px";
         this.val.innerHTML = "0";
         this.val.value = this.now;
    }

    if (this.val) {
        // console.log("Nest value inside Slider container")
        this.div.appendChild( this.val );
    }

    // Nest the knob inside the container
    this.div.appendChild( this.knob );

    // Add the slider to target in the DOM
    this.container.appendChild( this.div );

    // Add mouse drag events
    this.events();
  }

  events() {

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

        // Current value of this slider
        let val, bound;

        // Horizontal
        if (this.direction == HORIZONTAL) {
          val = this.memory.x + this.mouse.difference.x;
          bound = this.width - this.scrubber.width;
          if (val < 0) val = 0;
          if (val > bound) val = bound;
          this.knob.style.left = val + "px";

        // Must be vertical
        } else {
          val = this.memory.y + this.mouse.difference.y;
          bound = this.height - this.scrubber.height;
          if (val < 0) val = 0;
          if (val > bound) val = bound;
          this.knob.style.top = val + "px";
        }

        // Keep lime color if mouse is outside of the knob but still dragging
        this.knob.style.background = "lime";

        // Update new slider value in slider value display <div>
        if (this.val) this.val.innerHTML = val;

        // Do something to the currently selected "specimen" element,
        // That this slider is supposed to change. This could be a color,
        // The size (width & height) or rotation angle of target element.

        this.specimen = this.view.selectedElement; // this.view.selectedElement;

        // view zoom
        if (this.name == "zoom")
            document.getElementById("View").style.transform = "scale(" + (1.0 + (val * 0.001)) + ")";

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