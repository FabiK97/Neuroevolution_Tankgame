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

        this.inputConfig = INPUT_CONFIG;
        this.botMode = BOT_MODE;
        this.outputMode = OUTPUT_MODE;

        
        this.setupRays();

        this.raytoenemy = new Ray(this.pos, radians(0));
        this.seeEnemy = 0;

    }

    static get ARROW_KEYS() {
        return 0;
    }
    static get WASD() {
        return 1;
    }

    /**
     * Create Rays around the tank
     */
    setupRays() {
        this.rays = [];
        if(this.inputConfig.vision) {
            for(let a = 0; a < 360; a+=45) {
                this.rays.push(new Ray(this.pos, radians(a)));
            } 
        } else if(this.inputConfig["projectile-vision"]) {
            console.log("test");
            for(let a = -90; a < 90; a+=15) {
                this.rays.push(new Ray(this.pos, radians(a)));
            }
        }
    }


    mutate() {
        this.brain.mutate(MUTATION_RATE);
    }

    setControls(controls) {
        this.controls = controls;
    }

    /**
     * Handle the Keyboard inputs according to the chosen controls
     */
    handleInputs() {
        let SPACE_KEY = 32;
        //Move Tank
        if((this.controls == 0 && keyIsDown(UP_ARROW)) || (this.controls == 1 && keyIsDown(87))) {

            this.vel = p5.Vector.fromAngle(this.orientation);
            this.vel.setMag(0.2); 

        } else if((this.controls == 0 && keyIsDown(DOWN_ARROW)) || (this.controls == 1 && keyIsDown(83))) {

            this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
            this.vel.setMag(0.2);  
        }
        
        //Turn Tank
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


    /**
     * Control the tank with the outputs of the neural network
     */
    aiControl(dt, outputs) {

        switch (this.outputMode) {
            case "binary": {
                
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
            } break;
        
            case "mapped": {
        
            
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
               } break;
        
            case "mapped-turret": {
        
                var speed = map(outputs[0], 0, 1, -1, 1);
                if(speed>0) {
                    this.vel = p5.Vector.fromAngle(this.orientation);
                    this.vel.setMag(Math.abs(speed)*0.2); 
                } else {
                    this.vel = p5.Vector.fromAngle(this.orientation + Math.PI);
                    this.vel.setMag(Math.abs(speed)*0.2);
                }
        
                var angle = map(outputs[1], 0, 1, -this.MAXROTATION, this.MAXROTATION);
                this.rotation = angle;
        
                angle = map(outputs[2], 0, 1, -this.MAXROTATION, this.MAXROTATION);
                this.turret.rotate(angle);
        
                //shoot
                if(outputs[3] > 0.7) {
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
            } break;
        }

       
    }

    /**
     * Control the tank according to the chosen bot mode
     */
    botControl(dt) {
        switch(this.botMode) {
            case "stationary":{
                break;}
            case "moving-x": {
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
                        console.log("test");
                        this.bottimer += dt;
                        this.vel.mult(0);
                    }
                break;}
            case "moving-y": {
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
                break;}
            case "wandering": {
                    let dir;
                    if(this.pos.y < 40 || this.pos.y > game_height - 40 || this.pos.x < 40 || this.pos.x > game_width - 40) {
                        dir = 0.1;
                    } else {
                        dir = random(-0.1, 0.1);
                    }
                    this.orientation += dir;
                    this.vel = p5.Vector.fromAngle(this.orientation);
                    this.vel.setMag(0.2);
                    break;}
            case "stationary-shooting": {
                    let dist = p5.Vector.sub(this.enemy.pos, this.pos);
                    let distangle = Math.atan2(dist.y, dist.x);
                    this.turret.orientation = distangle;
                    
                    if(this.timer > this.firerate) {
                        this.shoot();
                        this.shootCount++;
                        this.timer = 0;
                    }
                    this.timer++;
                break;}
            case "moving-y-shooting": {
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

                let dist = p5.Vector.sub(this.enemy.pos, this.pos);
                let distangle = Math.atan2(dist.y, dist.x);
                this.turret.orientation = distangle;
                if(this.projectiles.length == 0) {
                    this.shoot();
                }
            break;
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

    /**
     * Calculate the aimingscore of the tank
     */
    checkAiming() {
        if(this.angletoenemy > -0.8 && this.angletoenemy < 0.8) {
            if(this.inputConfig.vision) {
                if(this.seeEnemy > 0) {
                    this.aimingScore += Math.pow(500,(1-Math.abs(this.angletoenemy)))/500;
                }
                
            }else {
               this.aimingScore += Math.pow(500,(1-Math.abs(this.angletoenemy)))/500;
            }
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

    /**
     * Generate the inputs according to the input configuration
     */
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

        //My Rotation
        if(this.inputConfig["rotation"]) this.inputs.push(map(this.rotation, -this.MAXROTATION, +this.MAXROTATION, 0, 1));

        //My Turretrotation
        if(this.inputConfig["turret-rotation"]) this.inputs.push(map(this.turret.rotation, -this.MAXROTATION, +this.MAXROTATION, 0, 1));

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
        this.distangle = Math.atan2(dist.y, dist.x);
        this.angletoenemy = this.turret.orientation - this.distangle;
        if(this.angletoenemy > Math.PI) {
            this.angletoenemy -= 2*Math.PI;
        } else if(this.angletoenemy < -Math.PI) {
            this.angletoenemy += 2*Math.PI;
        } 
        if(this.inputConfig["angle-to-enemy"]) this.inputs.push(map(this.angletoenemy, -Math.PI, Math.PI, 0, 1));


        //Enemy Tank Angle Velocity
        let enemyvel = p5.Vector.mult(this.enemy.vel, 10);
        let vel = p5.Vector.add(this.enemy.pos, enemyvel);
        let veldist = p5.Vector.sub(vel, this.pos);
        let veldistangle = Math.atan2(veldist.y, veldist.x);
        this.enemyvelangle = veldistangle - this.distangle;
        if(this.enemyvelangle > Math.PI) {
            this.enemyvelangle -= 2*Math.PI;
        } else if(this.enemyvelangle < -Math.PI) {
            this.enemyvelangle += 2*Math.PI;
        } 
        if(this.inputConfig["enemy-velocity-angle"]) this.inputs.push(map(this.enemyvelangle, -Math.PI, Math.PI, 0, 1));



        this.distancetoenemy = p5.Vector.dist(this.enemy.pos, this.pos);
        let maxdistance = Math.sqrt(game_height*game_height + game_width*game_width);
        if(this.inputConfig["distance-to-enemy"]) this.inputs.push(map(this.distancetoenemy, 0, maxdistance - 100, 0, 1));
        

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

        //vision rays
        if(this.inputConfig["vision"]) {
           for(let ray of this.rays) {
               let d = ray.record > 200 ? 200 : ray.record;
               this.inputs.push(map(d, 0, 200, 1, 0));
            } 

            this.seeEnemy;
            let dist = p5.Vector.dist(this.enemy.pos, this.pos);
            let sight = this.raytoenemy.record;
            this.seeEnemy = dist < sight ? 1 : 0;
            this.inputs.push(this.seeEnemy);
        }

        //projectile vision rays
        if(this.inputConfig["projectile-vision"]) {
            for(let ray of this.rays) {
                let d = ray.record > 200 ? 200 : ray.record;
                this.inputs.push(map(d, 0, 200, 1, 0));
             } 
         }
        

    }

    checkOrientation() {
        this.orientation = this.orientation % (2*Math.PI);
        if(this.orientation < 0) this.orientation = 2*Math.PI + this.orientation;
        this.turret.orientation = this.turret.orientation % (2*Math.PI);
        if(this.turret.orientation < 0) this.turret.orientation = 2*Math.PI + this.turret.orientation;
    }

    /**
     * check if rays hit any of the walls and calculate the distance to the closest one
     */
    look(walls) {
        let rays = [...this.rays];
        rays.push(this.raytoenemy);
        for(let [i,ray] of rays.entries()) {
            let closest = null;
            let record = i == rays.length-1 ? Infinity : 200;
            for(let wall of walls) {
                const pt = ray.checkWall(wall);
                if(pt) { 
                    const d = p5.Vector.dist(this.pos, pt);
                    if(d < record) {
                        record = d;
                        closest = pt;
                    }
                }  
            }
            ray.closest = closest;
            ray.record = closest ? record : Infinity;
        } 
    }

    update(dt) {

        this.checkOrientation();

        if(!this.isPlayerTank && !this.isBot) this.updateInputs();

        this.rotation = 0;
        this.turret.rotation = 0;
        this.vel.mult(0);

        if(this.isPlayerTank) {
            this.handleInputs(dt);
        } else {
            if(this.isBot) {
                this.botControl(dt);
            } else {
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


        if((this.inputConfig.vision || this.inputConfig["projectile-vision"])) {
        for(let ray of this.rays) {
            ray.rotate(this.orientation);
        }
        if(!this.isPlayerTank) this.raytoenemy.setDir(this.enemy.pos.x, this.enemy.pos.y);
        }
        
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
        if(this.inputConfig.vision || this.inputConfig["projectile-vision"]) {
            if(!this.isBot) {
                this.rays.forEach(r => {
                    r.show();
                })  
            }
            
            //if(this.blue) this.raytoenemy.show();

        }
    }
}