class Obstacle {
    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    checkCollision(obj) {
        if(obj instanceof Tank) {
            if (obj.pos.x - obj.w/2 < this.x + this.w &&
                obj.pos.x + obj.w/2 > this.x &&
                obj.pos.y - obj.h/2 < this.y + this.h &&
                obj.pos.y + obj.h/2 > this.y) {
                 console.log("collision!");
             }

        } else if(obj instanceof Projectile) {
            if (obj.pos.x - obj.w/2 < this.x + this.w &&
                obj.pos.x + obj.w/2 > this.x &&
                obj.pos.y - obj.h/2 < this.y + this.h &&
                obj.pos.y + obj.h/2 > this.y) {
                 obj.bounceOff();
             }
        }
    }

    show() {
        noStroke();
        fill(0);
        rect(this.x, this.y, this.w, this.h);
    }
}