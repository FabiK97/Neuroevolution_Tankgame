class Game {
    constructor() {
        this.tank = new Tank(width/2, height/2, -Math.PI/2);
        this.obstacles = [];

        //Walls
        this.obstacles.push(new Obstacle(0, 0, width, 10));
        this.obstacles.push(new Obstacle(width - 10, 0, width, height));
        this.obstacles.push(new Obstacle(0, height-10, width, height));
        this.obstacles.push(new Obstacle(0, 10, 10, height));

    }

    run(dt) {
        this.update(dt);
        this.render();
    }

    update(dt) {
        this.tank.update(dt);
        this.obstacles.forEach(obstacle => {
            obstacle.checkCollision(this.tank);
        });

        for (let i = 0; i < this.tank.projectiles.length; i++) {
            for(var o of this.obstacles) {
                    if(this.tank.projectiles[i]) {
                        if(o.checkCollision(this.tank.projectiles[i])) {
                        this.tank.projectiles.splice(i, 1);
                    }
                }   
            }

        }
    }

    render() {
        this.tank.show();
        this.obstacles.forEach(obstacle => {
            obstacle.show();
        });
    }
}