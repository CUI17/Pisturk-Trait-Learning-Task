/********************
* Author: Lee Qianqian Cui
* aka 东海艺术家 崔某 
* Email: qc697@nyu.edu
* Website: https://qianqiancui.github.io/
* Trait Learning Task
* New York University
* Winter 2020
* Evolved from Psiturk setup-example (the stroop test);
********************/
/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */
// Initalize psiturk object, do not delete
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [

	"instructions/instruct-ready.html",
	"stage.html",
    "postquestionnaire.html",
    "instructions/ansInstruct-ready.html"
];

psiTurk.preloadPages(pages);

var training_instruction_pages = [ // add as a list as many pages as you like

	"instructions/instruct-ready.html"
];

var testing_instruction_pages = [// add as a list as many pages as you like
    "instructions/ansInstruct-ready.html"
];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/



/****************************************************************************************************************************************************
*  TRAINING PHASE   *
****************************************************************************************************************************************************/
var training_phase = function () {
    var stim_on, // time stimulus is presented
        listening = false;
    var stimFolder = "/static/images/"

    var reward_result;
    var gen_result;
    var pool_result;

    var fixation_time = 1000;
    var testing_trial_num = 12;


    var good_choice_or_not;
    var correct_choice;

    var left_target;
    var right_target;

    //start to count the trial
    var testing_trial_count = 0;

    var show_feedback_time = 3000;

    var max_reaction_time = 3000;

    var result_display_delay = 500;

    //a 'container' that load trials for different pairs;
    var trial_container = [];

    var stim_array = [];

    var warning;

    var block_id;

    var testing_trial_inside_block;

    var left_good_choice = 0;
    var right_good_choice = 0;
    var total_left_good_chocie = 0;
    var total_right_good_choice = 0;

    //use this function to purmute choices
    //var input = [["1.jpg", "A", 0.2], ["2.jpg", "B", 0.4], ["3.jpg", "C", 0.4],
    //            ["4.jpg", "D", 0.2]
    //function purmute_choices(arr) {
    //    var i, j, comb,
    //        len = arr.length,
    //        list = [];

    //    for (i = 0; i < len; i++) {
    //        for (j = 0; j < len; j++) {
    //            if (j !== i) {
    //                comb = [arr[i], arr[j]].sort(function (a, b) { return a - b }).join(",");
    //                if (list.indexOf(comb) < 0) {
    //                    list.push([comb]);
    //                }
    //            }
    //        }
    //    }
    //    return list;
    //}

    //var testing_pairs = purmute_choices(input);

    //console.log(testing_pairs)


    function getNumberInNormalDistribution(mean, sd) {
        return mean + (randomNormalDistribution() * sd);
    }

    function randomNormalDistribution() {
        var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
        do {
            //获得两个（-1,1）的独立随机变量
            u = Math.random() * 2 - 1.0;
            v = Math.random() * 2 - 1.0;
            w = u * u + v * v;

        } while (w == 0.0 || w >= 1.0)
        //这里就是 Box-Muller转换

        c = Math.sqrt((-2 * Math.log(w)) / w);
        return u * c;
    }

    target_num = 72;

    function reward(re_mean, re_sd, re_min) {

        var reward_list = [];
        var temp = [];

        for (i = 0; i < target_num; i++) {
            temp[i] = getNumberInNormalDistribution(re_mean, re_sd);
            reward_list[i] = Math.round(re_min + temp[i]);

            if (reward_list[i] < re_min) {
                reward_list[i] = re_min;
            }
        }
        return reward_list;
    }

    function generosity(gen_mean, gen_sd, gen_min) {

        var gen_list = [];
        var temp = [];

        for (i = 0; i < target_num; i++) {
            temp[i] = getNumberInNormalDistribution(gen_mean, gen_sd);
            gen_list[i] = gen_min + temp[i];

            if (gen_list[i] < gen_min) {
                gen_list[i] = gen_min;
            }
            if (gen_list[i] > 1) {
                gen_list[i] = 1;
            }
        }
        return gen_list;
    }

    function pool(target_reward_list, target_gen_list) {
        var pool_list = [];
        for (i = 0; i < target_gen_list.length; i++) {
            pool_list[i] = Math.round(target_reward_list[i] / target_gen_list[i]);
        }
        return pool_list;
    }

    var reward_A = [].concat(reward(20, 10, 2));
    var reward_B = [].concat(reward(20, 10, 2));
    var reward_C = [].concat(reward(40, 10, 2));
    var reward_D = [].concat(reward(40, 10, 2));
    var gen_A = [].concat(generosity(0.2, 0.1, 0.01));
    var gen_B = [].concat(generosity(0.4, 0.1, 0.01));
    var gen_C = [].concat(generosity(0.2, 0.1, 0.01));
    var gen_D = [].concat(generosity(0.4, 0.1, 0.01));
    var pool_A = [].concat(pool(reward_A, gen_A));
    var pool_B = [].concat(pool(reward_B, gen_B));
    var pool_C = [].concat(pool(reward_C, gen_C));
    var pool_D = [].concat(pool(reward_D, gen_D));


    var testing_pairs = [
        [["1.jpg", "A", 20, "2.jpg", "B", 20]], [["1.jpg", "A", 20, "3.jpg", "C", 0.4]], [["1.jpg", "A", 0.2, "4.jpg", "D", 0.2]],
        [["2.jpg", "B", 20, "3.jpg", "C", 40]], [["2.jpg", "B", 20, "4.jpg", "D", 0.2]], [["3.jpg", "C", 0.4, "4.jpg", "D", 0.2]]
    ];


    var testing_pairs_reverse_order = [
        [["2.jpg", "B", 0.4, "1.jpg", "A", 0.2]], [["3.jpg", "C", 0.4, "1.jpg", "A", 0.2]], [["4.jpg", "D", 0.2, "1.jpg", "A", 0.2]],
        [["3.jpg", "C", 0.4, "2.jpg", "B", 0.4]], [["4.jpg", "D", 0.2, "2.jpg", "B", 0.4]], [["4.jpg", "D", 0.2, "3.jpg", "C", 0.4]]
    ];

    testing_pairs = _.shuffle(testing_pairs);
    testing_pairs_reverse_order = _.shuffle(testing_pairs_reverse_order);


    var add_trial_and_rand = function (testing_pairs_1, testing_pairs_2, i) {

        var trial_container_1 = [];
        var trial_container_2 = [];
        var trial_container_3 = [];


        for (var x = 0; x < testing_trial_num / 2; x++) {

            trial_container_1 = trial_container_1.concat(testing_pairs_1[i]);
        };
        for (var y = 0; y < testing_trial_num / 2; y++) {

            trial_container_2 = trial_container_2.concat(testing_pairs_2[i]);
        };

        trial_container_3 = _.shuffle([].concat(trial_container_1).concat(trial_container_2));
        trial_container = _.shuffle(trial_container.concat(trial_container_3));

    };


    var block_order = [];
    var block_order_id;

    for (var j = 0; j < 6; j++) {

        block_order.push(j);

    };

    for (var z = 0; z < 6; z++) {

        //console.log(block_order,'111');
        block_order = _.shuffle(block_order);
        block_order_id = block_order.shift();


        add_trial_and_rand(testing_pairs, testing_pairs_reverse_order, block_order_id);
 
    };
    console.log(block_order_id, '令人头秃');


    var show_fixation_cross_and_next_trial = function () {

        d3.select("#stim1_name").html('');
        d3.select("#stim2_name").html('');
        //d3.select("#query").html('');

        d3.select("#fixation_cross").html("+");

        d3.select('#warning').html('');

        setTimeout(function () {
            d3.select("#fixation_cross").html("+");
            next();
        }, fixation_time);
    };

    var next = function () {
        if (trial_container.length === 0) {
            //    finish();
            //}

            return psiTurk.doInstructions(testing_instruction_pages,
                function () {
                    currentview = new testing_phase();                   
                }
            );
        }else {
            stim_array = trial_container.shift();

            stim1 = stim_array[0];

            stim2 = stim_array[3];

            stim1_name = stim_array[1];
            stim2_name = stim_array[4];

            stim1_prob = stim_array[2];
            stim2_prob = stim_array[5];

            

            //if (stim1_prob > stim2_prob) {
            //    correct_choice = stim1_name;
            //    left_good_choice = 1, right_good_choice = 0;
            //    total_left_good_chocie++;
            //} else {
            //    corrrect_choice = stim2_name;
            //    left_good_choice = 0, right_good_choice = 1;
            //    total_right_good_choice++;
            //};

            switch (stim1_name) {
                case "A":
                    stim1_reward = reward_A.shift();
                    stim1_gen = gen_A.shift();
                    stim1_pool = pool_A.shift();
                    break;

                case "B":
                    stim1_reward = reward_B.shift();
                    stim1_gen = gen_B.shift();
                    stim1_pool = pool_B.shift();
                    break;
                case "C":
                    stim1_reward = reward_C.shift();
                    stim1_gen = gen_C.shift();
                    stim1_pool = pool_C.shift();
                    break;
                case "D":
                    stim1_reward = reward_D.shift();
                    stim1_gen = gen_D.shift();
                    stim1_pool = pool_D.shift();
                    break;
            }

            switch (stim2_name) {
                case "A":
                    stim2_reward = reward_A.shift();
                    stim2_gen = gen_A.shift();
                    stim2_pool = pool_A.shift();
                    break;
                case "B":
                    stim2_reward = reward_B.shift();
                    stim2_gen = gen_B.shift();
                    stim2_pool = pool_B.shift();
                    break;
                case "C":
                    stim2_reward = reward_C.shift();
                    stim2_gen = gen_C.shift();
                    stim2_pool = pool_C.shift();
                    break;
                case "D":
                    stim2_reward = reward_D.shift();
                    stim2_gen = gen_D.shift();
                    stim2_pool = pool_D.shift();
                    break;
            }


            show_stim(stim1, stim2);

        };

        right_target = stim2_name;
        left_target = stim1_name;


        stim_on = new Date().getTime();

        listening = true;


        d3.select("#stim1_name").html(stim1_name);
        d3.select("#stim2_name").html(stim2_name);
        //d3.select("#query").html('<p id="prompt">Type left arrow for Left, right arrow for Right.</p>');
    };


    var timer;
    //record subject's response
    var response_handler = function (e) {

        if (!listening) return;

        var keyCode = e.keyCode,
            response;

        if (!warning) {
            //get key code;   

            switch (keyCode) {
                // press [F]
                case 74:
                    //target on the left

                    response = stim2_name;
                    document.getElementById('stim2').style.border = "5px solid yellow";
                    document.getElementById('stim1').style.opacity = 0.3;
                    response_received = true;
                    break;

                // press [J]
                case 70:
                    //target on the RIGHT
                    response = stim1_name;
                    document.getElementById('stim1').style.border = "5px solid yellow";
                    document.getElementById('stim2').style.opacity = 0.3;
                    response_received = true;
                    break;

                default:
                    response = "";
                    break;
            }
        } else {
            response = 'NaN';
        }


        if (response.length > 0 && !warning) {

            //var keyCode = e.keyCode,
            //    response;

            //switch (keyCode) {
            //    // press [F]
            //    case 74:
            //        //target on the left
            //        response = stim2_name;
            //        document.getElementById('stim2').style.border = "5px solid yellow";
            //        document.getElementById('stim1').style.opacity = 0.3;
            //        response_received = true;
            //        break;

            //    // press [J]
            //    case 70:
            //        //target on the RIGHT
            //        response = stim1_name;
            //        document.getElementById('stim1').style.border = "5px solid yellow";
            //        document.getElementById('stim2').style.opacity = 0.3;
            //        response_received = true;
            //        break;

            //    default:
            //        response = "";
            //        break;
            //}


            listening = false;

            if (response == stim1_name) {

                reward_result = stim1_reward;
                pool_result = stim1_pool;
                gen_result = stim1_gen;

            } else {
                reward_result = stim2_reward;
                pool_result = stim2_pool;
                gen_result = stim2_gen;
            }

            setTimeout(function () {

            d3.select('#reward_prompt').html("you get:");
            d3.select('#reward_result').html(reward_result);

            d3.select('#pool_prompt').html("out of:");
            d3.select('#pool_result').html(pool_result);

            }, result_display_delay);


            var hit = response;
            var rt = new Date().getTime() - stim_on;

            //record data;
            psiTurk.recordTrialData({
                'phase': "Learning",
                'block': block_id,
                'trial': testing_trial_count,
                'trial inside block': testing_trial_inside_block,
                'rt': rt,
                'response': hit,
                'left_target': left_target,
                'right_target': right_target,
                'left_pic_name': stim1,
                'right_pic_name': stim2

            });


            console.log(reward_result, pool_result, gen_result, 'block:', block_id, ';', 'trial:', testing_trial_count, '; ', 'trial inside block:', ';',
                testing_trial_inside_block, 'reaction_time:', rt, '; ', 'response:', hit, '; ',
                 'left_target:', left_target, ';',
                'right_target:', right_target, ';', 'left_pic_name:', stim1, ';', 'right_pic_name:', stim2);



            setTimeout(function () {

                remove_stim();
                show_fixation_cross_and_next_trial();
                // display next stimuli after 500ms;
            }, 500 + show_feedback_time);
        };



        if (timer) {
            // cancel existing timer if exist;
            clearTimeout(timer);
        }

    };



    // display the stimuli;
    // change each picture's properties or appearance;
    var show_stim = function (image1, image2) {

        testing_trial_count++;

        //testing_trial_inside_block = testing_trial_count - 6*Math.floor((testing_trial_count - 1));

        switch (Math.floor((testing_trial_count - 1) / 6)) {
            case 0:
                block_id = 1;
                testing_trial_inside_block = testing_trial_count;
                break;

            case 1:
                block_id = 2;
                testing_trial_inside_block = testing_trial_count - 6;
                break;

            case 2:
                block_id = 3;
                testing_trial_inside_block = testing_trial_count - 12;
                break;
            case 3:
                block_id = 4;
                testing_trial_inside_block = testing_trial_count - 18;
                break;
            case 4:
                block_id = 5;
                testing_trial_inside_block = testing_trial_count - 24;
                break;
            case 5:
                block_id = 6;
                testing_trial_inside_block = testing_trial_count - 30;
                break;
            case 6:
                block_id = 7;
                testing_trial_inside_block = testing_trial_count - 36;
                break;
            case 7:
                block_id = 8;
                testing_trial_inside_block = testing_trial_count - 42;
                break;
            case 8:
                block_id = 9;
                testing_trial_inside_block = testing_trial_count - 48;
                break;
            case 9:
                block_id = 10;
                testing_trial_inside_block = testing_trial_count - 54;
                break;
            case 10:
                block_id = 11;
                testing_trial_inside_block = testing_trial_count - 60;
                break;
            case 11:
                block_id = 12;
                testing_trial_inside_block = testing_trial_count - 66;
                break;
        };



        d3.select("#stim1")
            .append("img")
            .attr("src", stimFolder + image1)
            .attr("id", 'pic1')
            .style("width", "300px")
            .style("height", "300px")
            .style("border", "initial");

        d3.select("#stim2")
            .append("img") // append image
            .attr("src", stimFolder + image2)
            .attr("id", 'pic2')
            .style("width", "300px")
            .style("height", "300px")
            .style("border", "initial");

        d3.select('#warning').html('');
        warning = false;

   


        timer = setTimeout(function () {
            d3.select('#warning').html('TOO SLOW!');
            warning = true;


            var rt = '> 3000';

            var response = 'NaN';
            //var good_choice_or_not = 'NaN';

            psiTurk.recordTrialData({
                'phase': "Testing",
                'block': block_id,
                'trial': testing_trial_count,
                'trial inside block': testing_trial_inside_block,
                'rt': rt,
                'response': response,
                'left_target': left_target,
                'right_target': right_target,
 
                'left_pic_name': stim1,
                'right_pic_name': stim2

            });


            console.log('block:', ';', block_id, 'trial:', testing_trial_count, '; ', 'trial inside block:', ';',
                testing_trial_inside_block, 'reaction_time:', rt, '; ', 'response:', response, '; ',
                 'left_target:', left_target, ';',
                'right_target:', right_target, ';', 'left_pic_name:', stim1, ';', 'right_pic_name:', stim2);

            setTimeout(function () {
                remove_stim();
                show_fixation_cross_and_next_trial();
            }, 500);
        }, max_reaction_time);

    };


    //remove previously displayed information on the screen;
    var remove_stim = function () {
        //remove the previous images;
        d3.select("#pic1").remove();
        d3.select("#pic2").remove();

        //set the border of each image to initial state;
        document.getElementById('stim1').style.border = "initial";
        document.getElementById('stim2').style.border = "initial";
        document.getElementById('stim1').style.opacity = 1;
        document.getElementById('stim2').style.opacity = 1;

        d3.select('#warning').html('');
        d3.select('#reward_prompt').html('');
        d3.select('#reward_result').html('');
        d3.select('#pool_prompt').html('');
        d3.select('#pool_result').html('');

    };


    // Load the stage.html snippet into the body of the page
    psiTurk.showPage('stage.html');

    // Register the response handler that is defined above to handle any
    // key down events.
    $("body").focus().keydown(response_handler);

    // Start the test
    show_fixation_cross_and_next_trial();
};



/****************************************************************************************************************************************
*   TESTING PHASE   *
****************************************************************************************************************************************/
var testing_phase = function () {
    console.log('ENTER TESTING PHASE ...');
    var testing_pool = [];

    var stim_on, // time stimulus is presented
        listening = false;
    var stimFolder = "/static/images/"

    var pool_result;

    var fixation_time = 1000;
    var testing_trial_num = 12;


    var good_choice_or_not;
    var correct_choice;

    var left_target;
    var right_target;

    //start to count the trial
    var testing_trial_count = 0;

    var show_feedback_time = 300;

    var max_reaction_time = 3000;

    //a 'container' that load trials for different pairs;
    var trial_container = [];

    var stim_array = [];

    var warning;

    var block_id;

    var testing_trial_inside_block;

    var left_good_choice = 0;
    var right_good_choice = 0;
    var total_left_good_chocie = 0;
    var total_right_good_choice = 0;

    var target_num;


    //use this function to purmute choices
    //var input = [["1.jpg", "A", 0.2], ["2.jpg", "B", 0.4], ["3.jpg", "C", 0.4],
    //            ["4.jpg", "D", 0.2]
    //function purmute_choices(arr) {
    //    var i, j, comb,
    //        len = arr.length,
    //        list = [];

    //    for (i = 0; i < len; i++) {
    //        for (j = 0; j < len; j++) {
    //            if (j !== i) {
    //                comb = [arr[i], arr[j]].sort(function (a, b) { return a - b }).join(",");
    //                if (list.indexOf(comb) < 0) {
    //                    list.push([comb]);
    //                }
    //            }
    //        }
    //    }
    //    return list;
    //}

    //var testing_pairs = purmute_choices(input);

    //console.log(testing_pairs)


    //function getNumberInNormalDistribution(mean, sd) {
    //    return mean + (randomNormalDistribution() * sd);
    //}

    //function randomNormalDistribution() {
    //    var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
    //    do {
    //        //获得两个（-1,1）的独立随机变量
    //        u = Math.random() * 2 - 1.0;
    //        v = Math.random() * 2 - 1.0;
    //        w = u * u + v * v;

    //    } while (w == 0.0 || w >= 1.0)
    //    //这里就是 Box-Muller转换

    //    c = Math.sqrt((-2 * Math.log(w)) / w);
    //    return u * c;
    //}


  
    function get_pool_number(num_1, num_2, num_3, num_4, num_5) {

        var original_pool;


        original_pool = Math.random()*100;

        if (original_pool < 10) {
            original_pool = 10;
        }

        //original_pool = Math.round(Math.random(pool_mean, pool_sd));
        for (i = 0; i < num_1; i++) {
            testing_pool = testing_pool.concat(Math.round(original_pool * 0.67));
        }
        for (i = 0; i < num_2; i++) {
            testing_pool = testing_pool.concat(Math.round(original_pool * 0.9));
        }
        for (i = 0; i < num_3; i++) {
            testing_pool = testing_pool.concat(Math.round(original_pool * 1));
        }
        for (i = 0; i < num_4; i++) {
            testing_pool = testing_pool.concat(Math.round(original_pool * 1.11));
        }
        for (i = 0; i < num_5; i++) {
            testing_pool = testing_pool.concat(Math.round(original_pool * 1.5));
        }
        testing_pool = _.shuffle(testing_pool);
        return testing_pool;
    }
    get_pool_number(12,12,24,12,12);


  


    var testing_pairs = [
        [["1.jpg", "A", 20, "2.jpg", "B", 20]], [["1.jpg", "A", 20, "3.jpg", "C", 0.4]], [["1.jpg", "A", 0.2, "4.jpg", "D", 0.2]],
        [["2.jpg", "B", 20, "3.jpg", "C", 40]], [["2.jpg", "B", 20, "4.jpg", "D", 0.2]], [["3.jpg", "C", 0.4, "4.jpg", "D", 0.2]]
    ];


    var testing_pairs_reverse_order = [
        [["2.jpg", "B", 0.4, "1.jpg", "A", 0.2]], [["3.jpg", "C", 0.4, "1.jpg", "A", 0.2]], [["4.jpg", "D", 0.2, "1.jpg", "A", 0.2]],
        [["3.jpg", "C", 0.4, "2.jpg", "B", 0.4]], [["4.jpg", "D", 0.2, "2.jpg", "B", 0.4]], [["4.jpg", "D", 0.2, "3.jpg", "C", 0.4]]
    ];

    testing_pairs = _.shuffle(testing_pairs);
    testing_pairs_reverse_order = _.shuffle(testing_pairs_reverse_order);


    var add_trial_and_rand = function (testing_pairs_1, testing_pairs_2, i) {

        var trial_container_1 = [];
        var trial_container_2 = [];
        var trial_container_3 = [];


        for (var x = 0; x < testing_trial_num / 2; x++) {

            trial_container_1 = trial_container_1.concat(testing_pairs_1[i]);
        };
        for (var y = 0; y < testing_trial_num / 2; y++) {

            trial_container_2 = trial_container_2.concat(testing_pairs_2[i]);
        };

        trial_container_3 = _.shuffle([].concat(trial_container_1).concat(trial_container_2));
        trial_container = _.shuffle(trial_container.concat(trial_container_3));

    };


    var block_order = [];
    var block_order_id;

    for (var j = 0; j < 6; j++) {

        block_order.push(j);

    };

    for (var z = 0; z < 6; z++) {

        //console.log(block_order,'111');
        block_order = _.shuffle(block_order);
        block_order_id = block_order.shift();
        add_trial_and_rand(testing_pairs, testing_pairs_reverse_order, block_order_id);
        console.log(block_order_id, '令人头秃');
    };


    var show_fixation_cross_and_next_trial = function () {

        d3.select("#stim1_name").html('');
        d3.select("#stim2_name").html('');
        //d3.select("#query").html('');

        d3.select("#fixation_cross").html("+");

        d3.select('#warning').html('');

        setTimeout(function () {
            d3.select("#fixation_cross").html("+");
            next();
        }, fixation_time);
    };

    var next = function () {
        if (trial_container.length === 0) {
                    finish();
        } else {
            stim_array = trial_container.shift();

            stim1 = stim_array[0];

            stim2 = stim_array[3];

            stim1_name = stim_array[1];
            stim2_name = stim_array[4];

            stim1_prob = stim_array[2];
            stim2_prob = stim_array[5];

            pool_result = testing_pool.shift();


            //if (stim1_prob > stim2_prob) {
            //    correct_choice = stim1_name;
            //    left_good_choice = 1, right_good_choice = 0;
            //    total_left_good_chocie++;
            //} else {
            //    corrrect_choice = stim2_name;
            //    left_good_choice = 0, right_good_choice = 1;
            //    total_right_good_choice++;
            //};


            d3.select('#pool_prompt').html("out of:");
            d3.select('#pool_result').html(pool_result);

            show_stim(stim1, stim2);

        };

        right_target = stim2_name;
        left_target = stim1_name;


        stim_on = new Date().getTime();

        listening = true;


        d3.select("#stim1_name").html(stim1_name);
        d3.select("#stim2_name").html(stim2_name);
        //d3.select("#query").html('<p id="prompt">Type left arrow for Left, right arrow for Right.</p>');
    };


    var timer;
    //record subject's response
    var response_handler = function (e) {

        if (!listening) return;
        
        //get key code;
        var keyCode = e.keyCode,
            response;

        if (!warning) {
            switch (keyCode) {
                // press [F]
                case 74:
                    //target on the left
                    response = stim2_name;
                    document.getElementById('stim2').style.border = "5px solid yellow";
                    document.getElementById('stim1').style.opacity = 0.3;
                    response_received = true;
                    break;

                // press [J]
                case 70:
                    //target on the RIGHT
                    response = stim1_name;
                    document.getElementById('stim1').style.border = "5px solid yellow";
                    document.getElementById('stim2').style.opacity = 0.3;
                    response_received = true;
                    break;

                default:
                    response = "";
                    break;
            }
        } else {
            response = 'NaN';
        }


        if (response.length > 0 && !warning) {

            listening = false;

            //if (response === correct_choice) {
            //    good_choice_or_not = 'Good Choice';
            //}
            //else {
            //    good_choice_or_not = 'Bad Choice';
            //};

            //console.log(correct_choice);

            var hit = response;
            var rt = new Date().getTime() - stim_on;

            //record data;
            psiTurk.recordTrialData({
                'phase': "Testing",
                'block': block_id,
                'trial': testing_trial_count,
                'trial inside block': testing_trial_inside_block,
                'rt': rt,
                'response': hit,
                'left_target': left_target,
                'right_target': right_target,
                'left_pic_name': stim1,
                'right_pic_name': stim2

            });


            console.log(pool_result, 'block:', block_id, ';', 'trial:', testing_trial_count, '; ', 'trial inside block:', ';',
                testing_trial_inside_block, 'reaction_time:', rt, '; ', 'response:', hit, '; ',
                 'left_target:', left_target, ';',
                'right_target:', right_target, ';', 
              'left_pic_name:', stim1, ';', 'right_pic_name:', stim2);



            setTimeout(function () {

                remove_stim();
                show_fixation_cross_and_next_trial();
                // display next stimuli after 500ms;
            }, 500 + show_feedback_time);
        };



        if (timer) {
            // cancel existing timer if exist;
            clearTimeout(timer);
        }

    };

    // finsh the training pahse;
    var finish = function () {
        $("body").unbind("keydown", response_handler); // Unbind keys
        //currentview = new Questionnaire();
                  psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
    };



    // display the stimuli;
    // change each picture's properties or appearance;
    var show_stim = function (image1, image2) {

        testing_trial_count++;

        //testing_trial_inside_block = testing_trial_count - 6*Math.floor((testing_trial_count - 1));

        switch (Math.floor((testing_trial_count - 1) / 6)) {
            case 0:
                block_id = 1;
                testing_trial_inside_block = testing_trial_count;
                break;

            case 1:
                block_id = 2;
                testing_trial_inside_block = testing_trial_count - 6;
                break;

            case 2:
                block_id = 3;
                testing_trial_inside_block = testing_trial_count - 12;
                break;
            case 3:
                block_id = 4;
                testing_trial_inside_block = testing_trial_count - 18;
                break;
            case 4:
                block_id = 5;
                testing_trial_inside_block = testing_trial_count - 24;
                break;
            case 5:
                block_id = 6;
                testing_trial_inside_block = testing_trial_count - 30;
                break;
            case 6:
                block_id = 7;
                testing_trial_inside_block = testing_trial_count - 36;
                break;
            case 7:
                block_id = 8;
                testing_trial_inside_block = testing_trial_count - 42;
                break;
            case 8:
                block_id = 9;
                testing_trial_inside_block = testing_trial_count - 48;
                break;
            case 9:
                block_id = 10;
                testing_trial_inside_block = testing_trial_count - 54;
                break;
            case 10:
                block_id = 11;
                testing_trial_inside_block = testing_trial_count - 60;
                break;
            case 11:
                block_id = 12;
                testing_trial_inside_block = testing_trial_count - 66;
                break;
        };



        d3.select("#stim1")
            .append("img")
            .attr("src", stimFolder + image1)
            .attr("id", 'pic1')
            .style("width", "300px")
            .style("height", "300px")
            .style("border", "initial");

        d3.select("#stim2")
            .append("img") // append image
            .attr("src", stimFolder + image2)
            .attr("id", 'pic2')
            .style("width", "300px")
            .style("height", "300px")
            .style("border", "initial");

        d3.select('#warning').html('');
        warning = false;




        timer = setTimeout(function () {
            d3.select('#warning').html('TOO SLOW!');
            warning = true;


            var rt = '> 2000';

            var response = 'NaN';
            var good_choice_or_not = 'NaN';

            psiTurk.recordTrialData({
                'phase': "Training",
                'block': block_id,
                'trial': testing_trial_count,
                'trial inside block': testing_trial_inside_block,
                'rt': rt,
                'response': response,
                'left_target': left_target,
                'right_target': right_target,

                'left_pic_name': stim1,
                'right_pic_name': stim2

            });


            console.log('block:', ';', block_id, 'trial:', testing_trial_count, '; ', 'trial inside block:', ';',
                testing_trial_inside_block, 'reaction_time:', rt, '; ', 'response:', response, '; ',
              'left_pic_name:', stim1, ';', 'right_pic_name:', stim2);

            setTimeout(function () {
                remove_stim();
                show_fixation_cross_and_next_trial();
            }, 500);
        }, max_reaction_time);

    };


    //remove previously displayed information on the screen;
    var remove_stim = function () {
        //remove the previous images;
        d3.select("#pic1").remove();
        d3.select("#pic2").remove();

        //set the border of each image to initial state;
        document.getElementById('stim1').style.border = "initial";
        document.getElementById('stim2').style.border = "initial";
        document.getElementById('stim1').style.opacity = 1;
        document.getElementById('stim2').style.opacity = 1;

        d3.select('#warning').html('');
        d3.select('#pool_result').html('');
        d3.select('#pool_prompt').html('');
    };


    // Load the stage.html snippet into the body of the page
    psiTurk.showPage('stage.html');

    // Register the response handler that is defined above to handle any
    // key down events.
    $("body").focus().keydown(response_handler);

    // Start the test
    show_fixation_cross_and_next_trial();

};



/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            error: prompt_resubmit});
	});
    
	
};

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
//$(window).load( function(){
//    psiTurk.doInstructions(
//        training_instruction_pages, // a list of pages you want to display in sequence
//        function () { currentview = new training_phase(); } // what you want to do when you are done with instructions
//    );
//});

/***for testing only.
 * If you want to skip the training phase and test how the testing phase works, comment out the lines above and uncomment the lines below
 ***/
$(window).load(function () {
    psiTurk.doInstructions(
        testing_instruction_pages, // a list of pages you want to display in sequence
        function () { currentview = new testing_phase(); } // what you want to do when you are done with instructions
    );
});
