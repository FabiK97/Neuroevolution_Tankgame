
var population = [];
var savedTanks = [];
var loadedbrain;

//Parameters

var fr = 60;
var FIXED_DT_IN_MS = 40;
var MAX_GAME_SPEED = 200;

var MAX_SCORE = 10;
var MAX_GAME_LENGTH = 20;
var MAX_FRAMES = MAX_GAME_LENGTH*1000/FIXED_DT_IN_MS;

var POP_SIZE = 100;
var MUTATION_RATE = 0.10;
var FITNESS_SCALING = "squared";
var ELITISM = true;
var BOT_MODE = "moving-y";
var OUTPUT_MODE = "mapped";
var OBSTACLES = false;
var INPUTS = 2;
var HIDDEN_1 = 10;
var HIDDEN_2 = null;
var OUTPUTS = 3;

var INPUT_CONFIG = {
  "position-x": false,
  "position-y": false,
  "velocity-x": false,
  "velocity-y": false,
  "direction": false,
  "turret-direction": false,
  "turret-rotation": false,
  "enemy-position-x": false,
  "enemy-position-y": false,
  "enemy-velocity-x": false,
  "enemy-velocity-y": false,
  "enemy-velocity-angle": false,
  "angle-to-enemy": true,
  "distance-to-enemy": true,
  "projectile-position-x": false,
  "projectile-position-y": false,
  "vision": false,
  "projectile-vision": false
};

var MODEL = null;

//Rendering
var game_width = 800;
var game_height = 600;


var uimanager;
var gamemanager;
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
  createCanvas(game_width+50+800,game_height);
  frameRate(fr);  
  //set Generations to 1
  generationCount = 1;
  avgScore = 0;
  
  canvas = document.getElementsByClassName("p5Canvas")[0]; 
  let main = document.getElementsByClassName("maincanvas")[0];
  main.appendChild(canvas); //get p5 canvas and add it into the the ui
  
  setupPlot(); //configure the chart with chart.js
  uimanager = new UIManager();
  gamemanager = new GameManager(uimanager);
}

/**
 * This is function is looped by p5.js, so this is the game loop
 */
function draw() {

  uimanager.update();
  gamemanager.update();
  
  fill(255);
  noStroke();
  rect(game_width, 0, 50, game_height); //draw the parting line between game and neural network visualization
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
        fill: false,
        borderColor: '#000000',
        pointRadius: 0,
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
                    },
                    scaleLabel: {
                      display: true,
                      labelString: 'Average Score',
                      fontSize: 20
                    }
                }],
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'Generations',
                    fontSize: 20
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
    score_data: scoreHistory,
    obstacles: OBSTACLES
  };
  saveJSON(json, `tank_${Math.round(bestTank.score)}.json`);
}

function setMaxGameLength(length) {
  MAX_GAME_LENGTH = length;
  MAX_FRAMES = MAX_GAME_LENGTH*1000/FIXED_DT_IN_MS;
}