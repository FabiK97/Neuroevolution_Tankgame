
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
  
  uimanager.drawNeuralNetwork();
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