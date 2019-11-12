
var population = [];
var savedTanks = [];
var loadedbrain;

//Constants
const POP_SIZE = 70;
const fr = 60;
const MAX_GAME_LENGTH = 30;
const MAX_GAME_SPEED = 200;

//Rendering
var render = true;
var reviewGame;
var savedGame;
var rendermode = 1;
var timer = 0;

var scoreHistory = [];
var avgScore;
var avgHitaccuracy;
var highScore;

//HTML Elements
var gameSpeedSlider;
var renderCheckbox;
var renderRadio;
var savedOption;
var generationCount;
var loadInput;

var canvas;
var scorePlot;

//HTML Labels
var rendermodeLabel;
var renderLabel;
var sliderLabel;
var generationLabel;
var avgLabel;
var hitaccuracyLabel;


var gamemode = {
  MULTIPLAYER: 0,
  PLAYER_VS_AI: 1,
  AI_VS_AI:2,
  BOT_VS_AI:3
}

var RenderModes = {
  TRAINING: 1,
  REVIEW: 2,
  SAVED: 3,
}

function setup() { 
  //Init things here
  createCanvas(800,600);
  frameRate(fr);

  
  generationCount = 1;
  avgScore = 0;
  
  initLegend();
  setupPlot();

  for(let i = 0; i < POP_SIZE; i++) {
    population[i] = new Game(gamemode.BOT_VS_AI);
  }
}
  
function draw() {
  //to increase the training speed, update the game multiple times per frame
  let dt = 40;

  if(renderRadio.value()) {
    console.log(renderRadio.value());
    rendermode = parseInt(renderRadio.value());
  }

  for(let n = 0; n < gameSpeedSlider.value(); n++) {
    if(rendermode == RenderModes.TRAINING) {
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
        scoreHistory.push(avgScore);
        plotScore();
        updateLegend();
        timer = 0;
      }
    }
  }

  //Show Canvas and Render Population
  if(render) {
    canvas.style.display = "block";
    switch(rendermode) {
      case RenderModes.TRAINING: 
          background(219, 187, 126);
          for(let i = 0; i < population.length; i++) {
            population[i].render();
          } 
          break;
      case RenderModes.REVIEW: 
          updateReviewGame();
          break;
      case RenderModes.SAVED:
          updateSavedGame();
          break;
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

function updateSavedGame() {
    if((!savedGame || savedGame.isOver) && loadedbrain) {
      let brainJSON = JSON.stringify(loadedbrain);
      let brain = NeuralNetwork.deserialize(brainJSON);
      let tank = new Tank(width/2 + 200, height/2, -Math.PI/2, brain);
      savedGame = new Game(gamemode.PLAYER_VS_AI, tank);
    }
    
    if(savedGame) {
      savedGame.update(deltaTime);
      
      background(219, 187, 126);
      savedGame.render();
      let d = p5.Vector.sub(savedGame.tanks[0].enemy.pos, savedGame.tanks[0].pos)
      let p = savedGame.tanks[0].pos;
      let o = p5.Vector.fromAngle(savedGame.tanks[0].orientation);
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

function loadJsonFromFile() {
  let filename = loadInput.value();
  loadedbrain = loadJSON(`${filename.indexOf(".json") > 0 ? filename : (filename + ".json")}`, checkObj);
}

function checkObj(obj) {
  if(obj.in == population[0].tanks[1].brain.in &&
     obj.on == population[0].tanks[1].brain.on) {
    savedOption.disabled = false;
  }
}

function initLegend() {
  let configBox = createDiv();
  let col1 = createDiv();
  let col2 = createDiv();

  configBox.class("configBox");
  col1.class("col");
  col2.class("col");

  renderCheckbox = createCheckbox("", true);
  renderCheckbox.changed(toggleRendering);
  renderCheckbox.style("display: inline-block;")
  renderLabel = createElement('div', "Render: ");
  renderLabel.child(renderCheckbox);

  renderRadio = createRadio();
  renderRadio.option('Training', 1);
  renderRadio.option('Review', 2);
  savedOption = renderRadio.option('Saved', 3);
  console.log(savedOption);
  savedOption.disabled = true;
  renderRadio.style('width', '110px');
  textAlign(CENTER);
  rendermodeLabel = createElement('div', "Rendermode: ");
  rendermodeLabel.child(renderRadio);

  sliderLabel = createElement('div', "Gamespeed:");
  gameSpeedSlider = createSlider(1,MAX_GAME_SPEED,1);
  gameSpeedSlider.style("margin-left: 10px;");
  sliderLabel.child(gameSpeedSlider);


  generationLabel = createElement('div', `Generation: <strong>${generationCount}</strong>`);
  avgLabel = createElement('div', `Average Score: <strong>${Math.round(avgScore)}</strong>`);
  hitaccuracyLabel = createElement('div', `Hitaccuracy: <strong>${(Math.round(avgHitaccuracy*100)/100)}</strong>`);

  let downloaddiv = createElement('div');
  let downloadbutton = createButton('Download Best');
  downloadbutton.mousePressed(downloadBest);
  downloaddiv.child(downloadbutton);

  let loaddiv = createElement('div');
  loadInput = createInput();
  let loadbutton = createButton('Load Tank');
  loadbutton.mousePressed(loadJsonFromFile);
  loaddiv.child(loadInput);
  loaddiv.child(loadbutton);


  

  renderLabel.style("font-size: 1.5em; margin: 10px");  
  rendermodeLabel.style("font-size: 1.5em; margin: 10px");  
  sliderLabel.style("font-size: 1.5em; margin: 10px");
  generationLabel.style("font-size: 1.5em; margin: 10px");
  avgLabel.style("font-size: 1.5em; margin: 10px");
  hitaccuracyLabel.style("font-size: 1.5em; margin: 10px");
  downloaddiv.style("margin: 10px");
  loaddiv.style("margin: 10px");



  col1.child(generationLabel);
  col1.child(avgLabel);
  col1.child(hitaccuracyLabel);
  col2.child(sliderLabel);
  col2.child(renderLabel);
  col2.child(rendermodeLabel);
  col2.child(downloaddiv);
  col2.child(loaddiv);

  configBox.child(col1);
  configBox.child(col2);


  canvas = document.getElementsByClassName("p5Canvas")[0];

}

function updateLegend() {
  generationLabel.html(`Generation: <strong>${generationCount}</strong>`)
  avgLabel.html(`Average Score: <strong>${Math.round(avgScore)}</strong>`)
  hitaccuracyLabel.html(`Average Score: <strong>${(Math.round(avgHitaccuracy*100)/100)}</strong>`)

}

function toggleRendering() {
    render = this.checked();
}

function setupPlot() {
  ctx = document.getElementById('scorePlot').getContext('2d');
  scorePlot = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [0],
      datasets: [{
        data: scoreHistory,
        label: 'Score',
      }],
    },
    options: {responsive: false},
  });
}

function plotScore() {
  let labels = [...Array(generationCount-1).keys()];
  console.log(labels);
  scorePlot.data.labels = labels;
  scorePlot.data.datasets[0].data = scoreHistory;
  scorePlot.update();
}

function downloadBest() {
  let brain = bestTank.brain;
  saveJSON(brain, `tankbrain_${Math.round(bestTank.score)}.json`);
}