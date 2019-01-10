

let sort = function(a, b) { return a - b; };

let dragging            = false;
let dragging_id         = -1;
let dragging_target     = null;

window.columnUI = { timer: null, pressed: false, counter: 0,
    reset: function() {
        clearInterval(this.timer); this.timer = null; this.counter = 0; this.pressed = false; },
    start: function(type) {
        if (this.timer) this.reset();
        if (type == 'less') { this.timer = setInterval(function() { window['grid1'].remove(); this.counter--; }, 100); }
        if (type == 'more') { this.timer = setInterval(function() { window['grid1'].add(); this.counter++; }, 100); }
    }
};

window.rowUI = { timer: null, pressed: false, counter: 0, reset: function() { clearInterval(this.timer); this.timer = null; this.counter = 0; this.pressed = false; } };

window.mx               = 0;
window.my               = 0;
window.item_x           = 0;
window.item_y           = 0;
window.dragging         = false;
window.lastW            = 0;
window.lastH            = 0;
window.resizingW        = false;
window.resizingH        = false;
window.drag_x           = 0;
window.drag_y           = 0;
window.dragging_target  = null;
window.item_width       = 0;
window.item_height      = 0;
window.drag_width       = 0;
window.drag_height      = 0;
window.item_id          = 0;
window.flex             = null;
window.g                = null;
window.copy_v_made      = false;
window.copy_h_made      = false;
window.cutterAvailable  = true;

function settemplate(template, number) {
    window.grid1.Tcolumns = template;
    window.grid1.items.count = number;
    window.grid1.paste();
}

function copy_to_clipboard(target) { }

function setjustifycontent(object, target_id, command, value) {
    $(".link", $(object).parent()).removeClass('sel');
    $(object).addClass('sel');
    window[target_id].setjustifycontent(value);
}

class cell {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

let click_item = (Tcolumns, Trows, index) => {
    let columns = Tcolumns.split(' ').length;
}

let col_inc = (target) => { // increase number of columns by 1
    window[target.target].items.count++;
    window[target.target].paste();
    columnUI.start('more');
}

let col_dec = (target) => { // decrease number of columns by 1
    window[target.target].items.count--;
    window[target.target].paste();
    columnUI.start('less');
}

let setgaps = (row, col) => {
    window.grid1.rowgaps = row;
    window.grid1.colgaps = col;
    window.grid1.paste();
}

function setgap(size) {
    window.grid1.rowgaps = size;
    window.grid1.colgaps = size;
    window.grid1.paste();
}

const container = "#container";
const vertical = 0;
const horizontal = 1;
const KNOBSIZE = 18;

class Drag {
    constructor(object, index, position, width, length, active) {
         this.object    = object;          // link to physical javascript object
         this.index     = parseInt(index); // index of the item being dragged
         this.position  = position;        // original position before drag
         this.width     = width;           // max width of the slider (16)
         this.length    = length;          // number of all sliders on the list
         this.target    = -1;              // mouse was released at this target position
         this.active    = active;          // dragger is currently being used
         this.direction = 0;               // direction of slider movement
    }
};

class MultiDrag {
    constructor() {

    }
};

// dragging can occur vertically and horizontally, at the same time
let drag_v = new Drag(null, 0, 0, 0, 0, false);
let drag_h = new Drag(null, 0, 0, 0, 0, false);

class Slice {
    constructor(dir, pos) { this.direction = dir; this.position = parseInt(pos); this.html = this.html; }
    html(index) {
        let offset = 0;//7;
        if (this.direction == vertical) {
            let colorpicker = `<input id = 'grad-color-` + index + `' data-id = 'h-colorpicker-` + index + `' type = 'color' class = 'colorpicker' />`;
            $(container).append(`<div data-id = "h-dragger-` + index + `" class = "draggerV" style = 'left: ` + (this.position - offset) + `px;'><div class = "little-arrow" style = "left: 3px; top: -15px;"></div></div>`);
            $(container).append(`<div onclick = "grid.delete_v(` + index + `)" style = "top: -75px; left: ` + (this.position - offset) + `px;" class = "deleteme deleteme-h" id = "delete-h-` + index + `"></div>`);
            return `<div i = '`+index+`' class = "noselect verticalsplitter" data-index = "V` + index + `" onmouseover = "$(this).addClass('hovering')" onmouseout = "$(this).removeClass('hovering')" style = 'line-height: 50px; left: ` + (this.position - offset) + `px;'>` + colorpicker + `</div>`;
        }
        if (this.direction == horizontal) {
            let colorpicker = `<input data-id = 'v-colorpicker-` + index + `' type = 'color' class = 'colorpicker' />`;
            $(container).append(`<div data-id = "v-dragger-` + index + `" class = "draggerH" style = 'top: ` + (this.position - offset) + `px;'>`);
            $(container).append(`<div onclick = "grid.delete_h(` + index + `)" style = "top: 0; left: 150px;" class = "deleteme deleteme-v" id = "delete-v-` + index + `"></div>`);
            return `<div i = '`+index+`' class = "noselect horizontalsplitter" id = "d--h-` + index + `" data-index = "H` + index + `" onmouseover = "$(this).addClass('hovering')" onmouseout = "$(this).removeClass('hovering')" style = 'top: ` + (this.position - offset) + `px;'>` + colorpicker + `</div>`;
        }
    }
};

class Cell {
    constructor(x, y ,w, h, index, cell_x, cell_y) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.name = index;
        this.cell_x = cell_x;
        this.cell_y = cell_y;
    }
    html() { return '<div class = "cell noselect" id = "cell-xy-' + this.cell_x + '-' + this.cell_y + '" style = "left: ' + this.x + 'px; top: ' + this.y + 'px; width: ' + this.width + 'px; height: ' + this.height + 'px; line-height: ' + this.height + 'px">' + this.name + '</div>'; }
};

export class Gradient {
    constructor(_target, id, width, height, Tcolumns, Trows, items, itemW, itemH, autoflow) {
        this.id         = id;
        this.target     = _target;
        this.container  = document.getElementById(this.target);
        this.width      = width;
        this.height     = height;
        this.Tcolumns   = Tcolumns;
        this.Trows      = Trows;
        this.items      = { count : items };
        this.autoflow   = autoflow;

        this.rowgaps    = 0;
        this.colgaps    = 0;
        this.cells      = new Array(10 * 10).fill(new Cell(0, 0, 0, 0, -1)); // 5,625 cells max(75 * 75)
        this.slicepos   = { vertical: [], horizontal: [] }; // just the slice positions
        this.verticalslices   = []; // array of Slice objects (vertical)
        this.horizontalslices = []; // array of Slice objects (horizontal)
        this.verticalslicescopy = [];
        this.horizontalslicescopy = [];
        // cells
        this.vertical = [];
        this.horizontal = [];
        this.slicer_v_pos = 0;
        this.slicer_h_pos = 0;



        // DEFAULT GRADIENT -- seems like gradients can only handle up to 14 values...
        this.gradientType = "radial-gradient";
        let empty = "#000000";
        this.colors = ["#6900FE", "#00C68F", "#00ff00"];
        this.percents = [13,76,100];
        this.depercents = [];


        // create initial knobs based on default values above
        console.log("Colors in default gradient = ", this.colors.length);
        for (var i = 0; i < this.colors.length; i++) {
            let percent = this.percents[i];
            let depercentify = (parseInt((percent * this.width) / 100)) - 20;
            this.depercents[i] = depercentify;
            this.addslice(depercentify, vertical, this.colors[i]);
        }

        // Why does't this work in the for loop??

        document.getElementById("grad-color-" + 0).value = this.colors[0];
        document.getElementById("grad-color-" + 1).value = this.colors[1];
        document.getElementById("grad-color-" + 2).value = this.colors[2];

        // reset the rest of properties
        this.reset(true);
        //this.craft_gradient_code();
    }

    reset(update_selected_element) {
      this.rowgaps    = 0;
      this.colgaps    = 0;
      this.cells      = new Array(75 * 75).fill(new Cell(0, 0, 0, 0, -1)); // 5,625 cells max
      this.slicepos   = { vertical: [], horizontal: [] }; // just the slice positions
      this.verticalslices   = []; // array of Slice objects (vertical)
      this.horizontalslices = []; // array of Slice objects (horizontal)
      this.verticalslicescopy = [];
      this.horizontalslicescopy = [];
      // cells
      this.vertical = [];
      this.horizontal = [];
      this.slicer_v_pos = 0;
      this.slicer_h_pos = 0;
      this.paste();

      if (update_selected_element) this.craft_gradient_code();
    }

    clopy_to_clipboard() {
        console.log("grid.clopy_to_clipboard()");
    }
    populate() {

        this.cells = [];
        let index  = 0;
        let html   = ``;

        this.vertical = [];
        this.horizontal = [];

        this.vertical.push(0); this.slicepos.vertical.forEach((v) => { this.vertical.push(v) });
        this.vertical.push($(container).width());

        this.horizontal.push(0); this.slicepos.horizontal.forEach((v) => { this.horizontal.push(v) });
        this.horizontal.push($(container).height());

        this.verticalslices.sort(sort);
        this.horizontalslices.sort(sort);

        this.vertical.sort(sort);
        this.horizontal.sort(sort);

        index = 0;
        let h = [];
        for (let y = 0; y < this.horizontal.length - 1; y++, index++) {
            let top = this.horizontal[y];
            let height = this.horizontal[index + 1] - this.horizontal[index];
            h[index] = { top: top, height: height };
        }

        index = 0;
        let v = [];
        for (let x = 0; x < this.vertical.length - 1; x++, index++) {
            let left = this.vertical[x];
            let width = this.vertical[index + 1] - this.vertical[index];
            v[index] = { left: left, width: width };
        }

        let I = 0;
        for (let y = 0; y < this.horizontal.length - 1; y++) {
            for (let x = 0; x < this.vertical.length - 1; x++, I++) {
                let left = this.vertical[x];
                let top = this.horizontal[y];
                let width = this.vertical[x + 1] - this.vertical[x];
                let height = this.horizontal[y + 1] - this.horizontal[y];
                this.cells[I] = new Cell(left, top, width, height, I, x, y);
                html += this.cells[I].html();
            }
        }
        //document.getElementById('cells-layer').innerHTML = html;
    }
    rescale_v_cells() {
        for (let y = 0; y < this.slicepos.height.length; y++) {
            for (let x = 0; x < this.slicepos.vertical.length; x++) {
                //this.cells.x =
            }
        }
    }
    delete_v(index) { this.verticalslices.splice(index, 1); this.slicepos.vertical.splice(index, 1); removedraggers(); this.populate(); this.paste(); this.craft_gradient_code(); }
    delete_h(index) { this.horizontalslices.splice(index, 1); this.slicepos.horizontal.splice(index, 1); removedraggers(); this.populate(); this.paste(); this.craft_gradient_code(); }
    bumper_test_v() { // This function slides all knobs left or right depending on how the user moves the clicked knob on the horizontal (top) pane
        if (drag_v.direction < 0)
            for (let index = drag_v.index; index > -1; index--) { // < //
                let thisx = grid.slicepos.vertical[index];
                let prevx = grid.slicepos.vertical[index - 1];
                if (prevx + KNOBSIZE >= thisx) grid.slicepos.vertical[index - 1] = thisx - KNOBSIZE;
            }
        if (drag_v.direction > 0)
            for (let index = drag_v.index; index < this.slicepos.vertical.length; index++) { // > //
                let thisx = grid.slicepos.vertical[index];
                let nextx = grid.slicepos.vertical[index + 1];
                if (nextx <= thisx + KNOBSIZE) grid.slicepos.vertical[index + 1] = thisx + KNOBSIZE;
        }
        for (let index = 0; index < this.slicepos.vertical.length; index++) { // update all //
            if (index != drag_v.index) { // skip the know that is being dragged
                let pos = grid.slicepos.vertical[index];
                this.verticalslices[index].position = pos;

                $(`div[data-index=V` + index + `]`)[0].style.left = (pos) + 'px';
                $(`div[data-id=h-dragger-` + index + `]`)[0] ? $(`div[data-id=h-dragger-` + index + `]`)[0].style.left = (pos) + 'px' : null;
                $(`div#delete-h-` + index)[0].style.left = (pos) + 'px';
            }
        }
        //this.slicepos.vertical.sort(sort);
        //this.slicepos.horizontal.sort(sort);
        //this.print();
        //
        this.populate();
        this.craft_gradient_code();
    }
    // memorize old positions right before the rescale takes place
    copy_v_slices() { window.copy_v_made = true; this.verticalslicescopy = []; this.verticalslices.forEach((slice, index) => {
        this.verticalslicescopy[index] = new Slice(vertical, slice.position); }); this.slicer_v_pos = parseInt($('#verticalslicer').css('left')); }
    copy_h_slices() { window.copy_h_made = true; this.horizontalslicescopy = []; this.horizontalslices.forEach((slice, index) => {
        this.horizontalslicescopy[index] = new Slice(horizontal, slice.position); }); this.slicer_h_pos = parseInt($('#horizontalslicer').css('top')); }
    // rescale all vertical slices, when user modifies container width
    rescale_v_slice(was, is) {
        removedraggers();
        let scale = is / was;
        this.verticalslices.forEach((value, index) => {
            let width = this.verticalslicescopy[index].position * scale;
            // 1. rescale vertical slices to a new width
            this.slicepos.vertical[index] = this.verticalslices[index].position = width;
            // 2. rescale all cells down the row --- for now, we simply this.populate(),
            // and everything rescales, but the following solution
            // would be more efficient [ currently disabled ]:
            for (let y = 0; y < this.vertical.length; y++) {
                let tag = '#cell-xy-' + y + '-' + index;
                //$(tag).css({left: this.vertical[y] + 'px'});
                //let new_width = this.vertical[y + 1] - this.vertical[y];
                //$(tag).width(new_width);
                //$(tag).css({background:'yellow'});
                $('#verticalslicer').css('left', this.slicer_v_pos * scale);
                this.width = is;
            }
        });
        this.width = is;
        this.populate();
        this.paste(); // sluggish (implement above # .2 )
        this.craft_gradient_code();
    }
    // rescale all horizontal slices, when user modifies container height
    rescale_h_slice(was, is) {
        removedraggers();
        let scale = is / was;
        this.horizontalslices.forEach((value, index) => {
            let height = this.horizontalslicescopy[index].position * scale;
            // 1. rescale horizontal slices to a new height
            this.slicepos.horizontal[index] = this.horizontalslices[index].position = height;
        });
        $('#horizontalslicer').css('top', this.slicer_h_pos * scale);
        this.height = is;
        this.populate();
        this.paste();
        this.craft_gradient_code();
    }
    list2slices(array, dir) {
        array.sort(sort);
        if (dir == vertical) { this.verticalslices = []; array.forEach((value) => { this.verticalslices.push(new Slice(vertical, value)) } );  }
        if (dir == horizontal) { this.horizontalslices = []; array.forEach((value) => { this.horizontalslices.push(new Slice(horizontal, value)) } ); }
        removedraggers();
    }
    set_width(value) { $(container).width(this.width = parseInt(value)); /*$("#dimensions").html($('#container').width() + " x " + $('#container').height()  );*/ }
    set_height(value) { $(container).height(this.height = parseInt(value)); /*$("#dimensions").html($('#container').width() + " x " + $('#container').height());*/ }
    source() {
        let I = ``;
        for (let i = 0; i < this.items.count; i++) I += `    <div style = 'width: ` + this.items.widths[i] + `; height: ` + this.items.heights[i] + `'>` + (i + 1) +  `</div>\r\n`;
        return src;
    }
    makelist() {
        let list = ``;
        return list;
    }
    makegrid(list) {
        return ``;
    }
    addslice(position, which) {
        if (window.cutterAvailable) {
            position = parseInt(position);
            if (which == horizontal) {
                this.slicepos.horizontal.push(position); // add a new slice position
                let array = this.slicepos.horizontal.sort(sort).filter(function(item, pos, ary) { return !pos || item != ary[pos - 1]; }); // sort and remove duplicates at the same time
                this.list2slices(array, horizontal); // build slice objects from numeric array
            }
            if (which == vertical) {
                this.slicepos.vertical.push(position); // add a new slice position
                let array = this.slicepos.vertical.sort(sort).filter(function(item, pos, ary) { return !pos || item != ary[pos - 1]; }); // sort and remove duplicates at the same time
                this.list2slices(array, vertical); // build slice objects from numeric array
            }
            this.paste();

            // insignificant calls:
            resizeverticallines(); resizehorizontallines();
        }
        this.craft_gradient_code();
    }
    setsomething(val) { this.paste(); }
       add() { this.items.count++; this.paste(); }
    remove() { if (this.items.count > 0) this.items.count--; this.paste(); }
     paste() {
        let v = ``
        let h = ``;
        if (this.horizontalslices) { $(".deleteme-h").remove(); this.horizontalslices.forEach(function(s ,i) { h += s.html(i) } ) }
        if (this.verticalslices)   { $(".deleteme-v").remove(); this.verticalslices.forEach(function(s, i)   { v += s.html(i) } ) }
        document.getElementById('paneL').innerHTML = h + `<div id = "horizontalslicer" style = 'top:` + parseInt($('#horizontalslicer').css("top")) + `'>
            <div id = "cutlineW"></div><div class = "little-arrow" style = "top: -5px; left: 67px; transform: rotate(-90deg)"></div></div>`;
        document.getElementById('paneT').innerHTML = v + `<div id = "verticalslicer" style = 'height: 20px; left:` + parseInt($('#verticalslicer').css("left")) + `'>
            <div id = "cutlineH"></div><div class = "little-arrow" style = "left: -6px; top: 43px;"></div></div>`;
    }

    // Generates a gradient value from gradient slices, and updates selected object and toolbox gradient preview
    // * Re-populates grid.color array based on this.slicepos.vertical.length
    craft_gradient_code() {
        console.log("craft_gradient_code");
        let gradient_code = "90deg";
        let specimen = window.selectedElement;
        if (specimen) specimen.setAttribute("data-gradient-length", this.slicepos.vertical.length);
        this.slicepos.vertical.sort(sort); // sort gradient
        for (let i = 0; i < this.slicepos.vertical.length; i++) {
          let num = parseInt(this.slicepos.vertical[i]);
          let percent = parseInt((100 * num) / this.width);
          this.percents[i] = percent;
          gradient_code += ", " + this.colors[i] + " " + percent + "%";
          if (window.selectedElement) { // copy individual gradient attributes to this element (for updating gradient editor when element is clicked again)
            //console.log("specimen ok!", i)
            window.selectedElement.setAttribute("data-gradient-" + i, this.colors[i]);
            window.selectedElement.setAttribute("data-gradient-percent-" + i, percent);
          }
        }
        console.log("generated gradient = " + gradient_code);
        let grad = "linear-gradient(" + gradient_code + ")";
        document.getElementById("dimensions").style.background = grad;
        document.getElementById("specimen_corners").style.background = grad;
        $("#gradient_code").text(document.getElementById("gradient_code").style.background);
        if (specimen) {
            // copy and paste current gradient into css style of selected element from toolbox editor
            specimen.style.background = document.getElementById("specimen_corners").style.background;
        }
        //document.getElementById("dimensions").style.background = grad;
        return grad;
    }

    add_gradient_to_selected_element() {

    }

    print() {
        let text = ``;
        let sliceposvlist = ``;
        let sliceposhlist = ``;
        this.slicepos.vertical.sort(sort);
        this.slicepos.horizontal.sort(sort);
        for (let i = 0; i < this.slicepos.vertical.length; i++) { sliceposvlist += parseInt(this.slicepos.vertical[i]) + ','; }
        for (let i = 0; i < this.slicepos.horizontal.length; i++) { sliceposhlist += parseInt(this.slicepos.horizontal[i]) + ','; }
        text += `this.slicepos.vertical.length = ` + this.slicepos.vertical.length + `\r\n`;
        text += `this.slicepos vertical = ` + sliceposvlist + `\r\n`;
        if (drag_v.active) text += `drag_v.index = ` + drag_v.index + `\r\n`; else text += `drag_v.index = NOT ACTIVE\r\n`;
        text += `direction = ` + drag_v.direction + ` \r\n`;
        $('#debug').text(text);
    }
};

function aligndimensions() { $("#dimensions").css( { /* marginTop: parseInt($('#container').height() / 2) - 15 */ } ); }
function resizehorizontallines() { $('.draggerH').width($('#container').width()); }
function resizeverticallines()   { $('.draggerV').height($('#container').height()); }
function removedraggers() { $(".draggerV", $(container)).remove(); $(".draggerH", $(container)).remove(); }

$(document).ready(function() {

    window.grid = new Gradient( "gradient", "gradient-id", 1200, 250, "100px", "100px", 1, '50px', '50px', 'column' );

    let colorpickers = document.getElementsByClassName("colorpicker");

    // setInterval(() => { grid.print(); }, 50);

    // toggle h/v cutters visibility, but only if a slicer is not being dragged ( drag_h.active / drag_v.active )
    $(".verticalsplitter").live("mouseover",   function() { if (!drag_v.active) { $("#verticalslicer").hide(); window.cutterAvailable = false; } } );
    $(".verticalsplitter").live("mouseout",    function() { if (!drag_v.active) { $("#verticalslicer").show();  window.cutterAvailable = true; } } );
    $(".horizontalsplitter").live("mouseover", function() { if (!drag_h.active) { $("#horizontalslicer").hide(); window.cutterAvailable = false; } } );
    $(".horizontalsplitter").live("mouseout",  function() { if (!drag_h.active) { $("#horizontalslicer").show();  window.cutterAvailable = true; } } );


    $(".colorpicker").live("change", (event) => {
        window.grid.colors[event.target.attributes[0].value.split("-")[2]] = event.target.value;
        window.grid.craft_gradient_code();
    });


    /*
    $(".verticalsplitter").live("mouseover",   function() { $("#dimensions").html("Click to move or Double-click to name this line"); });
    $(".verticalsplitter").live("mouseout",    function() { $("#dimensions").html($('#container').width() + " x " + $('#container').height()); });
    $(".horizontalsplitter").live("mouseover", function() { $("#dimensions").html("Click to move or Double-click to name this line"); });
    $(".horizontalsplitter").live("mouseout",  function() { $("#dimensions").html($('#container').width() + " x " + $('#container').height()); });
    */

    //$("#dimensions").html($('#container').width() + " x " + $('#container').height());

    $("#paneT").on("mousedown", function(e) { let x = e.pageX - $(container).offset().left; window.grid.addslice(x, vertical); grid.populate(); });
    $("#paneL").on("mousedown", function(e) { let y = e.pageY - $(container).offset().top; window.grid.addslice(y, horizontal); grid.populate(); });
    $("#paneT").on("mousemove", function(e) { let x = e.pageX - $(container).offset().left; $("#verticalslicer").css({"left": x + 'px'}); });
    $("#paneL").on("mousemove", function(e) { let y = e.pageY - $(container).offset().top; $("#horizontalslicer").css({"top": y + 'px'}); });

    aligndimensions();

    $("#dragwidth").on("mousedown", function(e) {
        window.lastW     = $("#container").width();
        window.resizingW = true;
        window.drag_x    = e.pageX;
        window.drag_y    = e.pageY;
        grid.copy_v_slices();
    });
    $("#dragheight").on("mousedown", function(e) {
        window.lastH     = $("#container").height();
        window.resizingH = true;
        window.drag_x    = e.pageX;
        window.drag_y    = e.pageY;
        grid.copy_h_slices();
    })
    $("#corner").on("mousedown", function(e) {
        window.lastW     = $("#container").width();
        window.lastH     = $("#container").height();
        window.resizingH = true;
        window.resizingW = true;
        window.drag_x    = e.pageX;
        window.drag_y    = e.pageY;
    });
    // initiate vertical drag
    $(".verticalsplitter").live("mousedown", function(e) {

        if (drag_v.active == false) {
            let object = this;
            let index = object.getAttribute("i");
            //console.log(index);
            let position = parseInt(object.style.left);
            let length = grid.slicepos.vertical.length;
            drag_v = new Drag(object, index, position, 18, length, true);
            $(".verticalsplitter[data-index=V" + index + "]").addClass("dashed");
            //$(".verticalsplitter[data-index=V" + index + "]").stop().animate({height: "+=10"}, 300, 'easeOutBounce');
            window.drag_x = e.pageX; // mremorize current mouse position
            drag_v.active = true;
        }
        if (drag_h.active == false) {

        }
    });
    // release mouse, reset all UI states
    $("body").on("mouseup", function() {
        window.dragging  = false;
        window.resizingW = false;
        window.resizingH = false;
        $(".verticalsplitter[data-index=V" + drag_v.index + "]").removeClass("dashed");
        $(".horizontalsplitter[data-index=H" + drag_v.index + "]").removeClass("dashed");
        if (drag_v.active && drag_v.target != -1) { // target = -1 means dragger was clicked, but not yet moved
            let index = drag_v.index;
            if (grid.verticalslices && grid.verticalslices[index])
                grid.slicepos.vertical[index] = grid.verticalslices[index].position = drag_v.target;
            //removedraggers();
            //grid.paste();
        }
        if (drag_v.active) drag_v.active = false;
    });
    $("body").mousemove(function(e) {
        window.mx = e.pageX;
        window.my = e.pageY;

        if (drag_v.active) { // user is dragging a vertical splitter in grid edit mode
            let diffX = parseInt(window.mx - window.drag_x);
            if (diffX < 0) drag_v.direction = -1;
            if (diffX > 0) drag_v.direction = 1;
            drag_v.object.style.left = drag_v.target = grid.slicepos.vertical[drag_v.index] = drag_v.position + diffX;
            $("#delete-h-" + drag_v.index).css( { left: drag_v.target + "px" } );
            $("div[data-id=h-dragger-" + drag_v.index + "]").css( { left: drag_v.target + "px" } );
            grid.bumper_test_v();
        }

        if (window.resizingH) { // user is resizing the view in grid edit mode
            let diff = parseInt(window.lastH + window.my - window.drag_y);
            $("#container").height(diff);
            let is_w = $('#container').width();
            let is_h = $('#container').height();
            //$("#dimensions").html(is_w + " x " + is_h);
            grid.rescale_h_slice(window.lastH, is_h);
            aligndimensions();
        }
        if (window.resizingW) { // user is resizing the view in grid edit mode
            let diff = parseInt(window.lastW + (window.mx - window.drag_x) * 1.95);
            $("#container").width(diff);
            let is_w = $('#container').width();
            let is_h = $('#container').height();
            //$("#dimensions").html(is_w + " x " + is_h);
            grid.rescale_v_slice(window.lastW, is_w);
            aligndimensions();
        }
        if (window.dragging) { // we're dragging an object (a cell, for example)
            let diffX = window.drag_width = parseInt(window.item_width + window.mx - window.drag_x);
            let diffY = window.drag_height = parseInt(window.item_height + window.my - window.drag_y);
            $(window.dragging_target).css({ width: diffX + 'px', height: diffY + 'px'});
        }
        resizeverticallines();
        resizehorizontallines();
    });
});

function selectbutton(object) { $('.button').removeClass('button-selected'); $(object).addClass('button-selected'); window.grid.set_width(object.value) }
