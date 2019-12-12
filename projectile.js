class Projectile {
    constructor(x, y, dir) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.fromAngle(dir);
        this.vel.setMag(0.2);
        this.orientation = dir;
        this.w = 7;
        this.h = 20;
        this.cr = 5;
        this.bounced = true;
        this.MAXSPEED = 0.2;
    }

    bounceOff(v) {
        if(v) {
            this.orientation = this.orientation + (Math.PI - 2 * this.orientation);
        } else {
            this.orientation = -this.orientation;
        }
        this.bounced = true;
    }

    checkCollision(p) {
        if(p) {
            let d = p.pos.dist(this.pos);
            if(p !== this && d < this.cr*2) {
                return true;
            }  
        }
        
        return false;
    }

    update(dt) {
        this.vel = p5.Vector.fromAngle(this.orientation);
        this.vel.setMag(this.MAXSPEED);
        this.pos.add(this.vel.mult(dt));
        this.vel.setMag(this.MAXSPEED);  
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

    getAsLines() {
        let line1 = { a: {x: this.pos.x          , y: this.pos.y},
                      b: {x: this.pos.x + this.w , y: this.pos.y}};
        let line2 = { a: {x: this.pos.x + this.w , y: this.pos.y},
                      b: {x: this.pos.x + this.w , y: this.pos.y + this.h}};
        let line3 = { a: {x: this.pos.x + this.w , y: this.pos.y + this.h},
                      b: {x: this.pos.x          , y: this.pos.y + this.h}};
        let line4 = { a: {x: this.pos.x          , y: this.pos.y + this.h},
                      b: {x: this.pos.x          , y: this.pos.y}};

        return [line1,line2,line3,line4];
    }
}