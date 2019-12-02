class Game {
    constructor(gamemode = 0, tank1, tank2) {
        this.gamemode = gamemode;
  
        this.tanks = [];
        switch(gamemode) {
            case 0: //MULTIPLAYER
                this.tanks.push(new Tank(game_width/2 + 200, game_height/2, -Math.PI/2));
                this.tanks.push(new Tank(game_width/2 - 200, game_height/2, -Math.PI/2)); 
                this.tanks[0].setControls(Tank.WASD);     
                this.tanks[0].enemy = this.tanks[1];
                this.tanks[1].enemy = this.tanks[0];
                break;
            case 1: //PLAYER vs AI
                if(tank1){
                    this.tanks.push(tank1);
                } else {
                    this.tanks.push(new Tank(game_width/2 + 200, game_height/2, -Math.PI/2));
                }
                this.tanks.push(new Tank(game_width/2 - 200, game_height/2, -Math.PI/2));
                this.tanks[0].isPlayerTank = false;
                this.tanks[0].enemy = this.tanks[1];
                break;
            case 2: //AI vs AI
                if(tank1 && tank2) {
                    this.tanks.push(tank1);
                    this.tanks.push(tank2);
                } else {
                    this.tanks.push(new Tank(game_width/2 + 100, game_height/2, -Math.PI/2));
                    this.tanks.push(new Tank(game_width/2 - 100, game_height/2, -Math.PI/2));
                }
                this.tanks[0].isPlayerTank = false;
                this.tanks[0].enemy = this.tanks[1];

                this.tanks[1].isPlayerTank = false;
                this.tanks[1].enemy = this.tanks[0];
                break;
            case 3: //BOT vs AI
                if(tank1){
                    this.tanks.push(tank1);
                } else {
                    this.tanks.push(new Tank(game_width/2 + 200, game_height/2, -Math.PI/2));
                }
                if(BOT_MODE == "moving-x") {
                    this.tanks.push(new Tank(game_width/2, game_height/4, 0));
                } else {
                    this.tanks.push(new Tank(game_width/2 - 200, game_height/2, -Math.PI/2));
                }
                this.tanks[0].isPlayerTank = false;
                this.tanks[0].enemy = this.tanks[1];
                this.tanks[1].isPlayerTank = false;
                this.tanks[1].enemy = this.tanks[0];
                this.tanks[1].isBot = true;
                break;
        }
        this.tanks[1].blue = true;


        this.obstacles = [];

        //Walls
        this.obstacles.push(new Obstacle(0, -10, game_width, 20));
        this.obstacles.push(new Obstacle(game_width - 10, 0, 20, game_height));
        this.obstacles.push(new Obstacle(0, game_height-10, game_width, 20));
        this.obstacles.push(new Obstacle(-10, 0, 20, game_height));
        if(OBSTACLES) {
            this.obstacles.push(new Obstacle(game_width/2 - 25, 100, 50, game_height - 200));
        }

        this.isOver = false;
        this.timer = 0;

    }

    run(dt) {
        this.update(dt);
        this.render();
    }

    update(dt) {
        for(let tank of this.tanks) {
            
            let walls = []
            //check if tank collides with an obstacle (or wall)
            this.obstacles.forEach(obstacle => {
                obstacle.checkCollision(tank);
                if(OBSTACLES) walls.push(...obstacle.getAsWalls());
            });

            if(OBSTACLES) tank.look(walls);
            tank.update(dt);
            
            //check if two tanks collide
            for(let t of this.tanks) {
                if(tank.checkTankCollision(t)) {
                    let force = p5.Vector.sub(t.pos, tank.pos);
                    force.mult(-0.02);
                    tank.pos.add(force);
                    t.pos.add(force.mult(-1));
                }
            }

            for (let i = 0; i < tank.projectiles.length; i++) {
                for(let t of this.tanks) {

                    //check if two projectiles collide
                    for (let j = 0; j < t.projectiles.length; j++) {
                        if(t.projectiles[j].checkCollision(tank.projectiles[i])) {
                            t.projectiles.splice(j, 1);
                            tank.projectiles.splice(i, 1);
                        }
                    }

                    //check if tank is hit by a projectile
                    if(t.checkHit(tank.projectiles[i])) {
                        tank.projectiles.splice(i, 1);
                        //t.died = true;

                        //if he didn´t hit himself, he increase his hits
                        if(t !== tank) {
                            tank.isWinner = true;
                            tank.time = this.timer;
                            tank.hitCount++;
                            if(tank.isBot) {
                                this.isOver = true;
                            }
                        } else {
                            if(!tank.isBot) this.isOver = true;
                        }
                    }
                    
                }

                //check if projectile hit wall
                for(var o of this.obstacles) {
                        if(tank.projectiles[i]) {
                            if(o.checkCollision(tank.projectiles[i])) {
                            tank.projectiles.splice(i, 1);
                        }
                    }   
                }
            }
        }
        this.timer++;
    }

    render() {
        for(let tank of this.tanks) {
            if(!this.isOver)
                tank.show();
        }   
        this.obstacles.forEach(obstacle => {
            obstacle.show();
        });
    }
}