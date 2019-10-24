var population = [];
var POP_SIZE = 75;
var fr = 60;
var MAX_GAME_LENGTH = 5;
var timer = 0;
var savedTanks = [];
var gameSpeedSlider;
var generationCount;
var generationLabel;
var avgScore;
var avgLabel;

var gamemode = {
  MULTIPLAYER: 0,
  PLAYER_VS_AI: 1,
  AI_VS_AI:2,
}

function setup() { 
  //Init things here
  createCanvas(800,600);
  gameSpeedSlider = createSlider(1,100,1);
  generationLabel = createElement('h1', "Generation: 1");
  avgLabel = createElement('h1', "Average Score: ");
  generationCount = 1;
  avgScore = 0;
  frameRate(fr);
  
  for(let i = 0; i < POP_SIZE; i++) {
    population[i] = new Game(gamemode.PLAYER_VS_AI);
  }
}
  
function draw() {
  //to increase the training speed, update the game multiple times per frame
  let dt = 50;
  for(let n = 0; n < gameSpeedSlider.value(); n++) {
    timer += (dt/1000);

    //update the games
    for(let i = 0; i < population.length; i++) {
      population[i].update(dt);
    }

    //check if a game is over, delete it from the current population and save its AI Tank in an array
    for(let i = population.length - 1; i >= 0; i--) {
      var game = population[i];
      if(game.isOver || timer > MAX_GAME_LENGTH) {
        let game = population.splice(i, 1)[0];
        savedTanks.push(game.tanks[0]);
      }
    }

    if(population.length == 0) {
      nextGen();
      generationCount++;
      generationLabel.html(`Generation: ${generationCount}`)
      avgLabel.html(`Average Score: ${avgScore}`)
      timer = 0;
    }
  }

  background(219, 187, 126);
  for(let i = 0; i < population.length; i++) {
    population[i].render();
  } 
  //population[0].render();
}
