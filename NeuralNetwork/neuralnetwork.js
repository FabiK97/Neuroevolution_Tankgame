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

        this.weights_i_h1 = this.weights_i_h1.map(randomize);
        this.weights_h1_h2 = this.weights_h1_h2.map(randomize);
        this.weights_h2_o = this.weights_h2_o.map(randomize);
        console.table(this.weights_i_h1._data);
        console.table(this.weights_h1_h2._data);
        console.table(this.weights_h2_o._data);

    }


    /**
     * feed forward the inputs and return an output
     */
    predict(inputs) {

        //transform input array into matrix
        inputs = math.matrix(inputs);

        //calculate signals into first hidden layer
        let h1_inputs = math.multiply(inputs, this.weights_i_h1);
        let h1_outputs = h1_inputs.map(sigmoid);

        //calculate signals into second hidden layer
        let h2_inputs = math.multiply(h1_outputs, this.weights_h1_h2);
        let h2_outputs = h2_inputs.map(sigmoid);

        //calculate signals into final output layer
        let final_inputs = math.multiply(h2_outputs, this.weights_h2_o);
        let final_outputs = final_inputs.map(sigmoid);
        
        return final_outputs._data;
    }
}

function sigmoid(x) {
    return 1 / (1 + math.pow(Math.E, -x));
}