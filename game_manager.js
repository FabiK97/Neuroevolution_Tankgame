class GameManager {
    
    constructor(uim) {
        this.population = null;
        this.savedTanks = null;
        this.uimanager = uim;
        this.reviewGame = 0;
        this.saveGame = null;
        this.loadSavedGames();
    }

    setupTraining() {
        this.population = [];
        this.savedTanks = [];
        this.currentgm = gamemode.BOT_VS_AI;
        for(let i = 0; i < POP_SIZE; i++) {
            this.population[i] = new Game(this.currentgm);
        }
    }

    run() {
        this.update();
        this.render();
    }

    update() {
        switch (this.uimanager.selectedMode) {
            case "Training":
                console.log(this.uimanager.renderMode);
                if(!this.population) this.setupTraining();
                switch(this.uimanager.renderMode) {
                    case "training": 
                        this.updateTraining();
                        this.renderTraining();
                    break;
                    case "best":
                        this.updateBestOfTraining(this.currentgm);
                        this.renderBestOfTraining(this.currentgm);
                    break;
                    case "playvsbest":
                        this.updateBestOfTraining(gamemode.PLAYER_VS_AI);
                        this.renderBestOfTraining(gamemode.PLAYER_VS_AI);
                    break;
                }
                

                break;
            case "Multiplayer":
                if(!this.game) this.game = new Game(gamemode.MULTIPLAYER);
                this.game.update(deltaTime);

                background(219, 187, 126);
                this.game.render();
                break;
            case "Savedgame":

                this.updateSavegame(this.savedGames[uimanager.selectedSavedGame].gamemode);
                this.renderSavegame();             

                break;
        }
    }

    updateTraining() {
        let dt = 40;
        for(let n = 0; n < this.uimanager.gameSpeedSlider.value(); n++) {
              timer += (dt/1000);
        
              //update the games
              for(let i = 0; i < this.population.length; i++) {
                this.population[i].update(dt);
              }
        
              //check if a game is over, delete it from the current population and save its AI Tank in an array
              for(let i = this.population.length - 1; i >= 0; i--) {
                
                if(this.population[i].isOver || timer > MAX_GAME_LENGTH) { 

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
                timer = 0;
              }
        }
    }  
    
    renderTraining() {
        background(219, 187, 126); 
        for(let i = 0; i < this.population.length; i++) {
            this.population[i].render();
        } 
    }

    updateBestOfTraining(gamemode) {
        if((!this.reviewGame || this.reviewGame.gamemode != gamemode || this.reviewGame.isOver || this.reviewtimer > MAX_GAME_LENGTH) && bestTank) {
            let tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, bestTank.brain.copy());
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
            background(219, 187, 126);
            this.reviewGame.render();
            let d = p5.Vector.sub(this.reviewGame.tanks[0].enemy.pos, this.reviewGame.tanks[0].pos)
            let p = this.reviewGame.tanks[0].pos;
            let o = p5.Vector.fromAngle(this.reviewGame.tanks[0].orientation);
            o.mult(100);
            stroke(255);
            strokeWeight(2);
            line(p.x,p.y,p.x+d.x,p.y+d.y);
            line(p.x,p.y,p.x+o.x,p.y+o.y);
            fill(0);
            noStroke();
            textSize(20);
            text("Highscore: " + highScore, 10, 30);
            this.reviewtimer += deltaTime/1000 ;
          }
    }

    loadSavedGames() {
        this.savedGames = loadJSON("savedGames.json", function(obj) {console.log(obj)});
    }

    updateSavegame(gamemode) {
        if(!this.saveGame || this.saveGame.gamemode != gamemode || this.saveGame.isOver || this.reviewtimer > MAX_GAME_LENGTH) {
            let gameobj = this.savedGames[uimanager.selectedSavedGame];
            let brainJSON = JSON.stringify(gameobj.tankbrain);
            let brain = NeuralNetwork.deserialize(brainJSON);
            var tank = new Tank(game_width/2 + 200, game_height/2, -Math.PI/2, brain.copy());
            tank.inputConfig = gameobj.inputs;
            tank.outputConfig = gameobj.outputs;
            tank.botMode = gameobj.botMode;
            if(gameobj.gamemode == gamemode.AI_VS_AI) {
                let tank2 = new Tank(game_width/2 - 200, game_height/2, -Math.PI/2, brain.copy());
                tank2.inputConfig = gameobj.inputConfig;
                tank2.outputConfig = gameobj.outputConfig;
                tank2.botMode= gameobj.botMode;
                this.saveGame = new Game(gamemode, tank, tank2);
            } else {
                this.saveGame = new Game(gamemode, tank);
            }
        } else {
            this.saveGame.update(deltaTime);
        }
    }

    renderSavegame() {
        if(this.saveGame) {
            background(219, 187, 126);
            this.saveGame.render();
            let d = p5.Vector.sub(this.saveGame.tanks[0].enemy.pos, this.saveGame.tanks[0].pos)
            let p = this.saveGame.tanks[0].pos;
            let o = p5.Vector.fromAngle(this.saveGame.tanks[0].orientation);
            o.mult(100);
            stroke(255);
            strokeWeight(2);
            line(p.x,p.y,p.x+d.x,p.y+d.y);
            line(p.x,p.y,p.x+o.x,p.y+o.y);
            fill(0);
            noStroke();
            textSize(20);
            this.reviewtimer += deltaTime/1000 ;
        }
    }
}