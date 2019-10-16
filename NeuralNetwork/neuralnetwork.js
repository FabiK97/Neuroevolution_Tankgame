class NeuralNetwork {
    constructor(inputnodes, hiddennodes_1, hiddennodes_2, outputnotes) {
        //initialization of the Neural Network
        this.in = inputnodes,
        this.hn_1 = hiddennodes_1;
        this.hn_2 = hiddennodes_2;
        this.on = outputnotes;

        //because I train the neural network using a genetic algorithm, I don´t need a learning rate
        /*  weights inside the arrays are w_i_j, where link is from node
            i to node j in the next layer
            w11 w21
            w12 w22 etc */
        this.weights_i_h1 = math.zeros(inputnodes, hiddennodes_1);
        this.weights_h1_h2 = math.zeros(hiddennodes_1, hiddennodes_2);
        this.weights_h2_o = math.zeros(hiddennodes_2, outputnotes);


        //give them random values
        let randomize = function() {
            return math.random(-1, 1);
        }

        this.weights_i_h1.map(randomize);
        this.weights_h1_h2.map(randomize);
        this.weights_h2_o.map(randomize);

        console.table(this.weights_i_h1.data);

    }


    /**
     * feed forward the inputs and return an output
     */
    predict() {

    }
}
