var game;
var fr = 60;
var gamemode = {
  MULTIPLAYER: 0,
  PLAYER_VS_AI: 1,
  AI_VS_AI:2,
}

function setup() { 
  //Init things here
  createCanvas(800,600);
  frameRate(fr);
  game = new Game(gamemode.PLAYER_VS_AI);
}
  
function draw() { 
  //Draw Loop
  background(219, 187, 126);

  if(game.isOver) {
    game = new Game(gamemode.MULTIPLAYER);  
  }
  game.run(deltaTime);
}
