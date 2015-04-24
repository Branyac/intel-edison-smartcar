/*
function sendMotorAction(action) {
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", "http://edison.local:8888/?motors_action=" + action, true);
    xmlhttp.send();
}
*/

function sendMotorAction(action) {
	$.ajax({
			type: 'GET',
			crossDomain: true,
			dataType: 'json',
			url: 'http://192.168.1.109:8888/',
			crossdomain: true,
			data: {
				motors_action : action
			}
		});
}