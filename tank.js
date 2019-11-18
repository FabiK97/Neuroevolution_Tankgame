class Tank {
    constructor(x,y,dir, brain) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.orientation = dir;
        this.rotation = 0;
        this.MAXROTATION = 0.1;
        this.w = 60;
        this.h = 50;
        this.cr = 25;

        this.turret = new TankTurret(this.pos.x, this.pos.y, this.orientation);
        this.projectiles = [];
        this.enemy = null;
        this.angletoenemy;

        this.firerate = 1000;
        this.timer = 0;
        this.bottimer = 0;

        this.isWinner = false;
        this.hitCount = 1;
        this.shootCount = 4;

        this.died = false;
        this.isPlayerTank = true;
        this.isBot = false;
        this.blue = false;
        this.botdir = true;
        this.controls = 0;
        if(brain) {
            this.brain = brain.copy();
        } else {
            this.brain = new NeuralNetwork(11,20, 15,3);
        }
        this.inputs = [];
        this.score = 0;
        this.time = 0;
    }

    static get ARROW_KEYS() {
        return 0;
    }
    static get WASD() {
        return 1;
    }

    mutate() {
        this.brain.mutate(0.04);
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
            this.rotation += 0.004;
        }
        
        if((this.controls == 0 && keyIsDown(LEFT_ARROW)) || (this.controls == 1 && keyIsDown(65))) {
            this.rotation -= 0.004;                
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

        /* if(outputs[0] > 0.5) {

            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(0.2); 

        } else if(outputs[1] > 0.5) {

            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(0.2);  
        }
         */

        let speed = map(outputs[0], 0, 1, -1, 1);
        if(speed>0) {
            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(Math.abs(speed)*0.2); 
        } else {
            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(Math.abs(speed)*0.2);
        }

        /* if(outputs[2] > 0.5) {
            this.rotation = 0.004;
            this.turret.rotate(0.004);
        }
        
        if(outputs[3] > 0.5) {
            this.rotation = -0.004;   
            this.turret.rotate(-0.004);                        
        } */

        let angle = map(outputs[1], 0, 1, -this.MAXROTATION, this.MAXROTATION);
        this.rotation = angle;
        this.turret.rotate(angle);

        //shoot
        if(outputs[2] > 0.7) {
            if(this.enemy.brain) {
                if(this.projectiles.length == 0) {
                    this.shoot();
                    this.shootCount++;
                }
            } else {
                if(this.timer > this.firerate) {
                    this.shoot();
                    this.shootCount++;
                    this.timer = 0;
                }
            }
        }
       
    }

    botControl(dt) {
        
        //moving up and down

        /* if(this.pos.y < 100) {
            this.botdir = false;
            this.bottimer = 0;
            this.pos.y = 101;
        }

        if(this.pos.y > game_height - 100) {
            this.botdir = true;
            this.bottimer = 0;
            this.pos.y = game_height - 101;

        }

        if(this.bottimer > 2000) {
           if(this.botdir) {
                this.vel = p5.Vector.fromAngle(this.orientation);
            } else {
                this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            } 
            this.vel.setMag(0.1);  
        } else {
            this.bottimer += dt;
            this.vel.mult(0);
        } */

        //shooting at AI
        
        let dist = p5.Vector.sub(this.enemy.pos, this.pos);
        let distangle = Math.atan2(dist.y, dist.x);
        this.turret.orientation = distangle;
        
        if(this.projectiles.length == 0) {
            this.shoot();
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

    updateInputs() {
        this.inputs = [];
        //My Position
        this.inputs.push(map(this.pos.x, 0, game_width, 0, 1));
        this.inputs.push(map(this.pos.y, 0, game_height, 0, 1));

        //My Velocity
        this.inputs.push(map(this.vel.x, 0, 0.2, 0, 1));
        this.inputs.push(map(this.vel.y, 0, 0.2, 0, 1));

        //My Direction
        this.inputs.push(map(this.orientation, 0, 2*Math.PI, 0, 1));

        //My Turretdirection
       /*  let turdir = this.turret.orientation % (2*Math.PI);
        this.inputs.push(map(turdir, 0, 2*Math.PI, -1, 1));
         */
        //Projectile Position
        /* if(this.projectiles.length > 0) {
            this.inputs.push(map(this.turret.pos.x, 0, game_width, 0, 1));
            this.inputs.push(map(this.turret.pos.y, 0, game_height, 0, 1));
        } else {
            this.inputs.push(map(this.pos.x, 0, game_width, 0, 1));
            this.inputs.push(map(this.pos.y, 0, game_height, 0, 1));
        } */

        //Enemy Tank Position
        this.inputs.push(map(this.enemy.pos.x, 0, game_width, 0, 1));
        this.inputs.push(map(this.enemy.pos.y, 0, game_height, 0, 1));

        //Enemy Tank Velocity
        this.inputs.push(map(this.enemy.vel.x, 0, game_width, 0, 1));
        this.inputs.push(map(this.enemy.vel.y, 0, game_height, 0, 1));

        //angle to enemy
        let dist = p5.Vector.sub(this.enemy.pos, this.pos);
        let distangle = Math.atan2(dist.y, dist.x);
        this.angletoenemy = this.orientation - distangle;
        this.inputs.push(map(this.angletoenemy, 0, 2*Math.PI, 0, 1));

        //position of enemy projectiles
       /*  if(this.enemy.projectiles[0]){
            this.inputs.push(map(this.enemy.projectiles[0].pos.x, 0, game_width, 0, 1));
            this.inputs.push(map(this.enemy.projectiles[0].pos.y, 0, game_height, 0, 1));
        } else {
            this.inputs.push(1);
            this.inputs.push(1);
        }  */

        //distance to enemy projectiles
        if(this.enemy.projectiles[0] && this.enemy.isPlayerTank){
            let dist = p5.Vector.dist(this.enemy.projectiles[0].pos, this.pos);
            let max  = Math.sqrt(game_width*game_width + game_height*game_height);
            dist = map(dist, 0, max, 0, 1);
            console.log(dist);
            this.inputs.push(dist);
        } else {
            this.inputs.push(1);
        }
        


    }

    update(dt) {
        this.vel.mult(0);
        
        if(this.isPlayerTank) {
            this.handleInputs(dt);
        } else {
            if(this.isBot) {
                this.botControl(dt);
            } else {
                this.updateInputs();
                let outputs = this.brain.predict(this.inputs);
                this.aiControl(dt, outputs);
            }
        }
   

        this.pos.add(this.vel.mult(dt));
        this.orientation += this.rotation * dt;
        this.orientation = this.orientation % (2*Math.PI);

        this.rotation = 0;
        
        this.turret.update(this.pos.x, this.pos.y, dt);
        this.projectiles.forEach(p => {
            p.update(dt);
        })

        this.timer += dt;
        if(!this.died) this.score++;
    }

    show() {
        push();
            noStroke();
            if(!this.blue) {
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