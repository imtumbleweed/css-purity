export class Mouse {
    constructor( view ) {               // takes instance of the view object (for updating status bar)
        this.view = view;
        this.current = {x: 0, y: 0};    // current mouse position on the screen, regardless of state
        this.memory = {x: 0, y: 0};     // memorized mouse position (for measuring dragging distance)
        this.difference = {x: 0, y: 0}; // difference
        this.inverse = {x: 0, y: 0};    // swapped
        this.dragging = false;
        document.body.addEventListener("mousedown", (e) => {
            if (this.dragging == false) {
                this.dragging = true;
                this.memory.x = this.current.x;
                this.memory.y = this.current.y;
                this.inverse.x = this.memory.x;
                this.inverse.y = this.memory.y;
            }
        });
        document.body.addEventListener("mouseup", (e) => {
            this.dragging = false;
            this.current.x = 0;
            this.current.y = 0;
            this.memory.x = 0;
            this.memory.y = 0;
            this.difference.x = 0;
            this.difference.y = 0;
            this.inverse.x = 0;
            this.inverse.y = 0;
        });
        document.body.addEventListener("mousemove", (e) => {
            this.current.x = e.pageX;
            this.current.y = e.pageY;
            if (this.dragging) {
                this.difference.x = this.current.x - this.memory.x;
                this.difference.y = this.current.y - this.memory.y;
                if (this.current.x < this.memory.x) this.inverse.x = this.current.x;
                if (this.current.y < this.memory.y) this.inverse.y = this.current.y;
            }
            this.view.updatestatus("Default", this.current.x, this.current.y);
        });
    }
};