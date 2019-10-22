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

        this.isWinner = false;
        this.isPlayerTank = true;
        this.controls = 0;

        this.brain = new NeuralNetwork(6, 12, 10, 7);
    }

    static get ARROW_KEYS() {
        return 0;
    }
    static get WASD() {
        return 1;
    }

    setControls(controls) {
        this.controls = controls;
    }

    handleInputs() {

        let SPACE_KEY = 32;
        if((this.controls == 0 && keyIsDown(UP_ARROW)) || (this.controls == 1 && keyIsDown(87))) {

            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(0.2); 

        } else if((this.controls == 0 && keyIsDown(DOWN_ARROW)) || (this.controls == 1 && keyIsDown(83))) {

            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(0.2);  
        }
        
        if((this.controls == 0 && keyIsDown(RIGHT_ARROW)) || (this.controls == 1 && keyIsDown(68))) {
            this.rotation += 0.002;
        }
        
        if((this.controls == 0 && keyIsDown(LEFT_ARROW)) || (this.controls == 1 && keyIsDown(65))) {
            this.rotation -= 0.002;                
        }

        //turn Turret
        if((this.controls == 0 && keyIsDown(189)) || (this.controls == 1 && keyIsDown(66))) {
            this.turret.rotate(0.002);
        }
        
        if((this.controls == 0 && keyIsDown(188)) || (this.controls == 1 && keyIsDown(67))) {
            this.turret.rotate(-0.002);                        
        }

        //shoot
        if((this.controls == 0 && keyIsDown(190)) || (this.controls == 1 && keyIsDown(86))) {
            if(this.timer > this.firerate) {
                this.shoot();
                this.timer = 0;
            }
        }
    }

    aiControl(dt, outputs) {

        if(outputs[0] > 0.5) {

            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(0.2); 

        } else if(outputs[1] > 0.5) {

            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(0.2);  
        }
        
        if(outputs[2] > 0.5) {
            this.rotation += 0.002;
        }
        
        if(outputs[3] > 0.5) {
            this.rotation -= 0.002;                
        }

        //turn Turret
        if(outputs[4] > 0.5) {
            this.turret.rotate(0.002);
        }
        
        if(outputs[5] > 0.5) {
            this.turret.rotate(-0.002);                        
        }

        //shoot
        if(outputs[6] > 0.5) {
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

    checkHit(p) {
        if(p) {
            let d = p.pos.dist(this.pos);
            if(d < this.cr + p.cr) {
                return true;
            }
        }
        return false;
    }

    checkTankCollision(tank) {
        if(tank !== this) {
           let d = tank.pos.dist(this.pos);
            if(d < this.cr*2) {
                return true;
            } 
        }
        return false;
    }

    update(dt) {
        let inputs = [];
        inputs.push(map(this.pos.x, 0, width, 0, 1));
        inputs.push(map(this.pos.y, 0, height, 0, 1));
        inputs.push(map(this.orientation, 0, 2*Math.PI, 0, 1));
        inputs.push(map(this.turret.orientation, 0, 2*Math.PI, 0, 1));
        
        if(this.projectiles.length > 0) {
            inputs.push(map(this.turret.pos.x, 0, width, 0, 1));
            inputs.push(map(this.turret.pos.y, 0, height, 0, 1));
        } else {
            inputs.push(map(this.pos.x, 0, width, 0, 1));
            inputs.push(map(this.pos.y, 0, height, 0, 1));
        }

        let outputs = this.brain.predict(inputs);

        if(this.isPlayerTank) {
            this.handleInputs(dt);
        } else {
            this.aiControl(dt, outputs);
        }
   

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
            if(!this.isPlayerTank) {
                fill(152, 76, 52);
            } else {
                fill(39, 72, 97);
            }
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