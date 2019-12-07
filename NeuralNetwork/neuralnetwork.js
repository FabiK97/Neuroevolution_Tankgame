class NeuralNetwork {
    constructor(nodes_1, nodes_2, nodes_3, nodes_4) {
        //initialization of the Neural Network


        this.in = nodes_1,
        this.hn_1 = nodes_2;
        if(nodes_4) {
            this.hn_2 = nodes_3;
            this.on = nodes_4;
        } else {
            this.on = nodes_3;
        }

        //because I train the neural network using a genetic algorithm, I don´t need a learning rate
        /*  weights inside the arrays are w_i_j, where link is from node
            i to node j in the next layer
            w11 w21
            w12 w22 etc */


        this.weights_i_h = math.zeros(nodes_1, nodes_2);
        if(nodes_4) {
            this.weights_h1_h2 = math.zeros(nodes_2, nodes_3);
            this.weights_h_o = math.zeros(nodes_3, nodes_4);
        } else {
            this.weights_h_o = math.zeros(nodes_2, nodes_3);
        }


        //give them random values
        let randomize = function() {
            return math.random(-1, 1);
        }

        this.weights_i_h = this.weights_i_h.map(randomize);
        if(nodes_4) this.weights_h1_h2 = this.weights_h1_h2.map(randomize);
        this.weights_h_o = this.weights_h_o.map(randomize);
        
        //create biases
    
        
        this.bias_h1 = math.zeros(this.hn_1);
        this.bias_h1 = this.bias_h1.map(randomize);
        
        if(nodes_4) {
            this.bias_h2 = math.zeros(this.hn_2);
            this.bias_h2 = this.bias_h2.map(randomize);
        }
        
        this.bias_o = math.zeros(this.on);
        this.bias_o = this.bias_o.map(randomize);

    }


    /**
     * feed forward the inputs and return an output
     */
    predict(inputs) {

        //transform input array into matrix
        inputs = math.matrix(inputs);

        //calculate signals into first hidden layer
        let h1_inputs = math.multiply(inputs, this.weights_i_h);
            h1_inputs = math.add(h1_inputs, this.bias_h1);
        let h1_outputs = h1_inputs.map(sigmoid);
        
        //calculate signals into second hidden layer if exists
        if(this.hn_2) {
           let h2_inputs = math.multiply(h1_outputs, this.weights_h1_h2);
            h2_inputs = math.add(h2_inputs, this.bias_h2);
            let h2_outputs = h2_inputs.map(sigmoid); 
            
            //calculate signals into final output layer
            var final_inputs = math.multiply(h2_outputs, this.weights_h_o);
            final_inputs = math.add(final_inputs, this.bias_o);  
            var final_outputs = final_inputs.map(sigmoid);
        } else {
            var final_inputs = math.multiply(h1_outputs, this.weights_h_o);
            final_inputs = math.add(final_inputs, this.bias_o);  
            var final_outputs = final_inputs.map(sigmoid);
        }
        
        
        //return Array of outputs
        return final_outputs._data;
    }
    
    /**
     * Create a copy of the Neural Network and return it.
     */
    copy() {
        let copy;
        if(this.hn_2) {
            copy = new NeuralNetwork(this.in, this.hn_1, this.hn_2, this.on);
        } else {
            copy = new NeuralNetwork(this.in, this.hn_1, this.on);
        }

        copy.weights_i_h = this.weights_i_h.clone();
        copy.bias_h1 = this.bias_h1.clone();

        if(this.hn_2) {
            copy.weights_h1_h2 = this.weights_h1_h2.clone();
            copy.bias_h2 = this.bias_h2.clone();
        } 

        copy.weights_h_o = this.weights_h_o.clone();
        copy.bias_o = this.bias_o.clone();

        return copy;
    }

    /**
     * Mutate the weights and biases of the neural network with a propability rate.
     */
    mutate(rate) {
        function mutate(val) {
            if(Math.random() < rate) {
                return val + randomGaussian(0, 0.1); //take the current value and add a random amount to it.
            } else {
                return val;
            }
        }

        this.weights_i_h = this.weights_i_h.map(mutate);
        this.bias_h1 = this.bias_h1.map(mutate);
        
        if(this.hn_2) {
            this.weights_h1_h2 = this.weights_h1_h2.map(mutate);
            this.bias_h2 = this.bias_h2.map(mutate);
        }
        
        this.weights_h_o = this.weights_h_o.map(mutate);
        this.bias_o = this.bias_o.map(mutate);
    }

    /**
     * Take in the parents neural networks and select random weights of the mother and father
     */
    static crossover(mother, father) {

        let father_weigths = [];
        father_weigths.push(father.weights_i_h.clone());
        if(father.hn_2) father_weigths.push(father.weights_h1_h2.clone());
        father_weigths.push(father.weights_h_o.clone());

        let child = mother.copy();

        let child_weights = [];
        child_weights.push(child.weights_i_h);
        if(child.hn_2) child_weights.push(child.weights_h1_h2);
        child_weights.push(child.weights_h_o);

        for(let i = 0; i < father_weigths.length; i++) {
                father_weigths[i].forEach(function (value, index, matrix) {
                    if(Math.random() < 0.5) {
                        child_weights[i].subset(math.index(index[0], index[1]), value);
                    }
              });
        }

        return child;

    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data == 'string') {
            data = JSON.parse(data, math.reviver);
        }

        let nn;
        if(data.hn_2) {
            nn = new NeuralNetwork(data.in, data.hn_1, data.hn_2, data.on);
        } else {
            nn = new NeuralNetwork(data.in, data.hn_1, data.on);
        }

        nn.weights_i_h = data.weights_i_h;
        nn.bias_h1 = data.bias_h1;

        if(data.hn_2) {
            nn.weights_h1_h2 = data.weights_h1_h2;
            nn.bias_h2 = data.bias_h2; 
        }

        nn.weights_h_o = data.weights_h_o;
        nn.bias_o = data.bias_o; 
        return nn;
    }
}


function sigmoid(x) {
    return 1 / (1 + math.pow(Math.E, -x));
}