class Tank {
    constructor(x,y,dir) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.orientation = dir;
        this.rotation = 0;

        this.turret = new TankTurret(this.pos.x, this.pos.y, this.orientation);
    }

    handleInputs() {

        if(keyIsDown(UP_ARROW)) {

            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(0.2); 

        } else if(keyIsDown(DOWN_ARROW)) {

            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(0.2);  
        }
        
        if(keyIsDown(RIGHT_ARROW)) {
            this.rotation += 0.002;
        }
        
        if(keyIsDown(LEFT_ARROW)) {
            this.rotation -= 0.002;                
        }

        //turn Turret
        if(keyIsDown(68)) {
            this.turret.rotate(0.002);
        }
        
        if(keyIsDown(65)) {
            this.turret.rotate(-0.002);                        
        }
    }

    update(dt) {
        this.handleInputs();   

        this.pos.add(this.vel.mult(dt));
        this.orientation += this.rotation * dt;

        this.rotation = 0;
        this.vel.mult(0);
        
        this.turret.update(this.pos.x, this.pos.y, dt);
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

        this.turret.show();
    }
}