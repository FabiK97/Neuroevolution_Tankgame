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
            element.addEventListener("click", function() {uimanager.selectedMode = this.id; uimanager.setupDrawingNeuralNetwork(); uimanager.setActive(this.id);});
        }

        this.selectedMode = "Multiplayer";
    
        //Information
        this.infobox = document.getElementById("infobox");
        this.popsizeElement = document.getElementById("pop");
        this.mutationrateElement = document.getElementById("mr");
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

        //Train with Model
        this.trainWithModelButton = document.getElementById("trainwithmodel");
        this.trainWithModelButton.addEventListener("click", () => {
          gamemanager.setModel(uimanager.savedGames[uimanager.selectedSavedGame]);
        });
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
                    this.popsizeElement.innerHTML = POP_SIZE;
                    this.mutationrateElement.innerHTML = Math.round(MUTATION_RATE*100) + "%";
                    this.generationElement.innerHTML = generationCount;
                    this.averageScoreElement.innerHTML = Math.round(avgScore*100)/100;;
                    if(avgHitaccuracy) this.hitaccuracyElement.innerHTML =  Math.round(avgHitaccuracy*100) + "%";;
                break;
            case "Savedgame":
                    this.popsizeElement.innerHTML = this.savedGames[this.selectedSavedGame].populationsize;
                    this.mutationrateElement.innerHTML = Math.round(this.savedGames[this.selectedSavedGame].mutationrate*100) + "%";
                    this.generationElement.innerHTML = this.savedGames[this.selectedSavedGame].generation;
                    this.averageScoreElement.innerHTML = Math.round(this.savedGames[this.selectedSavedGame].score*100)/100;
                    this.hitaccuracyElement.innerHTML = Math.round(this.savedGames[this.selectedSavedGame].hitaccuracy*100) + "%";
            break;
        }

    }

    setupDrawingNeuralNetwork() {
        let nn;
        let inputs;
        let outputs;
        this.inputsarray = [];
        this.outputsarray = [];
        if(this.selectedMode == "Training" && gamemanager.population) {
          nn = gamemanager.population[0].tanks[0].brain;
          inputs = gamemanager.population[0].tanks[0].inputConfig;
          outputs = gamemanager.population[0].tanks[0].outputMode;
        } else if(this.selectedMode == "Savedgame") {
          nn = this.savedGames[this.selectedSavedGame].tankbrain;
          inputs = this.savedGames[this.selectedSavedGame].inputConfig;
          outputs = gamemanager.population[0].tanks[0].outputMode;
        }

        this.numberarray = [];
        if(inputs && outputs) {
          for(let i of Object.keys(inputs)) {
            if(inputs[i] == true) this.inputsarray.push(i);
          }
          switch (outputs) {
            case "binary":
                this.outputsarray = ["drive forwards", "drive backwards", "turn right", "turn left", "shoot"];
              break;
            case "mapped":
                this.outputsarray = ["tank.velocity", "tank.rotation", "shoot"];
              break;
            case "mapped-turret":
                this.outputsarray = ["tank.velocity", "tank.rotation", "tank.turret.rotation", "shoot"];
            break;
          }
        }
        console.log(this.inputsarray);
        if(nn) {
          this.numberarray.push(nn.in);
          this.numberarray.push(nn.hn_1);
          if(nn.hn_2) this.numberarray.push(nn.hn_2);
          this.numberarray.push(nn.on);   
        }
        this.drawNeuralNetwork();
    }

    drawNeuralNetwork() {
        var infoheight = 500;
        var infowidth = 800;
        fill(255);
        stroke(0);
        strokeWeight(3);
        rect(game_width + 50,0,infowidth, game_height);
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
            nodesarray[i].push({x: game_width + 50 + infowidth*0.35 + xoffset*i, y: infoheight*0.32 + (maxheight-layerheight)/2 + j*(d+yoffset)});
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
        let distleft = 60;
        text('Neural Network: ',game_width + distleft, 30);
        textSize(18);
      
        for(let i = 0; i < this.numberarray.length; i++) {
          if(i==0) {
            text('Inputs:       ' + this.numberarray[i], game_width + distleft, 55 + i*25);
          } else if(i==this.numberarray.length-1) {
            text('Outputs:    ' + this.numberarray[i], game_width + distleft, 55 +  i*25);
          } else {
            text('Hidden-'+ (i) + ':  ' + this.numberarray[i], game_width + distleft, 55 +  i*25);
          }
          
        }

        textAlign(RIGHT);
        textSize(18);

        for(let j = 0; j < nodesarray[0].length; j++) {
          text(this.inputsarray[j],nodesarray[0][j].x - 20,nodesarray[0][j].y + d/2 + 5);
        }
        textAlign(LEFT);
        for(let j = 0; j < nodesarray[nodesarray.length - 1].length; j++) {
          text(this.outputsarray[j],nodesarray[nodesarray.length - 1][j].x + d + 20, nodesarray[nodesarray.length - 1][j].y + d/2 + 5);
        }


        
        
        //ellipse(0,i*(d+offset), d, d);



    }

    loadSavedGames() {
        this.savedGames = loadJSON("savedGames.json", function(obj) {createSavedGamesUI()});
    }

    setActive(id) {
      console.log(this.modeElements);
      for(let element of this.modeElements) {
        element.classList.remove("active");
        if(element.id == id) {
          element.classList.add("active");
        }
      }

    }

}

function createSavedGamesUI() {
    uimanager.savedgamesBox = document.getElementById("savedgames");
    uimanager.selectedSavedGame;

    for(let game of Object.keys(uimanager.savedGames)) {
        let a = createElement("a");
        a.class("list-group-item list-group-item-action nav-element");
        a.html(game);
        a.id(game);
        a.parent(uimanager.savedgamesBox);
        a.elt.addEventListener("click", function() {
          uimanager.selectedMode = "Savedgame"; 
          uimanager.selectedSavedGame = this.id; 
          if(gamemanager.saveGame) {
            gamemanager.saveGame.isOver = true;
          };
          uimanager.setupDrawingNeuralNetwork();
          uimanager.setActive(this.id);
        });
        a.elt.href = "#";
        uimanager.modeElements.push(a.elt);
    }
}