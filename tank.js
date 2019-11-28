class Tank {
    constructor(x,y,dir, brain) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.orientation = dir;
        this.rotation = 0;
        this.MAXROTATION = 0.01;
        this.w = 60;
        this.h = 50;
        this.cr = 25;

        this.turret = new TankTurret(this.pos.x, this.pos.y, this.orientation);
        this.projectiles = [];
        this.enemy = null;
        this.angletoenemy;

        this.firerate = 1000; //in ms
        this.timer = 0;
        this.bottimer = 0;

        this.isWinner = false;
        this.hitCount = 1;
        this.shootCount = 4;
        this.notMovingCount = 0;
        this.notSpinningScore = 0;
        this.aimingScore= 0;


        this.died = false;
        this.isPlayerTank = true;
        this.isBot = false;
        this.blue = false;
        this.color = {R: random(0,200), G: random(0,200), B:random(0,200)};
        this.botdir = true;
        this.controls = 0;
        if(brain) {
            this.brain = brain.copy();
        } else {
            if(!this.isBot) {
                if(!HIDDEN_2) {
                    this.brain = new NeuralNetwork(INPUTS, HIDDEN_1, OUTPUTS);
                } else {
                    this.brain = new NeuralNetwork(INPUTS, HIDDEN_1, HIDDEN_2, OUTPUTS);
                }
            } 
        }
        this.inputs = [];
        this.score = 0;
        this.time = 0;

        this.inputConfig = {
            "position-x": true,
            "position-y": true,
            "velocity-x": true,
            "velocity-y": true,
            "direction": true,
            "enemy-position-x": false,
            "enemy-position-y": false,
            "enemy-velocity-x": false,
            "enemy-velocity-y": false,
            "angle-to-enemy": true,
            "projectile-position-x": false,
            "projectile-position-y": false,
        };
        this.botMode = BOT_MODE;
        this.outputMode = "mapped";
    }

    static get ARROW_KEYS() {
        return 0;
    }
    static get WASD() {
        return 1;
    }

    mutate() {
        this.brain.mutate(MUTATION_RATE);
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

        /* let dist = p5.Vector.sub(this.enemy.pos, this.pos);
        let distangle = dist.heading();
        this.angletoenemy = this.orientation - distangle;
        if(this.angletoenemy > Math.PI) {
            this.angletoenemy -= 2*Math.PI;
        } else if(this.angletoenemy < -Math.PI) {
            this.angletoenemy += 2*Math.PI;
        } 
        let mappedangle = map(this.angletoenemy, -Math.PI, Math.PI, 0, 1);

        console.log("angleofenemy", distangle*180/Math.PI);
        console.log("orientation", this.orientation*180/Math.PI);
        console.log("angletoenemy", this.angletoenemy*180/Math.PI); */

        
    }

    aiControl(dt, outputs) {

        switch (this.outputMode) {
            case "binary":
                
                if(outputs[0] > 0.5) { //move forwards
        
                    this.vel = p5.Vector.fromAngle(this.orientation);
                    this.vel.setMag(0.2); 
        
                } else if(outputs[1] > 0.5) { //move backwards
        
                    this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
                    this.vel.setMag(0.2);  
                }
                
        
        
                if(outputs[2] > 0.5) { //turn right
                    this.rotation = 0.004;
                    this.turret.rotate(0.004);
                }
                
                if(outputs[3] > 0.5) { //turn left
                    this.rotation = -0.004;   
                    this.turret.rotate(-0.004);                        
                }

                //shoot
                if(outputs[2] > 0.7) {
                    if(!this.enemy.isBot && !this.enemy.isPlayerTank) {
                        if(this.projectiles.length == 0 && this.timer > this.firerate) {
                            this.shoot();
                            this.shootCount++;
                            this.timer = 0;
                        }
                    } else {
                        if(this.timer > this.firerate) {
                            this.shoot();
                            this.shootCount++;
                            this.timer = 0;
                        }
                    }
                }

                break;
        
            case "mapped":

                let speed = map(outputs[0], 0, 1, -1, 1);
                if(speed>0) {
                    this.vel = p5.Vector.fromAngle(this.orientation);
                    this.vel.setMag(Math.abs(speed)*0.2); 
                } else {
                    this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
                    this.vel.setMag(Math.abs(speed)*0.2);
                }

                let angle = map(outputs[1], 0, 1, -this.MAXROTATION, this.MAXROTATION);
                this.rotation = angle;
                this.turret.rotate(angle);
        
                //shoot
                if(outputs[2] > 0.7) {
                    if(!this.enemy.isBot && !this.enemy.isPlayerTank) {
                        if(this.projectiles.length == 0 && this.timer > this.firerate) {
                            this.shoot();
                            this.shootCount++;
                            this.timer = 0;
                        }
                    } else {
                        if(this.timer > this.firerate) {
                            this.shoot();
                            this.shootCount++;
                            this.timer = 0;
                        }
                    }
                }

                break;
        }

       
    }

    botControl(dt) {
        switch(this.botMode) {
            case "stationary":
                break;
            case "moving-x":
                    if(this.pos.x < 40) {
                        this.botdir = true;
                        this.bottimer = 0;
                        this.pos.x = 45;
                    }
            
                    if(this.pos.x > game_width - 40) {
                        this.botdir = false;
                        this.bottimer = 0;
                        this.pos.x = game_width - 45;
                    }
            
                    if(this.bottimer > 4000) {
                       if(this.botdir) {
                            this.vel = p5.Vector.fromAngle(this.orientation);
                        } else {
                            this.vel = p5.Vector.fromAngle(this.orientation - Math.PI);
                        } 
                        this.vel.setMag(0.2);  
                    } else {
                        this.bottimer += dt;
                        this.vel.mult(0);
                    }
                break;
            case "moving-y":
                    if(this.pos.y < 40) {
                        this.botdir = false;
                        this.bottimer = 0;
                        this.pos.y = 41;
                    }
            
                    if(this.pos.y > game_height - 40) {
                        this.botdir = true;
                        this.bottimer = 0;
                        this.pos.y = game_height - 41;
            
                    }
            
                    if(this.bottimer > 4000) {
                       if(this.botdir) {
                            this.vel = p5.Vector.fromAngle(this.orientation);
                        } else {
                            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
                        } 
                        this.vel.setMag(0.1);  
                    } else {
                        this.bottimer += dt;
                        this.vel.mult(0);
                    }
                break;
            case "wandering":
                break;
            case "stationary-shooting":
                    let dist = p5.Vector.sub(this.enemy.pos, this.pos);
                    let distangle = Math.atan2(dist.y, dist.x);
                    this.turret.orientation = distangle;
                    
                    if(this.projectiles.length == 0) {
                        this.shoot();
                    }
                break;
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

    checkAiming() {
        if(this.angletoenemy > -0.8 && this.angletoenemy < 0.8) {
            this.aimingScore += Math.pow(500,(1-Math.abs(this.angletoenemy)))/500;
            //console.log("aim", Math.pow(1000,(1-Math.abs(this.angletoenemy)))/1000);
        }

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
        if(this.inputConfig["position-x"]) this.inputs.push(map(this.pos.x, 0, game_width, 0, 1));
        if(this.inputConfig["position-y"]) this.inputs.push(map(this.pos.y, 0, game_height, 0, 1));

        //My Velocity
        if(this.inputConfig["velocity-x"]) this.inputs.push(map(this.vel.x, 0, 0.2, 0, 1));
        if(this.inputConfig["velocity-y"]) this.inputs.push(map(this.vel.y, 0, 0.2, 0, 1));

        //My Direction
        if(this.inputConfig["direction"]) this.inputs.push(map(this.orientation, 0, 2*Math.PI, 0, 1));

        //My Turretdirection
        let turdir = this.turret.orientation % (2*Math.PI);
        if(this.inputConfig["turret-direction"]) this.inputs.push(map(turdir, 0, 2*Math.PI, -1, 1));
         

        //Enemy Tank Position
        if(this.inputConfig["enemy-position-x"]) this.inputs.push(map(this.enemy.pos.x, 0, game_width, 0, 1));
        if(this.inputConfig["enemy-position-y"]) this.inputs.push(map(this.enemy.pos.y, 0, game_height, 0, 1));

        //Enemy Tank Velocity
        if(this.inputConfig["enemy-velocity-x"]) this.inputs.push(map(this.enemy.vel.x, 0, game_width, 0, 1));
        if(this.inputConfig["enemy-velocity-y"]) this.inputs.push(map(this.enemy.vel.y, 0, game_height, 0, 1));

        //angle to enemy
        let dist = p5.Vector.sub(this.enemy.pos, this.pos);
        let distangle = Math.atan2(dist.y, dist.x);
        this.angletoenemy = this.orientation - distangle;
        if(this.angletoenemy > Math.PI) {
            this.angletoenemy -= 2*Math.PI;
        } else if(this.angletoenemy < -Math.PI) {
            this.angletoenemy += 2*Math.PI;
        } 
        if(this.inputConfig["angle-to-enemy"]) this.inputs.push(map(this.angletoenemy, -Math.PI, Math.PI, 0, 1));

        //position of enemy projectiles
        if(this.enemy.projectiles[0]){
            if(this.inputConfig["projectile-position-x"]) this.inputs.push(map(this.enemy.projectiles[0].pos.x, 0, game_width, 0, 1));
            if(this.inputConfig["projectile-position-y"]) this.inputs.push(map(this.enemy.projectiles[0].pos.y, 0, game_height, 0, 1));
        } else {
            if(this.inputConfig["projectile-position-x"]) this.inputs.push(1);
            if(this.inputConfig["projectile-position-y"]) this.inputs.push(1);
        } 

        //distance to enemy projectiles
        if(this.enemy.projectiles[0] && this.enemy.isPlayerTank){
            let dist = p5.Vector.dist(this.enemy.projectiles[0].pos, this.pos);
            let max  = Math.sqrt(game_width*game_width + game_height*game_height);
            dist = map(dist, 0, max, 0, 1);
            console.log(dist);
            if(this.inputConfig["projectile-distance"]) this.inputs.push(dist);
        } else {
            if(this.inputConfig["projectile-distance"]) this.inputs.push(1);
        }
        


    }

    checkOrientation() {
        this.orientation = this.orientation % (2*Math.PI);
        if(this.orientation < 0) this.orientation = 2*Math.PI + this.orientation;
    }

    update(dt) {
        this.vel.mult(0);

        this.checkOrientation();
        
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
        
        
        this.turret.update(this.pos.x, this.pos.y, dt);
        this.projectiles.forEach(p => {
            p.update(dt);
        })
        
        this.timer += dt;
        this.checkAiming();
        if(this.vel.mag() <= 0.07) {
            this.notMovingCount++;
        }
        if(Math.abs(this.rotation) <= 0.003) {
            this.notSpinningScore++;
        }
        this.rotation = 0;
    }

    show() {
        push();
            noStroke();
            if(!this.blue) {
                fill(39, 72, 255/250*this.aimingScore);
            } else {
                fill(200, 10, 10);
            }
            //fill(this.color.R,this.color.G,this.color.B);
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