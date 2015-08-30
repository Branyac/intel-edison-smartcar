#!/usr/bin/env node

/**
    SmartCar
    By Sergio Monedero
    2015
**/

var APP_PORT = 8080;
var WS_PORT = 8084;
var VS_PORT = 8082;
var STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes
var FFMPEG_PATH = '/home/root/bin/ffmpeg/ffmpeg';
var PHOTO_FILE = '/tmp/photo.jpg';
var THETHINGSIO_TOKEN = '';

var http;
var url;
var mraa;
var express;
var app;
var ws;
var childProcess;
var ffmpeg;

var led_output;

// Motor controller pins
var m_input3;
var m_input4;
var m_input5;
var m_input6;

// Webcam config
var width = 640;
var height = 480;
var autoRestartStreaming;

function setup_requires() {
    try {
        log_message('Initializing libraries...');

        http = require("http");
        log_message('HTTP initialized');

        url = require('url');
        log_message('URL initialized');

        mraa = require('mraa'); //require mraa
        log_message('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

        express = require('express');
        log_message('Express framework initialized');
        
        ws = require('ws');
        log_message('WebSocket initialized');
        
        childProcess = require('child_process')
        log_message('Child process initialized');

        log_message('');
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function setup_app() {
    try {
        app = express();
        
        app.use(express.static(__dirname + '/public'));
        app.use('/backend/doAction', doAction);

        var server = app.listen(APP_PORT, function () {
          var host = server.address().address;
          var port = server.address().port;

          log_message('intel-edison-smartcar listening at http://%s:%s', host, port);
        });
    } catch(err) {  
        log_message("ERROR: " + err.message);
    }
}

function setup_websockets() {
    try {
        // WebSocket server
        var wsServer = new (ws.Server)({ port: WS_PORT });
        log_message('WebSocket server listening on port ' + WS_PORT);

        wsServer.on('connection', function(socket) {
            try {
              // Send magic bytes and video size to the newly connected socket
              // struct { char magic[4]; unsigned short width, height;}
              var streamHeader = new Buffer(8);

              streamHeader.write(STREAM_MAGIC_BYTES);
              streamHeader.writeUInt16BE(width, 4);
              streamHeader.writeUInt16BE(height, 6);
              socket.send(streamHeader, { binary: true });

              log_message('New WebSocket Connection (' + wsServer.clients.length + ' total)');

              socket.on('close', function(code, message){
                log_message('Disconnected WebSocket (' + wsServer.clients.length + ' total)');
              });
            } catch(err) {  
                log_message("ERROR: " + err.message);
            }
        });

        wsServer.broadcast = function(data, opts) {
            try {
                for(var i in this.clients) {
                    if(this.clients[i].readyState == 1) {
                        this.clients[i].send(data, opts);
                    } else {
                        log_message('Error: Client (' + i + ') not connected.');
                    }
                }
            } catch(err) {  
                log_message("ERROR: " + err.message);
            }
        };
        
        // HTTP server to accept incoming MPEG1 stream
        http.createServer(function (req, res) {
            try {
              log_message(
                'Stream Connected: ' + req.socket.remoteAddress +
                ':' + req.socket.remotePort + ' size: ' + width + 'x' + height
              );

              req.on('data', function (data) {
                wsServer.broadcast(data, { binary: true });
              });
            } catch(err) {  
                log_message("ERROR: " + err.message);
            }
        }).listen(VS_PORT, function () {
            log_message('Listening for video stream on port ' + VS_PORT);
            
            autoRestartStreaming = true;
            startStreaming();
        });
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function startStreaming() {
    try {
        // Load Sony Eye Driver modules
        childProcess.exec('insmod /home/root/gspca_main.ko');
        childProcess.exec('insmod /home/root/gspca_ov534.ko');
        childProcess.exec('insmod /home/root/gspca_ov534_9.ko');

        ffmpeg = childProcess.exec(FFMPEG_PATH + ' -s ' + width + 'x' + height + ' -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://127.0.0.1:' + VS_PORT);

        ffmpeg.on('error', function (err) {
            log_message("ERROR: " + err.message);
        });

        ffmpeg.on('close', function (code) {
            log_message('ffmpeg exited with code ' + code);
            //if(autoRestartStreaming === true) startStreaming();
        });
    } catch(err) {  
        log_message("ERROR: " + err.message);
    }
}

function stopStreaming() {
    try {
        ffmpeg.kill();
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function setup_arduino_pins() {
    try {
        m_input3 = new mraa.Gpio(5);
        m_input3.dir(mraa.DIR_OUT);
        m_input4 = new mraa.Gpio(4);
        m_input4.dir(mraa.DIR_OUT);
        m_input5 = new mraa.Gpio(6);
        m_input5.dir(mraa.DIR_OUT);
        m_input6 = new mraa.Gpio(7);
        m_input6.dir(mraa.DIR_OUT);
        
        led_output = new mraa.Gpio(13);
        led_output.dir(mraa.DIR_OUT);
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function doAction(request, response) {
    try {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("SmartCar");

        var motor_action = url.parse(request.url, true).query['motors_action'];
        var take_photo_param = url.parse(request.url, true).query['take_photo'];

        if(typeof motor_action !== 'undefined') {
            response.write("motors_action=" + motor_action);

            start_motors(motor_action);
        } else {
            response.write("no motors_action");
        }
        
        if(typeof take_photo_param !== 'undefined') {
            autoRestartStreaming = false;
            
            stopStreaming();
            take_photo();
            
            autoRestartStreaming = true;
            startStreaming();
            
            response.write("photo saved");
        }
        
        response.end();
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function main() {
    try {
        setup_requires();
        setup_arduino_pins();
        setup_websockets();
        setup_app();
    } catch(err) {
        log_message("FATAL ERROR: " + err.message);
    }
}

function take_photo() {
    try {
        if(typeof childProcess !== 'undefined' && typeof THETHINGSIO_TOKEN !== 'undefined' && THETHINGSIO_TOKEN != '') {
            ffmpeg = childProcess.exec(FFMPEG_PATH + ' -f video4linux2 -i /dev/video0 -s 640x480 -vframes 1 ' + PHOTO_FILE);
        }
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function start_motors(action) {
    try {
        led_output.write(1);
        
        if(action == 'L') {
            log_message('Motors: Turn left.');
            m_input4.write(1);
            m_input3.write(0);
            m_input6.write(0);
            m_input5.write(1);
        } else if (action == 'R') {
            log_message('Motors: Turn right.');
            m_input4.write(0);
            m_input3.write(1);
            m_input6.write(1);
            m_input5.write(0);
        } else if (action == 'B') {
            log_message('Motors: Go backward.');
            m_input4.write(1);
            m_input3.write(0);
            m_input6.write(1);
            m_input5.write(0);
        } else if (action == 'F') {
            log_message('Motors: Go forward.');
            m_input4.write(0);
            m_input3.write(1);
            m_input6.write(0);
            m_input5.write(1);
        }

        setTimeout(function() {
            log_message('Motors: Stop.');
            m_input4.write(0);
            m_input3.write(0);
            m_input6.write(0);
            m_input5.write(0);
            
            led_output.write(0);
        }, 1000);
    } catch(err) {
        log_message("ERROR: " + err.message);
    }
}

function log_message(message) {
    try {
        console.log(message);
        if(typeof childProcess !== 'undefined' && typeof THETHINGSIO_TOKEN !== 'undefined' && THETHINGSIO_TOKEN != '') {
            childProcess.exec('curl -i -H "Accept: application/json"  -H "Content-Type: application/json" -d \'{ "values": [ { "key": "log", "value": "' + message + '" } ] }\' -X POST "https://api.thethings.io/v2/things/' + THETHINGSIO_TOKEN + '" -k');
        }
    } catch(err) {
        console.log("ERROR: " + err.message);
    }
}

main();