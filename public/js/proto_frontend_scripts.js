/*
*Scripts for prototype front-end of Open IO
*/

//This is a shorthand for the amazingly useful but overly long
//document.getElementById() which gives access to HTML elements
//based on the ID passed into (which is set in the HTML) via
//the DOM....when you see $, realize that its calling this function
function $(id){return document.getElementById(id);}


//initGame()
//This function is called when the player clicks the Play button...
//It should begin the game for them changing the display and requesting
//that the server add them to the game
function initGame(){
	//because this element is a text field, .value will store the users input in our variable
    var name= $('player_name').value; 
    alert('hi ' + name + ' the game would be starting now if it existed');
    $('game_barrier').style.display = "none";//turns off cover that was positioned over the canvas
    //gameboard contains the <canvas> element above
	gameboard = $('canvas');
	//drawBuf is an object that will draw on our canvas
	ctx = gameboard.getContext('2d');

	//Establishing Connection to Game Server
	var socket = io.connect('http://localhost:8081');
	socket.on('connect', function(){
		alert("you are connected");
		//send the name that the player typed in before starting
		socket.emit('initPlayer',{
        	playerName: name
        });
	});

	//setInterval calls function fiven by first arg, every x milliseconds given by second arg
	//so: call update() 30 times a second (basically determines framerate)
	setInterval(update, 1000/30);

	//add event listener for player input
	//pass it an inline anon function
	window.addEventListener('keydown', function(event) {
       	var key_code = event.keyCode;
       	//keyCode Reference for likely keys:
       	//'w'=87, 'a'=65, 's'=83, 'd'=68, SHIFT=16, SPACE=32, 'e'=69, 'q'=81
       	//UP=38, DOWN=40, LEFT=37, RIGHT=39, ENTER=13
    	switch (key_code) {
	        case 87: alert("send up msg"); break; //move UP
	        case 83: alert("send down msg"); break; //move DOWN
	        case 68: alert("send right msg"); break; //move RIGHT
	        case 65: alert("seng left msg"); break; //move LEFT
	        //default: alert(code); //uncomment to check other key codes
    	}
        //attempting to send this data to server with emit
        socket.emit('playerMovement',{
        	input: key_code
        	//some time data may come in handy soon...
        	//perhaps collect state changes for a given time interval and push them 
        	//out at the same time, to keep everyone in sync???
        });

    }, false);

	//listens for gameStateUpdate message from server (just alerts for testing)
	//(This works here, but doesn't work when called in update function)
    socket.on('gameStateUpdate', function(data){
		alert('message: ' + data + ' received from server to update gamestate');
	});

}

//update has two phases:
//	1. update gamestate data based on any changes offered by the server
//	2. redraw game using the updated gamestate
function update(){
	//DOESNT WORK HERE...might be nice if it did though... maybe a scope issue?
	//listing for messages concerning 'gameStateUpdate'
	//socket.on('gameStateUpdate', function(data){
		//alert("received something from server to update gamestate");
	//});
}

