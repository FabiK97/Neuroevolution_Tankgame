class TankTurret {
    constructor(x,y,dir) {
        this.pos = createVector(x,y);
        this.orientation = dir;
        this.rotation = 0;
    }
    
    rotate(angle) {
        this.rotation = angle;
    }

    update(x,y,dt) {
        this.pos.x = x;
        this.pos.y = y;

        this.orientation += this.rotation * dt;
        this.rotation = 0;
    }

    show() {
        push();
            noStroke();
            fill(150);
            translate(this.pos.x, this.pos.y);
            rotate(this.orientation);
            ellipse(0, 0, 30,30);
            fill(100)
            rect(-5,-5, 40, 10);
        pop();
    }
}