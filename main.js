
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
var uimanager;


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
  
  canvas = document.getElementsByClassName("p5Canvas")[0];
  let main = document.getElementsByClassName("maincanvas")[0];
  main.appendChild(canvas);
  
  setupPlot();
  uimanager = new UIManager();
  gamemanager = new GameManager(uimanager);
  //create a new Population of Games
  /* for(let i = 0; i < POP_SIZE; i++) {
    population[i] = new Game(current_gm);
  }

  let nn = population[0].tanks[0].brain;
  if(nn) {
    numberarray.push(nn.in);
    numberarray.push(nn.hn_1);
    if(nn.hn_2) numberarray.push(nn.hn_2);
    numberarray.push(nn.on);
  } */
}
  
function draw() {

  uimanager.update();
  gamemanager.update();
  
  drawNeuralNetwork();
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
  let json = {
    tankbrain: bestTank.brain,
    inputConfig: bestTank.inputConfig,
    botMode: bestTank.botMode,
    outputMode: bestTank.outputMode,
    gamemode: gamemanager.currentgm,
  };
  saveJSON(json, `tank_${Math.round(bestTank.score)}.json`);
}