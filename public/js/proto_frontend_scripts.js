
/*
*Scripts for prototype front-end of Open IO
*/

//This is a shorthand for the amazingly useful but overly long
//document.getElementById() which gives access to HTML elements
//based on the ID passed into (which is set in the HTML) via
//the DOM....when you see $, realize that its calling this function
function $(id){return document.getElementById(id);}

// Functions that check whether the current player is colliding with either the gameboard
// boundaries, any of the other players, or any of the food objects

function check_overlap(x1, y1, x2, y2, rad){
	if ( (x1+rad >= x2-rad && x1+rad <= x2+rad) || (x1-rad <= x2+rad && x1+rad >= x2-rad) ) {
		if ( (y1+rad >= y2-rad && y1+rad <= y2+rad) || (y1-rad <= y2+rad && y1-rad >= y2-rad) ){
			return true;
		}
	}
	return false;
}
// checkCollision_Board takes a player p1 and gameboard g and returns true if p1
// has hit the boundaries of g
function checkCollision_Board(p1,g) {
	if (p1.position_list[0][0]+5 >= g.x || p1.position_list[0][1]+5 >= g.y) {return true;}
	else if (p1.position_list[0][0]-5 <= 0 || p1.position_list[0][0]-5 <= 0) {return true;}
	return false;
}

// checkCollision_Player takes two players p1 and p2 and returns true if p1 hits the hitbox of p2
function checkCollision_Player(p1, p2) {
	for (var i = 0; i < p2.position_list.length; i++) {
		if (check_overlap(p1.position_list[0][0], p1.position_list[0][1], p2.position_list[i][0], p2.position_list[i][1], 5) == true){
			return true;
		}
	}
	return false;
}

// checkCollision_Food takes a player p1 and a list of food objects foods and returns true if p1
// hits any one of the the objects in foods
function checkCollision_Food(p1, foods) {
	for (var i = 0; i < foods.length; i++) {
		if (check_overlap(p1.position_list[0][0], p1.position_list[0][1], foods[i].x, foods[i].y, 5)){
			return true;
		}
	}
	return false;
}


//Draw background of canvas using a tile from the style sheet
//Args: pen, a context from the canvas object
function drawBG(pen){
	let tile = new Image();
	tile.src = "pictures/sprite_sheet.png";
	let tileLen = 10; //tile is a 10x10 square
	let x = 0, y = 0;
	for(x=0; x<64; x+=1){
		for(y=0; y<64; y +=1){
			//to use drawImage() with sprite sheet, it takes 9 args:
			//1. imgName, 2. x of sprite cutout 3. y of sprite cutout 4. width of sprite cutout
			//5. height of sprite cutout 6. x of canvas location 7. y of canvas location
			//8. width of drawn img on canvas 9. height of drawn img on canvas
			//(note: x, y start at 0,0 in the upper-left corner for both canvas and sprite sheet)
			pen.drawImage(tile, 10, 0, 10, 10, x * 10, y * 10, tileLen, tileLen);
		}
	}
}


function drawFood(food_list,pen){
	let tile = new Image();
	tile.src = "pictures/sprite_sheet.png";
	let tileLen = 11; //tile is a 11x11 square
	for(i=0; i<foodList.length; i+=1){
		//to use drawFood() with sprite sheet, it takes 9 args:
		//1. imgName, 2. x of sprite cutout 3. y of sprite cutout 4. width of sprite cutout
		//5. height of sprite cutout 6. x of canvas location 7. y of canvas location
		//8. width of drawn img on canvas 9. height of drawn img on canvas
		//(note: x, y start at 0,0 in the upper-left corner for both canvas and sprite sheet)
		pen.drawImage(tile, 0, 0, 10, 10, foodList[i].x -5, foodList[i].y -5, tileLen, tileLen);
	}
}

//Draw the scoreboard
//currently draws on a separate canvas with id="scoreboard"
//later this will be drawn on the main canvas in the upper right corner
//Args: SHOULD take players list, (later a context for main canvas)
function drawScores(){
	let scoreboard_canvas = $("scoreboard");
	let pen = scoreboard_canvas.getContext("2d");
	pen.font = "20px Arial";
	pen.fillStyle = "red";
	pen.textAlighn = "center";
	pen.fillText("Leaderboard", 45, 25);

	//creating fake players object for testing////////////
	players = {
		id1: {name: "player1", score: 1223},
		id2: {name: "player2", score: 111},
		id3: {name: "player3", score: 1992},
		id4: {name: "player5", score: 123},
		id5: {name: "player6", score: 17773},
		id6: {name: "player7", score: 1223},
		id7: {name: "Scrooge McDuck", score: 19999},
		id8: {name: "player9", score: 1},
		id9: {name: "player10", score: 1233323},
		id10: {name: "player11", score: 323},
		id11: {name: "player4", score: 139999}
	}
	//////////////////////////////////////////////////////
	//copying player object into array for array sort
	let tmp_array = []
	for(var key in players) {
  		tmp_array.push(players[key]);
  		//console.log(tmp_array); //use console.log and view with developer tools in browser for debugging
  		//console.log(players[key]);
  	}
  	//use array sort by player scores (high to low)
	tmp_array.sort(function (a, b) {
	  	return b.score - a.score;
	});
	//draw scores from sorted array
	let y_offset = 50;
	let count = 1;
	for(var i in tmp_array){
		if(count>10){break;}
		pen.font = "12px Arial";
		pen.fillStyle = "red";
		pen.textAlighn = "center";
		let tmp_str = "#" + count.toString(10);
		pen.fillText( tmp_str, 15, y_offset);
		//add a way to cut off the name if it's too long
		pen.fillText( tmp_array[i].name, 45, y_offset);
		pen.fillText( tmp_array[i].score, 150, y_offset);
		y_offset += 20;
		count += 1;
	}
}


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

	drawBG(ctx);
	drawScores();

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
