class UIManager {
    constructor() {
        this.init();
    }

    init() {
        this.selectedMode;
        this.sidebarelements = [];
        this.sidebarelements.push(document.getElementById("Multiplayer"));
        this.sidebarelements.push(document.getElementById("Training"));

        //create History
        this.historybox = document.getElementById("savedgames");
        let loaded = [
            {name: "Stationary"},
            {name: "Moving"},
        ]
        for(let game of loaded) {
            let a = createElement("a");
            a.class("list-group-item list-group-item-action bg-light");
            a.html(game.name);
            a.id(game.name);
            //a.mouseClicked(function() {uimanager.selectedMode = this.id(); console.log(this.id())});
            a.parent(this.historybox);
            this.sidebarelements.push(a.elt);
        }

        for(let element of this.sidebarelements) {
            element.addEventListener("click", function() {uimanager.selectedMode = this.id});
        }
    
        //Information
        this.generationElement = document.getElementById("gen");
        this.averageScoreElement = document.getElementById("as");
        this.hitaccuracyElement = document.getElementById("ha");

        //Options
        this.optionsBox = document.getElementById("optionsbox");
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

        //Graph
        this.scorePlot = document.getElementById("scorePlot");
        
    }

    update() {
        this.updateInfoBox();
        if(this.selectedMode == "Multiplayer") {
            this.optionsBox.style.display = "none";
            this.scorePlot.style.display = "none";
        } else {
            this.optionsBox.style.display = "block";
            this.scorePlot.style.display = "block";
        }
    }

    updateInfoBox() {
        this.generationElement.innerHTML = generationCount;
        this.averageScoreElement.innerHTML = avgScore;
        if(avgHitaccuracy) this.hitaccuracyElement.innerHTML = avgHitaccuracy;
    }

}