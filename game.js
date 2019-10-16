class Game {
    constructor(gamemode = 0) {
        this.gamemode = gamemode;
  
        this.tanks = [];
        switch(gamemode) {
            case 0: 
                this.tanks.push(new Tank(width/2 + 200, height/2, -Math.PI/2));
                this.tanks.push(new Tank(width/2 - 200, height/2, -Math.PI/2)); 
                this.tanks[0].setControls(Tank.WASD);     
                break;
            case 1: 
                this.tanks.push(new Tank(width/2 + 200, height/2, -Math.PI/2));
                this.tanks.push(new Tank(width/2 - 200, height/2, -Math.PI/2));
                this.tanks[0].isPlayerTank = false;
                break;
            case 2: 
                this.tanks.push(new Tank(width/2 + 100, height/2, -Math.PI/2));
                this.tanks.push(new Tank(width/2 - 100, height/2, -Math.PI/2));
                this.tanks[1].isPlayerTank = false;
                break;
        }



        this.obstacles = [];

        //Walls
        this.obstacles.push(new Obstacle(0, 0, width, 10));
        this.obstacles.push(new Obstacle(width - 10, 0, width, height));
        this.obstacles.push(new Obstacle(0, height-10, width, height));
        this.obstacles.push(new Obstacle(0, 10, 10, height));
        this.obstacles.push(new Obstacle(width/2 - 25, 100, 50, height - 200));

        this.isOver = false;

    }

    run(dt) {
        this.update(dt);
        this.render();
    }

    update(dt) {
        for(let tank of this.tanks) {
            tank.update(dt);
            this.obstacles.forEach(obstacle => {
                obstacle.checkCollision(tank);
            });

            for(let t of this.tanks) {
                if(tank.checkTankCollision(t)) {
                    let force = p5.Vector.sub(t.pos, tank.pos);
                    force.mult(-0.02);
                    tank.pos.add(force);
                    t.pos.add(force.mult(-1));
                    console.log(tank.pos.x);
                }
            }

            for (let i = 0; i < tank.projectiles.length; i++) {
                for(let t of this.tanks) {
                    for (let j = 0; j < t.projectiles.length; j++) {
                        if(t.projectiles[j].checkCollision(tank.projectiles[i])) {
                            t.projectiles.splice(j, 1);
                            tank.projectiles.splice(i, 1);
                        }
                    }

                    if(t.checkHit(tank.projectiles[i])) {
                        tank.projectiles.splice(i, 1);
                        if(t !== tank) {
                            tank.isWinner = true;
                            this.isOver = true;
                        }
                    }
                    
                }

                for(var o of this.obstacles) {
                        if(tank.projectiles[i]) {
                            if(o.checkCollision(tank.projectiles[i])) {
                            tank.projectiles.splice(i, 1);
                        }
                    }   
                }
            }
        }
        
    }

    render() {
        for(let tank of this.tanks) {
            tank.show();
        }   
        this.obstacles.forEach(obstacle => {
            obstacle.show();
        });
    }
}