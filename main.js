
var population = [];
var savedTanks = [];
var loadedbrain;

//Parameters
var POP_SIZE = 100;
var MUTATION_RATE = 0.10;
var FITNESS_SCALING = "squared";
var fr = 60;
var FIXED_DT_IN_MS = 40;
var MAX_GAME_SPEED = 300;

var MAX_SCORE = 10;
var MAX_GAME_LENGTH = 20;
var MAX_FRAMES = MAX_GAME_LENGTH*1000/FIXED_DT_IN_MS;

var BOT_MODE = "moving-x";
var INPUTS = 6;
var HIDDEN_1 = 12;
var HIDDEN_2 = null;
var OUTPUTS = 3;

var MODEL = null;

//Rendering
var game_width = 800;
var game_height = 600;
var reviewtimer = 0;
var uimanager;

var timer = 0;

var scoreHistory = [];
var avgScore;
var avgHitaccuracy;
var highScore;

var canvas;

var gamemode = {
  MULTIPLAYER: 0,
  PLAYER_VS_AI: 1,
  AI_VS_AI:2,
  BOT_VS_AI:3
}

function setup() { 
  //Init things here
  createCanvas(game_width+400,game_height);
  frameRate(fr);  
  generationCount = 1;
  avgScore = 0;
  
  canvas = document.getElementsByClassName("p5Canvas")[0];
  let main = document.getElementsByClassName("maincanvas")[0];
  main.appendChild(canvas);
  
  setupPlot();
  uimanager = new UIManager();
  gamemanager = new GameManager(uimanager);
}
  
function draw() {

  uimanager.update();
  gamemanager.update();
  
  if(uimanager.render) uimanager.drawNeuralNetwork();
}



function setupPlot() {
  let maxy = MAX_SCORE;
  switch(FITNESS_SCALING) {
    case "linear":
        break;
    case "squared":
        maxy = maxy * maxy;
        break;
    case "exponential":
        maxy = pow(2, maxy);
        break;
}

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
    options: {responsive: false,
              scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        suggestedMax: maxy,    // minimum will be 0, unless there is a lower value.
                        // OR //
                        beginAtZero: false   // minimum value will be 0.
                    }
                }]
            }
    },
  });
}

function plotScore() {
  let labels = [...Array(generationCount-1).keys()];
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
    generation: generationCount,
    score: bestTank.score,
    hitaccuracy: bestTank.hitaccuracy,
    populationsize: POP_SIZE,
    mutationrate: MUTATION_RATE,
  };
  saveJSON(json, `tank_${Math.round(bestTank.score)}.json`);
}

function setMaxGameLength(length) {
  MAX_GAME_LENGTH = length;
  MAX_FRAMES = MAX_GAME_LENGTH*1000/FIXED_DT_IN_MS;
}