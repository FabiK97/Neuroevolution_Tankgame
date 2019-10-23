var population = [];
var POP_SIZE = 30;
var fr = 60;
var MAX_GAME_LENGTH = 10;
var timer = 0;
var savedTanks = [];

var gamemode = {
  MULTIPLAYER: 0,
  PLAYER_VS_AI: 1,
  AI_VS_AI:2,
}

function setup() { 
  //Init things here
  createCanvas(800,600);
  frameRate(fr);
  
  for(let i = 0; i < POP_SIZE; i++) {
    population[i] = new Game(gamemode.PLAYER_VS_AI);
  }
}
  
function draw() { 
  timer += (deltaTime/1000);
  //Draw Loop
  background(219, 187, 126);
  let finish = true;
  for(let i = 0; i < population.length; i++) {
    population[i].update(deltaTime);
    population[i].render();
  }

  for(let i = population.length - 1; i >= 0; i--) {
    var game = population[i];
    if(game.isOver || timer > MAX_GAME_LENGTH) {
      let game = population.splice(i, 1)[0];
      savedTanks.push(game.tanks[0]);
    }
  }

  if(population.length == 0) {
    console.log("Next Generation!");
    nextGen();
    timer = 0;
  }
}
