class Tank {
    constructor(x,y,dir) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.orientation = dir;
        this.rotation = 0;
    }

    handleInputs() {

        if(keyIsDown(UP_ARROW)) {

            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(0.5); 

        } else if(keyIsDown(DOWN_ARROW)) {

            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(0.5);  
        }
        
        if(keyIsDown(RIGHT_ARROW)) {
            this.rotation += 0.005;
        }
        
        if(keyIsDown(LEFT_ARROW)) {
            this.rotation -= 0.005;                
        }
    }

    update(dt) {
        this.handleInputs();   
             
        this.pos.add(this.vel.mult(dt));
        this.orientation += this.rotation * dt;
        this.rotation = 0;
        this.vel.mult(0);
    }

    show() {
        push();
        noStroke();
        fill(255);
        translate(this.pos.x, this.pos.y);
        rotate(this.orientation);
        rectMode(CENTER);
        rect(0,0,60,50);
        pop();
    }
}