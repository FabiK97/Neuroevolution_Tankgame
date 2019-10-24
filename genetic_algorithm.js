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
    let deathcounter = 0;

    //sum up all the scores from all the tanks
    for (let i = 0; i < POP_SIZE; i++) {

        //if he is a winner tank, scale his score based on the time it took him to kill the other tank
        if(savedTanks[i].isWinner) {
            savedTanks[i].score *= map(savedTanks[i].time, 1, 100, 50, 10);
        }

        //if he died, decrease his score
        if(savedTanks[i].died) {
            savedTanks[i].score /= 10;
            deathcounter++;
        }

        sum += savedTanks[i].score;
    }

    avgScore = sum/POP_SIZE;
    console.log("avg Score: " + avgScore);
    console.log("deaths:    " + deathcounter);

    //normalize the score and save it as fitness
    for (let i = 0; i < POP_SIZE; i++) {
        savedTanks[i].fitness = savedTanks[i].score / sum;
    }   
}

/**
 * function to pick a tank from the array
 * The higher the score is, the more likely he gets picked.
 * This is done, by creating a number r between 0 and 1. 
 * Then the fitnesses are subtracted from r and if r then is less than 0, 
 * that means, that r was in the range of this tank (his fitness).
 */
function selectOne() {
    var index = 0;
    var r = random(1);

    while(r > 0) {
        r = r - savedTanks[index].fitness;
        index++;
    }
    index--;
    
    let tank = savedTanks[index];
    let child = new Tank(width/2 + 200, height/2, -Math.PI/2, tank.brain); //create a new Tank and pass him the neural network of the picked tank
    child.mutate();
    return child;
}