/**
    SmartCar
    By: Rafael Espejo and Sergio Monedero
    2015
**/

var mraa;

// Motor controller pins
var m_input3;
var m_input4;
var m_input5;
var m_input6;

function setup_mraa() {
    mraa = require('mraa'); //require mraa
    console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console
    console.log('')
}

function setup_webserver() {
    var http = require("http");

    http.createServer(function(request, response) {
        try {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write("SmartCar");

            var url = require('url');
            var motor_action = url.parse(request.url, true).query['motors_action'];
            
            if(motor_action !== undefined) {
                response.write("motors_action=" + motor_action);

                start_motors(motor_action);
            } else {
                response.write("no motors_action");
            }
            response.end();
        } catch(err) {
            console.log("ERROR: " + err.message);
        }
    }).listen(8888);
}

function setup_arduino_pins() {
    m_input3 = new mraa.Gpio(5);
    m_input3.dir(mraa.DIR_OUT);
    m_input4 = new mraa.Gpio(4);
    m_input4.dir(mraa.DIR_OUT);
    m_input5 = new mraa.Gpio(6);
    m_input5.dir(mraa.DIR_OUT);
    m_input6 = new mraa.Gpio(7);
    m_input6.dir(mraa.DIR_OUT);
    
    var myDigitalPin5 = new mraa.Gpio(13); //setup digital read on Digital pin #5 (D5)
    myDigitalPin5.dir(mraa.DIR_OUT); //set the gpio direction to output
    myDigitalPin5.write(1); //set the digital pin to high (1)
}

function main() {
    setup_mraa();
    setup_arduino_pins();
    setup_webserver();
}

function start_motors(action) {
    if(action == 'L') {
        console.log('Motors: Turn left.')
        m_input4.write(1);
        m_input3.write(0);
        m_input6.write(0);
        m_input5.write(1);
    } else if (action == 'R') {
        console.log('Motors: Turn right.')
        m_input4.write(0);
        m_input3.write(1);
        m_input6.write(1);
        m_input5.write(0);
    } else if (action == 'B') {
        console.log('Motors: Go backward.')
        m_input4.write(1);
        m_input3.write(0);
        m_input6.write(1);
        m_input5.write(0);
    } else if (action == 'F') {
        console.log('Motors: Go forward.')
        m_input4.write(0);
        m_input3.write(1);
        m_input6.write(0);
        m_input5.write(1);
    }
    
    setTimeout(function() {
        console.log('Motors: Stop.')
        m_input4.write(0);
        m_input3.write(0);
        m_input6.write(0);
        m_input5.write(0);
    }, 1000)
}

main();