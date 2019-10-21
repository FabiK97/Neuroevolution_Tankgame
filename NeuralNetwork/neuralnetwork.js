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
        
        //create biases

        this.bias_h1 = math.zeros(this.hn_1);
        this.bias_h2 = math.zeros(this.hn_2);
        this.bias_o = math.zeros(this.on);

        this.bias_h1 = this.bias_h1.map(randomize);
        this.bias_h2 = this.bias_h2.map(randomize);
        this.bias_o = this.bias_o.map(randomize);
    }


    /**
     * feed forward the inputs and return an output
     */
    predict(inputs) {

        //transform input array into matrix
        inputs = math.matrix(inputs);

        //calculate signals into first hidden layer
        let h1_inputs = math.multiply(inputs, this.weights_i_h1);
            console.log(h1_inputs.size());
            console.log(this.bias_h1.size());
            h1_inputs = math.add(h1_inputs, this.bias_h1);
        let h1_outputs = h1_inputs.map(sigmoid);

        //calculate signals into second hidden layer
        let h2_inputs = math.multiply(h1_outputs, this.weights_h1_h2);
            h2_inputs = math.add(h2_inputs, this.bias_h2);
        let h2_outputs = h2_inputs.map(sigmoid);

        //calculate signals into final output layer
        let final_inputs = math.multiply(h2_outputs, this.weights_h2_o);
            final_inputs = math.add(final_inputs, this.bias_o);
        let final_outputs = final_inputs.map(sigmoid);
        
        //return Array of outputs
        return final_outputs._data;
    }
    
    copy() {
        let copy = new NeuralNetwork(this.in, this.hn_1, this.hn_2, this.on);
        copy.weights_i_h1 = this.weights_i_h1.clone();
        copy.weights_h1_h2 = this.weights_h1_h2.clone();
        copy.weights_h2_o = this.weights_h2_o.clone();
        return copy;
    }
}


function sigmoid(x) {
    return 1 / (1 + math.pow(Math.E, -x));
}