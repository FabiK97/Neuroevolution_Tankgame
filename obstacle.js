class Obstacle {
    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    checkCollision(obj) {
             if(obj.pos.x > this.x && obj.pos.x < this.x + this.w) {
                 if(obj.pos.y - obj.cr < this.y + this.h && obj.pos.y + obj.cr > this.y + this.h) {
                    //horrizontal collision

                    if(obj instanceof Tank) {
                            obj.pos.y = this.y + this.h + obj.cr;
                    } else {
                        if(obj.bounced) {
                            return true;
                        } else {
                            obj.bounceOff(false);
                        }
                    }

                 } else  if(obj.pos.y - obj.cr < this.y && obj.pos.y + obj.cr > this.y) {
                    //horrizontal collision

                    if(obj instanceof Tank) {
                        obj.pos.y = this.y - obj.cr;
                    } else {
                    if(obj.bounced) {
                        return true;
                    } else {
                        obj.bounceOff(false);
                    }
                    }
                 }
             }

             if(obj.pos.y > this.y && obj.pos.y < this.y + this.h) {
                 if(obj.pos.x - obj.cr < this.x + this.w && obj.pos.x + obj.cr > this.y + this.w)  {
                    //vertical collision
                    if(obj instanceof Tank) {
                        obj.pos.x = this.x + this.w + obj.cr;
                    } else {
                        if(obj.bounced) {
                            return true;
                        } else {
                            obj.bounceOff(true);
                        }
                    }
                 } else if(obj.pos.x + obj.cr > this.x && obj.pos.x - obj.cr < this.x) {
                    //vertical collision
                    if(obj instanceof Tank) {
                        obj.pos.x = this.x - obj.cr;
                    } else {
                        if(obj.bounced) {
                            return true;
                        } else {
                            obj.bounceOff(true);
                        }
                    }
                 } 
             }
    }

    show() {
        noStroke();
        fill(0);
        rect(this.x, this.y, this.w, this.h);
    }
}