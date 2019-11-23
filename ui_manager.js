class UIManager {
    constructor() {
        this.loadSavedGames();
        this.init();
        this.numberarray = [];
    }

    init() {
        this.selectedMode;
        this.modeElements = [];
        this.modeElements.push(document.getElementById("Multiplayer"));
        this.modeElements.push(document.getElementById("Training"));

        //create History
        

        for(let element of this.modeElements) {
            element.addEventListener("click", function() {uimanager.selectedMode = this.id; uimanager.setupDrawingNeuralNetwork()});
        }
    
        //Information
        this.infobox = document.getElementById("infobox");
        this.generationElement = document.getElementById("gen");
        this.averageScoreElement = document.getElementById("as");
        this.hitaccuracyElement = document.getElementById("ha");

        //Options
        this.optionsBox = document.getElementById("optionsbox");

            //Render
            this.renderCheckbox = document.getElementById("render");
            this.render = true;
            this.renderCheckbox.addEventListener("click", function() {uimanager.render = this.checked});

            //Slider
            this.gameSpeedSlider = createSlider(1,MAX_GAME_SPEED,1);
            this.sliderBox = document.getElementById("sliderbox");
            this.gameSpeedSlider.parent(this.sliderBox);
        
            //Radios
            this.renderModeRadios = document.getElementsByName("renderModeRadios");
            this.renderMode = "training";
            for(let element of this.renderModeRadios) {
                element.addEventListener("click", function() {uimanager.renderMode = this.id});
            }
            
            //Download
            this.downloadButton = document.getElementById("download");
            this.downloadButton.addEventListener("click", downloadBest);
        

        //Options-Savegames
        this.optionsSavegameBox = document.getElementById("optionsbox-savedgame");
            
            //Radios
            this.savegameRenderModeRadios = document.getElementsByName("savegameRenderModeRadios");
            this.savedgameRenderMode = "review";
            for(let element of this.savegameRenderModeRadios) {
                element.addEventListener("click", function() {uimanager.savedgameRenderMode = this.id});
            }
        
        //Graph
        this.scorePlot = document.getElementById("scorePlot");
        
    }

    update() {
        this.updateInfoBox();
        switch (this.selectedMode) {
            case "Multiplayer":
                    this.optionsBox.style.display = "none";
                    this.optionsSavegameBox.style.display = "none";
                    this.scorePlot.style.display = "none";
                    this.infobox.style.display = "none";
                break;
        
            case "Training":
                    this.optionsBox.style.display = "block";
                    this.optionsSavegameBox.style.display = "none";
                    this.scorePlot.style.display = "block";
                    this.infobox.style.display = "block";
                break;
            case "Savedgame":
                    this.optionsBox.style.display = "none";
                    this.optionsSavegameBox.style.display = "block";
                    this.scorePlot.style.display = "none";
                    this.infobox.style.display = "block";
            break;
        }

        /* if(this.render) {
            canvas.style.display = "block";
        } else {
            canvas.style.display = "none";
        } */
        
    }

    updateInfoBox() {
        switch (this.selectedMode) {
            case "Multiplayer":
                 
                break;
        
            case "Training":
                    this.generationElement.innerHTML = generationCount;
                    this.averageScoreElement.innerHTML = avgScore;
                    console.log(avgHitaccuracy);
                    if(avgHitaccuracy) this.hitaccuracyElement.innerHTML = avgHitaccuracy;
                break;
            case "Savedgame":
                    this.generationElement.innerHTML = this.savedGames[this.selectedSavedGame].generation;
                    this.averageScoreElement.innerHTML = this.savedGames[this.selectedSavedGame].score;
                    this.hitaccuracyElement.innerHTML = this.savedGames[this.selectedSavedGame].hitaccuracy;
            break;
        }

    }

    setupDrawingNeuralNetwork() {
        let nn;
        if(this.selectedMode == "Training") {
          nn = gamemanager.population[0].tanks[0].brain;
        } else if(this.selectedMode == "Savedgame") {
          nn = this.savedGames[this.selectedSavedGame].tankbrain;
        }

        this.numberarray = [];
          if(nn) {
          this.numberarray.push(nn.in);
          this.numberarray.push(nn.hn_1);
          if(nn.hn_2) this.numberarray.push(nn.hn_2);
          this.numberarray.push(nn.on);   
        }
    }

    drawNeuralNetwork() {
        var infoheight = 500;
        var infowidth = 400;
        fill(255);
        stroke(0);
        strokeWeight(3);
        rect(game_width,0,infowidth - 2, game_height-2);
        strokeWeight(1);
      
        let nodesarray = [this.numberarray.length];
      
        let largest = 0;
        
        for(let nodes of this.numberarray) {
          if(nodes > largest) largest = nodes;
        }
        
        let d = (infoheight*0.65)/largest;
        if(d>50) d=50;
        let xoffset = 100;
        let yoffset =  (infoheight*0.2)/largest;
       
        let maxheight = (largest-1)*yoffset + largest*d;
        
        for(let i = 0; i < this.numberarray.length; i++) {
          nodesarray[i] = [];
          for(let j = 0; j < this.numberarray[i]; j++) {
            let layerheight = (this.numberarray[i]-1)*yoffset + this.numberarray[i]*d;
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
      
        for(let i = 0; i < this.numberarray.length; i++) {
          if(i==0) {
            text('Inputs:       ' + this.numberarray[i], game_width + 10, 55 + i*25);
          } else if(i==this.numberarray.length-1) {
            text('Outputs:    ' + this.numberarray[i], game_width + 10, 55 +  i*25);
          } else {
            text('Hidden-'+ (i) + ':  ' + this.numberarray[i], game_width + 10, 55 +  i*25);
          }
          
        }
        //ellipse(0,i*(d+offset), d, d);
      }

      loadSavedGames() {
        this.savedGames = loadJSON("savedGames.json", function(obj) {createSavedGamesUI()});
    }

}

function createSavedGamesUI() {
    console.log("test");
    uimanager.savedgamesBox = document.getElementById("savedgames");
    uimanager.selectedSavedGame;

    for(let game of Object.keys(uimanager.savedGames)) {
        let a = createElement("a");
        a.class("list-group-item list-group-item-action bg-light");
        a.html(game);
        a.id(game);
        a.parent(uimanager.savedgamesBox);
        a.elt.addEventListener("click", function() {uimanager.selectedMode = "Savedgame"; uimanager.selectedSavedGame = this.id; uimanager.setupDrawingNeuralNetwork()});
    }
}