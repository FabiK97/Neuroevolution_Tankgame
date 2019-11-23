
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
    generation: generationCount,
    score: bestTank.score,
    hitaccuracy: bestTank.hitaccuracy
  };
  saveJSON(json, `tank_${Math.round(bestTank.score)}.json`);
}