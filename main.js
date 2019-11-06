var population = [];
var POP_SIZE = 100;
var fr = 60;
var MAX_GAME_LENGTH = 30;
var timer = 0;
var savedTanks = [];
var render = true;
var reviewGame;
var showReviewGame = false;

var gameSpeedSlider;
var renderCheckbox;
var showReviewGameCheckbox;
var generationCount;
var avgScore;
var avgHitaccuracy;
var highScore;

var showReviewLabel;
var renderLabel;
var sliderLabel;
var generationLabel;
var avgLabel;
var hitaccuracyLabel;

var canvas;

var gamemode = {
  MULTIPLAYER: 0,
  PLAYER_VS_AI: 1,
  AI_VS_AI:2,
  BOT_VS_AI:3
}

function setup() { 
  //Init things here
  createCanvas(800,600);
  frameRate(fr);

  
  generationCount = 1;
  avgScore = 0;
  
  initLegend();

  for(let i = 0; i < POP_SIZE; i++) {
    population[i] = new Game(gamemode.BOT_VS_AI);
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

    //if game is over, call nextgeneration
    if(population.length == 0) {
      nextGen();
      generationCount++;
      updateLegend();
      timer = 0;
    }
  }

  //if review Mode then update it
  if(showReviewGame) {
    updateReviewGame();
  }

  if(render) {
    canvas.style.display = "block";
    if(!showReviewGame) {
      background(219, 187, 126);
      for(let i = 0; i < population.length; i++) {
        population[i].render();
      } 
    }
    
  } else {
      canvas.style.display = "none";
  }
}

function updateReviewGame() {
    if((!reviewGame || reviewGame.isOver) && bestTank) {
      let tank = new Tank(width/2 + 200, height/2, -Math.PI/2, bestTank.brain.copy());
      console.log("besttank: ", bestTank.score);
      reviewGame = new Game(gamemode.PLAYER_VS_AI, tank);
    }
    
    if(reviewGame) {
      reviewGame.update(deltaTime);
      
      background(219, 187, 126);
      reviewGame.render();
      let d = p5.Vector.sub(reviewGame.tanks[0].enemy.pos, reviewGame.tanks[0].pos)
      let p = reviewGame.tanks[0].pos;
      let o = p5.Vector.fromAngle(reviewGame.tanks[0].orientation);
      o.mult(100);
      stroke(255);
      strokeWeight(2);
      line(p.x,p.y,p.x+d.x,p.y+d.y);
      line(p.x,p.y,p.x+o.x,p.y+o.y);
      fill(0);
      noStroke();
      textSize(20);
      text("Highscore: " + highScore, 10, 30);
    }
}

function initLegend() {
  let configBox = createDiv();
  configBox.style("margin: 20px; padding: 10px;   border: 2px solid black; max-width: 500px");

  renderCheckbox = createCheckbox("", true);
  renderCheckbox.changed(toggleRendering);
  renderCheckbox.style("display: inline-block;")
  renderLabel = createElement('div', "Render: ");
  renderLabel.child(renderCheckbox);

  showReviewGameCheckbox = createCheckbox("", false);
  showReviewGameCheckbox.changed(toggleRenderMode);
  showReviewGameCheckbox.style("display: inline-block;")
  showReviewLabel = createElement('div', "Review Best: ");
  showReviewLabel.child(showReviewGameCheckbox);

  sliderLabel = createElement('div', "Gamespeed:");
  gameSpeedSlider = createSlider(1,100,1);
  gameSpeedSlider.style("margin-left: 10px;");
  sliderLabel.child(gameSpeedSlider);


  generationLabel = createElement('div', `Generation: <strong>${generationCount}</strong>`);
  avgLabel = createElement('div', `Average Score: <strong>${avgScore}</strong>`);
  hitaccuracyLabel = createElement('div', `Average Score: <strong>${avgHitaccuracy}</strong>`);


  renderLabel.style("font-size: 1.5em; margin: 10px");  
  showReviewLabel.style("font-size: 1.5em; margin: 10px");  
  sliderLabel.style("font-size: 1.5em; margin: 10px");
  generationLabel.style("font-size: 1.5em; margin: 10px");
  avgLabel.style("font-size: 1.5em; margin: 10px");
  hitaccuracyLabel.style("font-size: 1.5em; margin: 10px");


  configBox.child(renderLabel);
  configBox.child(showReviewLabel);
  configBox.child(sliderLabel);
  configBox.child(generationLabel);
  configBox.child(avgLabel);
  configBox.child(hitaccuracyLabel);


  canvas = document.getElementsByClassName("p5Canvas")[0];

}

function updateLegend() {
  generationLabel.html(`Generation: <strong>${generationCount}</strong>`)
  avgLabel.html(`Average Score: <strong>${avgScore}</strong>`)
  hitaccuracyLabel.html(`Average Score: <strong>${avgHitaccuracy}</strong>`)

}

function toggleRendering() {
    render = this.checked();
}

function toggleRenderMode() {
  showReviewGame = this.checked();
}