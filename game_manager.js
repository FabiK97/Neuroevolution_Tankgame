class GameManager {
    
    constructor(uim) {
        this.population = null;
        this.savedTanks = null;
        this.uimanager = uim;
        this.reviewGame = 0;
        this.saveGame = null;
        this.timer = 0;
        this.reviewtimer = 0;
    }

    setupTraining() {
        this.population = [];
        this.savedTanks = [];
        this.currentgm = gamemode.BOT_VS_AI;
        for(let i = 0; i < POP_SIZE; i++) { //create new population of games
            if(i == 0 && MODEL)  {
                let tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, MODEL);
                this.population[i] = new Game(this.currentgm, tank);
            } else {
                this.population[i] = new Game(this.currentgm);
            }
        }
        this.uimanager.setupDrawingNeuralNetwork(this.population[0].tanks[0].brain);
    }

    update() {
        switch (this.uimanager.selectedMode) {
            case "Training":
                if(!this.population) this.setupTraining(); //if there is no population yet, setup a new training
                switch(this.uimanager.renderMode) {
                    case "training": 
                        this.updateTraining();
                        if(this.uimanager.render) {
                            this.renderTraining();
                        } else {
                            fill(0);
                            rect(0,0,game_width, game_height);
                        }
                    break;
                    case "best":
                        this.updateBestOfTraining(this.currentgm);
                        this.renderBestOfTraining();
                    break;
                    case "playvsbest":
                        this.updateBestOfTraining(gamemode.PLAYER_VS_AI);
                        this.renderBestOfTraining();
                    break;
                }
                

                break;
            case "Multiplayer":
                if(!this.game || this.game.isOver) this.game = new Game(gamemode.MULTIPLAYER); //if there is no multiplayer game or the game is over, create a new one
                this.game.update(deltaTime);
                fill(219, 187, 126);
                rect(0,0,game_width, game_height) //Draw the background 
                this.game.render(); //Render the game

                break;
            case "Savedgame":
                switch(this.uimanager.savedgameRenderMode) {
                    case "review": 
                        this.updateSavegame(uimanager.savedGames[uimanager.selectedSavedGame].gamemode);
                        this.renderSavegame(); 
                    break;
                    case "playvsai":
                        this.updateSavegame(gamemode.PLAYER_VS_AI);
                        this.renderSavegame(); 
                    break;
                }
                           

                break;
        }
    }

    updateTraining() {
        for(let n = 0; n < this.uimanager.gameSpeedSlider.value(); n++) {
              this.timer += (FIXED_DT_IN_MS/1000);
        
              //update the games
              for(let i = 0; i < this.population.length; i++) {
                this.population[i].update(FIXED_DT_IN_MS);
              }
        
              //check if a game is over, delete it from the current population and save its AI Tank in an array
              
              for(let i = this.population.length - 1; i >= 0; i--) {
                
                if(this.population[i].isOver || this.timer > MAX_GAME_LENGTH) { 
                  let game = this.population.splice(i, 1)[0];
                  calculateScore(game.tanks[0]);

                  if(game.gamemode == gamemode.AI_VS_AI) {
                    calculateScore(game.tanks[1]);
                    if(game.tanks[0].score > game.tanks[0].score) {
                      this.savedTanks.push(game.tanks[0]);
                    } else {
                      this.savedTanks.push(game.tanks[1]);
                    }
                  } else {
                    this.savedTanks.push(game.tanks[0]);
                  }
                }
              }
        
              //if game is over, call nextgeneration
              if(this.population.length == 0) {
                nextGen();
                generationCount++;
                scoreHistory.push(avgScore);
                plotScore();
                this.timer = 0;
              }
        }
    }  
    
    renderTraining() {
        fill(219, 187, 126);
        rect(0,0,game_width, game_height) //Draw the background
        for(let i = 0; i < this.population.length; i++) { //Render every game on top of the other
            this.population[i].render();
        } 
    }

    updateBestOfTraining(gamemode) {
        if((!this.reviewGame || this.reviewGame.gamemode != gamemode || this.reviewGame.isOver || this.reviewtimer > MAX_GAME_LENGTH) && bestTank) { //If there is no reviewgame yet, or it is over, or the gamemode was switched and there is a best tank, create a new one
            this.uimanager.setupDrawingNeuralNetwork(bestTank.brain); //Change the visualization of the nn to the current
            let tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, bestTank.brain.copy()); //create a tank with the neural network of the current best
            if(gamemode == gamemode.AI_VS_AI) {
              let tank2 = new Tank(game_width/2 - 200, game_height/2, -Math.PI/2, secondTank.brain.copy());
              this.reviewGame = new Game(gamemode, tank, tank2);
            } else {
              this.reviewGame = new Game(gamemode, tank);
            }
            this.reviewtimer = 0;
        }
        if(this.reviewGame) this.reviewGame.update(deltaTime);
    }

    renderBestOfTraining() {
        if(this.reviewGame) {
            fill(219, 187, 126);
            rect(0,0,game_width, game_height) //draw the background
            this.reviewGame.render();
            let d = p5.Vector.sub(this.reviewGame.tanks[0].enemy.pos, this.reviewGame.tanks[0].pos)
            let p = this.reviewGame.tanks[0].pos;
            let o = p5.Vector.fromAngle(this.reviewGame.tanks[0].orientation);
            o.mult(100);
            stroke(255);
            strokeWeight(2);
            line(p.x,p.y,p.x+d.x,p.y+d.y); //draw some guidelines
            line(p.x,p.y,p.x+o.x,p.y+o.y);
            fill(0);
            noStroke();
            textSize(20);
            text("Highscore: " + highScore, 10, 30); //Print the highscore
            this.reviewtimer += deltaTime/1000 ;
          }
    }

    updateSavegame(gamemode) {
        if(!this.saveGame || this.saveGame.gamemode != gamemode || this.saveGame.isOver || this.reviewtimer > MAX_GAME_LENGTH) { //If there is no reviewgame yet, or it is over, or the gamemode was switched, create a new one
            let gameobj = uimanager.savedGames[uimanager.selectedSavedGame]; //get the configuration of the chosen savegame
            let brainJSON = JSON.stringify(gameobj.tankbrain); //serialize the neural network again
            let brain = NeuralNetwork.deserialize(brainJSON); //deserialize it with a math.js config
            this.uimanager.setupDrawingNeuralNetwork(brain); //Change the visualization of the nn to the current
            var tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, brain.copy());
            tank.inputConfig = gameobj.inputConfig;
            tank.setupRays(); 

            tank.outputMode = gameobj.outputMode;
            OBSTACLES = gameobj.obstacles;

            if(gameobj.gamemode == gamemode.AI_VS_AI) {
                let tank2 = new Tank(game_width/2 - 200, game_height/2, -Math.PI/2, brain.copy());
                tank2.inputConfig = gameobj.inputConfig;
                tank2.outputMode = gameobj.outputMode;
                tank2.botMode= gameobj.botMode;
                this.saveGame = new Game(gamemode, tank, tank2);
            } else {
                this.saveGame = new Game(gamemode, tank);
                this.saveGame.tanks[1].botMode = gameobj.botMode;
                if(gameobj.botMode != "moving-x") {
                    this.saveGame.tanks[1].pos = createVector(game_width/2 - 200, game_height/2);
                    this.saveGame.tanks[1].orientation = -Math.PI/2;
                    this.saveGame.tanks[1].turret.orientation = -Math.PI/2;
                } else {
                    this.saveGame.tanks[1].pos = createVector(game_width/2, game_height/4);
                    this.saveGame.tanks[1].orientation = 0;
                    this.saveGame.tanks[1].turret.orientation = 0;
                }
            }
            this.reviewtimer = 0;
        } else {
            this.saveGame.update(deltaTime);
        }
    }

    renderSavegame() {
        if(this.saveGame) {
            fill(219, 187, 126);
            rect(0,0,game_width, game_height) //background(219, 187, 126); 
            this.saveGame.render();
            let d = p5.Vector.sub(this.saveGame.tanks[0].enemy.pos, this.saveGame.tanks[0].pos)
            let p = this.saveGame.tanks[0].pos;
            let o = p5.Vector.fromAngle(this.saveGame.tanks[0].orientation);
            o.mult(100);
            stroke(255);
            strokeWeight(2);
            //line(p.x,p.y,p.x+d.x,p.y+d.y);
            //line(p.x,p.y,p.x+o.x,p.y+o.y);
            fill(0);
            noStroke();
            textSize(20);
            this.reviewtimer += deltaTime/1000 ;
        }
    }

    //set the configruation of the chosen tank and start training with this model
    setModel(gameobj) {
        let brainJSON = JSON.stringify(gameobj.tankbrain);
        let brain = NeuralNetwork.deserialize(brainJSON);
        MODEL = brain;
        INPUTS = brain.in;
        HIDDEN_1 = brain.hn_1;
        HIDDEN_2 = brain.hn_2;
        OUTPUTS = brain.on;
        this.setupTraining();
        this.uimanager.selectedMode = "Training";
    }
}