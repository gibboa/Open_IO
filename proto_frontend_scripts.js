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
	//setInterval calls function fiven by first arg, every x milliseconds given by second arg
	//so: call update() 30 times a second
	setInterval(update, 1000/30);
	//add event listener for player input
	//pass it an inline anon function
	//gameboard.addEventListener('keystroke', function(e){
			//e is an object passed into event listener containing data from mousmove event 
			//alert(e.key + ' was just pressed');
	//});
	var lastDownTarget;
	document.addEventListener('keydown', function(event) {
        if(lastDownTarget == canvas) {
            alert('keydown');
        }
    }, false);

	//gameboard.addEventListener('mousemove', function(e){
			//e is an object passed into event listener containing data from mousmove event (has coords of cursor at least)
			//so p1_y will get the y coord of mouse minus half the paddle height so that the middle of the paddle and cursor
			//both share the same y coordinate
			//alert("event triggered");
		//});
}

function update(){}