import { View } from "./view.js";
import { Toolbar } from "./toolbar.js";
import { absolute } from "./common-styles.js";
import { Slider, VERTICAL, HORIZONTAL } from "./slider.js";
import { Pad } from "./pad.js";

export class Painter {

    constructor() {
        this.ver = 1.0;
        this.zoom = 1.0;       // default zoom equivalent to 100%
        this.view = null;      // view
        this.toolbar = null;
        this.elements = 0;     // number of elements added
        this.z = 1;
    }

    create() {

        this.view = new View( this );
        this.toolbar = new Toolbar( this.view );
        this.toolbar.create();

        let pad_1 = new Pad(this.view, "pad-controls", "pad_1", "move",  null, 100, 100,     0, 200, 0, false, 0);
        let pad_2 = new Pad(this.view, "pad-controls", "pad_2", "scale", null, 100, 100,     0, 200, 0, false, "64px");

        let slider_z = new Slider(this.view, "target", "specimen", "scrubber_z", "zoom",   null,       HORIZONTAL, 300, 15, 0, 200, 0, true);
        let slider_1 = new Slider(this.view, "target", "specimen", "scrubber_1", "width",  null,       HORIZONTAL, 300, 15, 0, 200, 0, true);
        let slider_2 = new Slider(this.view, "target", "specimen", "scrubber_2", "height", null,       HORIZONTAL, 300, 15, 0, 500, 0, true);
        let slider_b = new Slider(this.view, "target", "specimen", "scrubber_b", "border", null,       HORIZONTAL, 360, 15, 0, 200, 0, true);
        let slider_3 = new Slider(this.view, "target", "specimen", "scrubber_3", "angle",  null,       HORIZONTAL, 360, 15, 0, 360, 0, true);
        let slider_4 = new Slider(this.view, "corners", "specimen", "scrubber_4", "rc_1",  [15, 0],    HORIZONTAL, 140, 15, 0, 500, 0, false); // rounded corners controls
        let slider_5 = new Slider(this.view, "corners", "specimen", "scrubber_5", "rc_2",  [0, 15],    VERTICAL,   140, 15, 0, 500, 0, false);
        let slider_6 = new Slider(this.view, "corners", "specimen", "scrubber_6", "rc_3",  [205, 0],   HORIZONTAL, 140, 15, 0, 500, 0, false);
        let slider_7 = new Slider(this.view, "corners", "specimen", "scrubber_7", "rc_4",  [345, 15],  VERTICAL,   140, 15, 0, 500, 0, false);
        let slider_8 = new Slider(this.view, "corners", "specimen", "scrubber_8", "rc_5",  [15, 305],  HORIZONTAL, 140, 15, 0, 500, 0, false);
        let slider_9 = new Slider(this.view, "corners", "specimen", "scrubber_9", "rc_6",  [0, 165],   VERTICAL,   140, 15, 0, 500, 0, false);
        let slider_A = new Slider(this.view, "corners", "specimen", "scrubber_A", "rc_7",  [205, 305], HORIZONTAL, 140, 15, 0, 500, 0, false);
        let slider_B = new Slider(this.view, "corners", "specimen", "scrubber_B", "rc_8",  [345, 165], VERTICAL,   140, 15, 0, 500, 0, false);
    }

    version() {
        console.log("Version " + this.ver);
        return this;
    }
};