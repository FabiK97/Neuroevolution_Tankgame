var game;
var fr = 60;

function setup() { 
//Init things here
  createCanvas(800,600);
  frameRate(fr);
  game = new Game();
} 
  
function draw() { 
  //Draw Loop
  background(50);
  game.run(deltaTime);
}
