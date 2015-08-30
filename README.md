# Intel Edison smartcar
By Sergio Monedero<br />
Released on April 24th 2015<br />
http://thingsandcode.com
***

Build an Smart Car using an Intel Edison with an Arduino Breakout board and a L298N motor controller. Move the car and see the camera live stream using a web interface.

## Build
1. Connect Intel Edison board Arduino pins to the L298N controller in this way:
	* IN1 -- Pin 7
	* IN2 -- Pin 6
	* IN3 -- Pin 5
	* IN4 -- Pin 4
	* Vin -- Motor's power supply positive terminal (6 - 12v)
	* GND -- Motor's power supply positive terminal and GND pin of Arduino. 
	* OUT1 -- First motor
	* OUT4 -- Second motor
2. Set the small switch to the OFF position by pushing it toward the big USB port connector and connect the webcam.
3. Power on the Intel Edison using the DC power jack.

## Installation
1. Connect the Intel Edison board to a network with an static IP.
2. Go to `misc` folder and copy `install_ffmpeg.sh` to `/home/root` on your Intel Edison using a SCP client.
3. [OPTIONAL] If you are using a Sony Eye webcam you need the kernel modules to make it work. Go to `misc/kernel_modules` folder and copy all the files to `/home/root` on your Intel Edison using a SCP client.
4. Open a SSH, connect with your Intel Edison, set permissions to execute `install_ffmpeg.sh`, connect the Intel Edison to the Internet and execute the script.
5. Go to `Smartcar` folder and open `SmartCar.xdk` with Intel XDK IoT Edition.
6. Click on `Install/Build` button of Intel XDK to fetch dependencies and compile the code.
7. Click on `Upload` to send the program to the device.


### Usage
Open a web browser and go to http://[IP_OF_EDISON_BOARD]:8080/ There will be 4 buttons to move the car forward (Avanzar), backward (Retroceder), turn left (A la izquierda), and turn right (A la derecha).
<br />
<br />
<br />
** More info and other projects at http://thingsandcode.com **
