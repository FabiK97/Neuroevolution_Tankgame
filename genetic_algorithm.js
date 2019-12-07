var bestTank;
var secondTank;
var current_gm;
var currentscores;
function nextGen() {
    calculateFitness();

    for (let i = 0; i < POP_SIZE; i++) {
        if(i == 0 && ELITISM) {
            let childBrain = bestTank.brain.copy();
            var child = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, childBrain);
            gamemanager.population[i] = new Game(gamemanager.currentgm, child);
        } else {

        
        let mother = selectOne();
        let father = selectOne();

        //let childBrain = NeuralNetwork.crossover(mother.brain, father.brain);
        let childBrain = mother.brain.copy();

        var child = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, childBrain); //create a new Tank and pass him the neural network of the picked tank
        child.mutate();
        child.color = mother.color;

        if(gamemanager.currentgm == gamemode.AI_VS_AI) {
            let mother = selectOne();
            let father = selectOne();

            let childBrain = NeuralNetwork.crossover(mother.brain, father.brain);

            var child2  = new Tank(game_width/2 - 200, game_height/2, -Math.PI/2, childBrain);
            child2.mutate();
            child2.color = mother.color;

            gamemanager.population[i] = new Game(gamemanager.currentgm, child, child2);

        } else {
            gamemanager.population[i] = new Game(gamemanager.currentgm, child);
        }
      }  
    }

    gamemanager.savedTanks = [];
}

function calculateFitness() {
    highScore = 0;
    let sum = 0;
    let deathcounter = 0;
    avgHitaccuracy = 0;
    //sum up all the scores from all the tanks
    for (let i = 0; i < POP_SIZE; i++) {
        avgHitaccuracy += gamemanager.savedTanks[i].hitaccuracy;

        //calculate best Tank
        if(gamemanager.savedTanks[i].score > highScore) {
            if(gamemanager.currentgm == gamemode.AI_VS_AI) {
                secondTank = bestTank;
                bestTank = gamemanager.savedTanks[i];
                highScore = gamemanager.savedTanks[i].score;
            } else {
                highScore = gamemanager.savedTanks[i].score;
                bestTank = gamemanager.savedTanks[i];
            }
        }

        sum += gamemanager.savedTanks[i].score;
    }

    /* let aiming = gamemanager.savedTanks.map((t) => {return t.aimingScore});
    let moving = gamemanager.savedTanks.map((t) => {return t.notMovingCount});
    let shooting = gamemanager.savedTanks.map((t) => {return t.hitCount});
    console.log("Bestaim:", Math.max(...aiming));
    console.log("Bestmove:", Math.max(...moving));
    console.log("Bestshoot:", Math.max(...shooting)); */
    currentscores = gamemanager.savedTanks.map((tank) => tank.score);
    currentscores = currentscores.sort((a,b) => a < b);

    avgScore = sum/POP_SIZE;

    avgHitaccuracy = avgHitaccuracy/POP_SIZE;

    //normalize the score and save it as fitness
    for (let i = 0; i < POP_SIZE; i++) {
        gamemanager.savedTanks[i].fitness = gamemanager.savedTanks[i].score / sum;
    }   
}

function calculateScore(tank) {

    tank.hitaccuracy = tank.hitCount / tank.shootCount;

    let movingScore = MAX_SCORE * 0.1 * (tank.notMovingCount / MAX_FRAMES);
    let spinningScore = tank.notSpinningScore > MAX_FRAMES/2 ? MAX_SCORE * 0.2 : 0;
    let aimingScore = MAX_SCORE * 0.6 * (tank.aimingScore / (MAX_FRAMES-100));
    let hitScore = MAX_SCORE * 0.3 * (tank.hitCount / (MAX_GAME_LENGTH/(tank.firerate/1000) - 2));

    tank.score += movingScore;
    tank.score += aimingScore;
    //if(movingScore > 0.1*MAX_SCORE) {
    //}
    tank.score += hitScore;

    switch(FITNESS_SCALING) {
        case "linear":
            break;
        case "squared":
            tank.score = tank.score * tank.score;
            break;
        case "exponential":
            tank.score = Math.pow(2, tank.score);
            break;
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
        r = r - gamemanager.savedTanks[index].fitness;
        index++;
    }
    index--;
    
    return gamemanager.savedTanks[index];
}