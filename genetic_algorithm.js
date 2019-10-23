function nextGen() {

    calculateFitness();

    for (let i = 0; i < POP_SIZE; i++) {
        let tank = selectOne();
        population[i] = new Game(gamemode.PLAYER_VS_AI, tank);
    }

    savedTanks = [];
}

function calculateFitness() {
    let sum = 0;
    for (let i = 0; i < POP_SIZE; i++) {
        sum += savedTanks[i].score;
    }

    for (let i = 0; i < POP_SIZE; i++) {
        savedTanks[i].fitness = savedTanks[i].score / sum;
        
        if(savedTanks[i].isWinner) {
            savedTanks[i].fitness *= 20;
        }

        if(savedTanks[i].isWinner) {
            savedTanks[i].fitness /= 10;
        }
    }   
}

function selectOne() {
    var index = 0;
    var r = random(1);

    while(r > 0) {
        r = r - savedTanks[index].fitness;
        index++;
    }
    index--;
    
    let tank = savedTanks[index];
    let child = new Tank(width/2 + 200, height/2, -Math.PI/2, tank.brain);
    child.mutate();
    return child;
}