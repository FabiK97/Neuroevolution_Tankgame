class Projectile {
    constructor(x, y, dir) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(dir);
        this.vel.setMag(0.2);
        this.orientation = dir;
    }

    update(dt) {
        this.pos.add(this.vel.mult(dt));
        this.vel.setMag(0.2);  
    }
    
    show() {
        push();
            stroke(255);
            fill(0);
            translate(this.pos.x, this.pos.y);
            rotate(this.orientation);
            rectMode(CENTER);
            rect(0,0,20,7);
        pop();
    }
}