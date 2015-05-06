# Intel Edison smartcar
By Rafael Espejo and Sergio Monedero<br />
Released on April 24th 2015<br />
http://thingsandcode.com
***

Build an Smart Car using an Intel Edison with an Arduino Breakout board and a L298N motor controller. Move the car using a web interface.

## Build
Connect Intel Edison board Arduino pins to the L298N controller in this way:
* IN1 -- Pin 7
* IN2 -- Pin 6
* IN3 -- Pin 5
* IN4 -- Pin 4
* Vin -- Motor's power supply positive terminal (6 - 12v)
* GND -- Motor's power supply positive terminal and GND pin of Arduino. 
* OUT1 -- First motor
* OUT4 -- Second motor


## Installation
### NodeJS backend
1. Connect the Intel Edison board to a network with an static IP.
2. Go to `Smartcar` folder and open `SmartCar.xdk` with Intel XDK IoT Edition.
3. Click on `Install/Build` button of Intel XDK to fetch dependencies and compile the code.
3. Click on `Upload` to send the program to the device.

### HTML + JS Frontend
1. Open `web/js/main.js` file in a text editor.
2. Replace on line 20 `url: 'http://192.168.1.109:8888/',` and put the IP of your Intel Edison board. In this case the IP is `192.168.1.109`. Don't remove the port number because it is needed to connect the frontend with the backend.
3. Use an SCP client to upload `web` folder to `/usr/lib/edison_config_tools/public` folder in the Intel Edison.

### Usage
Open a web browser and go to http://[IP_OF_EDISON_BOARD]/web/index.html. There will be 4 buttons to move the car forward (Avanzar), backward (Retroceder), turn left (A la izquierda), and turn right (A la derecha).
<br />
<br />
<br />
** More info and other projects at http://thingsandcode.com **
