
var population = [];
var savedTanks = [];
var loadedbrain;

//Constants
const POP_SIZE = 40;
const fr = 60;
const MAX_GAME_LENGTH = 20;
const MAX_GAME_SPEED = 200;

//Rendering
var game_width = 800;
var game_height = 600;
var render = true;
var reviewGame;
var playvsbestGame;
var savedGame;
var rendermode = 1;
var timer = 0;
var reviewtimer = 0;


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
var numberarray = [];

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
  PLAYVSBEST: 3,
  SAVED: 4,
}

function setup() { 
  //Init things here
  createCanvas(game_width+400,game_height);
  frameRate(fr);

  current_gm = gamemode.AI_VS_AI;
  
  generationCount = 1;
  avgScore = 0;
  
  initLegend();
  setupPlot();

  //create a new Population of Games
  for(let i = 0; i < POP_SIZE; i++) {
    population[i] = new Game(current_gm);
  }

  let nn = population[0].tanks[0].brain;
  if(nn) {
    numberarray.push(nn.in);
    numberarray.push(nn.hn_1);
    if(nn.hn_2) numberarray.push(nn.hn_2);
    numberarray.push(nn.on);
  }
}
  
function draw() {
  //to increase the training speed, update the game multiple times per frame
  let dt = 40;

  //Get selected Radiobutton as Gamemode
  if(renderRadio.value()) {
    console.log(renderRadio.value());
    rendermode = parseInt(renderRadio.value());
  }

  //update the population n times
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
          calculateScore(game.tanks[0]);
          if(game.gamemode == gamemode.AI_VS_AI) {
            calculateScore(game.tanks[1]);
            if(game.tanks[0].score > game.tanks[0].score) {
              savedTanks.push(game.tanks[0]);
            } else {
              savedTanks.push(game.tanks[1]);
            }
          } else {
            savedTanks.push(game.tanks[0]);
          }
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

  //Show canvas and render corresponding rendermode
  //TODO: auslagern des updaten und renderns der population
  if(render) {
    canvas.style.display = "block";
    switch(rendermode) {
      case RenderModes.TRAINING: 
          background(219, 187, 126);
          rect
          for(let i = 0; i < population.length; i++) {
            population[i].render();
          } 
          break;
      case RenderModes.REVIEW: 
          updateReviewGame();
          break;
      case RenderModes.PLAYVSBEST:
          updatePlayVsBest();
          break;
      case RenderModes.SAVED:
          updateSavedGame();
          break;
    }
    
  } else {
      canvas.style.display = "none";
  }
  drawNeuralNetwork();
}

function updateReviewGame() {
    if((!reviewGame || reviewGame.isOver || reviewtimer > MAX_GAME_LENGTH) && bestTank) {
      let tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, bestTank.brain.copy());
      if(current_gm == gamemode.AI_VS_AI) {
        let tank2 = new Tank(game_width/2 - 200, game_height/2, -Math.PI/2, secondTank.brain.copy());
        reviewGame = new Game(current_gm, tank, tank2);
      } else {
        reviewGame = new Game(current_gm, tank);
      }
      console.log("besttank: ", bestTank.score);
      console.log("secondtank: ", secondTank.score);
      reviewtimer = 0;
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
      reviewtimer += deltaTime/1000 ;
    }
}

function updatePlayVsBest() {
  if((!playvsbestGame || playvsbestGame.isOver || keyIsDown(82)) && bestTank) {
    let tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, bestTank.brain.copy());
    playvsbestGame = new Game(gamemode.PLAYER_VS_AI, tank);    
  }
  
  if(playvsbestGame) {
    playvsbestGame.update(deltaTime);
    
    background(219, 187, 126);
    playvsbestGame.render();
    let d = p5.Vector.sub(playvsbestGame.tanks[0].enemy.pos, playvsbestGame.tanks[0].pos)
    let p = playvsbestGame.tanks[0].pos;
    let o = p5.Vector.fromAngle(playvsbestGame.tanks[0].orientation);
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
      let tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, brain);
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
  renderRadio.option('vs. Best', 3);
  savedOption = renderRadio.option('Saved', 4);
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
  hitaccuracyLabel.html(`Hitaccuracy: <strong>${(Math.round(avgHitaccuracy*100)/100)}</strong>`)
}

function drawNeuralNetwork() {
  var infoheight = 500;
  var infowidth = 400;
  fill(255);
  stroke(0);
  strokeWeight(3);
  rect(game_width,0,infowidth - 2, game_height-2);
  strokeWeight(1);

  let nodesarray = [numberarray.length];

  let largest = 0;
  
  for(let nodes of numberarray) {
    if(nodes > largest) largest = nodes;
  }
  
  let d = (infoheight*0.65)/largest;
  if(d>50) d=50;
  let xoffset = 100;
  let yoffset =  (infoheight*0.2)/largest;
 
  let maxheight = (largest-1)*yoffset + largest*d;
  
  for(let i = 0; i < numberarray.length; i++) {
    nodesarray[i] = [];
    for(let j = 0; j < numberarray[i]; j++) {
      let layerheight = (numberarray[i]-1)*yoffset + numberarray[i]*d;
      nodesarray[i].push({x: game_width + infowidth*0.1 + xoffset*i, y: infoheight*0.32 + (maxheight-layerheight)/2 + j*(d+yoffset)});
    }
  }

  stroke(0);
  ellipseMode(CORNER);

  for(let i = 0; i < nodesarray.length; i++) {
    for(let j = 0; j < nodesarray[i].length; j++) {
      ellipse(nodesarray[i][j].x,nodesarray[i][j].y, d, d);
      if(nodesarray[i+1]) {
        for(let node of nodesarray[i+1]) {
          line(nodesarray[i][j].x + d,nodesarray[i][j].y + d/2, node.x, node.y+d/2);
        }
      }
    }
  }

  fill(0)
  textAlign(LEFT);
  textSize(22);
  text('Neural Network: ',game_width + 10, 30);
  textSize(18);

  for(let i = 0; i < numberarray.length; i++) {
    if(i==0) {
      text('Inputs:       ' + numberarray[i], game_width + 10, 55 + i*25);
    } else if(i==numberarray.length-1) {
      text('Outputs:    ' + numberarray[i], game_width + 10, 55 +  i*25);
    } else {
      text('Hidden-'+ (i) + ':  ' + numberarray[i], game_width + 10, 55 +  i*25);
    }
    
  }
  
  
  
  //ellipse(0,i*(d+offset), d, d);
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