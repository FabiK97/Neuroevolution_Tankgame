class Projectile {
    constructor(x, y, dir) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(dir);
        this.vel.setMag(0.2);
        this.orientation = dir;
        this.w = 7;
        this.h = 20;
        this.cr = 5;
        this.bounced = false;
        console.log(dir % Math.PI*2);
    }

    bounceOff(v) {
        if(v) {
            this.orientation = this.orientation + (Math.PI - 2 * this.orientation);
        } else {
            this.orientation = -this.orientation;
        }
        this.bounced = true;
    }

    update(dt) {
        this.vel = p5.Vector.fromAngle(this.orientation);
        this.vel.setMag(0.2);
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
            rect(0,0,this.h,this.w);
        pop();
    }
}