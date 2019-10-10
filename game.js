class Game {
    constructor() {
        this.tank = new Tank(width/2, height/2, -Math.PI/2);
    }

    run(dt) {
        this.update(dt);
        this.render();
    }

    update(dt) {
        this.tank.update(dt);
    }

    render() {
        this.tank.show();
    }
}