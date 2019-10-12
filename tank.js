class Tank {
    constructor(x,y,dir) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.orientation = dir;
        this.rotation = 0;
        this.w = 60;
        this.h = 50;
        this.cr = 25;

        this.turret = new TankTurret(this.pos.x, this.pos.y, this.orientation);
        this.projectiles = [];

        this.firerate = 250;
        this.timer = 0;
    }

    handleInputs() {
        let SPACE_KEY = 32;
        let A_KEY = 68;
        let D_KEY = 65;

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
        if(keyIsDown(A_KEY)) {
            this.turret.rotate(0.002);
        }
        
        if(keyIsDown(D_KEY)) {
            this.turret.rotate(-0.002);                        
        }

        //shoot
        if(keyIsDown(SPACE_KEY)) {
            if(this.timer > this.firerate) {
                this.shoot();
                this.timer = 0;
            }
        }
    }

    shoot() {
        let pos = this.pos.copy();
        let diff = p5.Vector.fromAngle(this.turret.orientation);
        diff.setMag(40);
        pos = pos.add(diff);
        this.projectiles.push(new Projectile(pos.x,pos.y,this.turret.orientation));
    }

    update(dt) {
        this.handleInputs(dt);   

        this.pos.add(this.vel.mult(dt));
        this.orientation += this.rotation * dt;

        this.rotation = 0;
        this.vel.mult(0);
        
        this.turret.update(this.pos.x, this.pos.y, dt);
        this.projectiles.forEach(p => {
            p.update(dt);
        })
        this.timer += dt;
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
        this.projectiles.forEach(p => {
            p.show();
        })
    }
}