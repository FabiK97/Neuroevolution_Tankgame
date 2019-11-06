var bestTank;

function nextGen() {

    calculateFitness();

    for (let i = 0; i < POP_SIZE; i++) {
        let tank = selectOne();
        population[i] = new Game(gamemode.BOT_VS_AI, tank);
    }

    savedTanks = [];
}

function calculateFitness() {
    highScore = 0;
    let sum = 0;
    let deathcounter = 0;
    avgHitaccuracy = 0;

    //sum up all the scores from all the tanks
    for (let i = 0; i < POP_SIZE; i++) {
        calculateScore(savedTanks[i]);

        /* if(savedTanks[i].isWinner) {
            let scoreMult = map(savedTanks[i].time, 1, 100, 50, 20);
            savedTanks[i].score *= scoreMult;
        } else {
            if(savedTanks[i].died) {
                //if he died, decrease his score
                savedTanks[i].score /= 15;
                deathcounter++;
            } else {
                savedTanks[i].score /= 5;
            }
        } */

        //calculate best Tank
        if(savedTanks[i].score > highScore) {
            highScore = savedTanks[i].score;
            bestTank = savedTanks[i];
        }

        sum += savedTanks[i].score;
    }

    avgScore = sum/POP_SIZE;
    avgHitaccuracy = avgHitaccuracy/POP_SIZE;
    console.log("avg Score: " + avgScore);
    console.log("deaths:    " + deathcounter);

    //normalize the score and save it as fitness
    for (let i = 0; i < POP_SIZE; i++) {
        savedTanks[i].fitness = savedTanks[i].score / sum;
    }   
}

function calculateScore(tank) {

    let hitaccuracy = tank.hitCount / tank.shootCount;
    avgHitaccuracy += hitaccuracy;
    tank.score *= (hitaccuracy * hitaccuracy);
    
    if(tank.died || tank.shootCount <= 4) 
        tank.score /= 10;

    tank.score = Math.pow(tank.score, 2);
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
    let child = new Tank(width/2 + 200, height/2, -Math.PI/2, tank.brain.copy()); //create a new Tank and pass him the neural network of the picked tank
    child.mutate();
    return child;
}