
/*
*Scripts for prototype front-end of Open IO
*/

//This is a shorthand for the amazingly useful but overly long
//document.getElementById() which gives access to HTML elements
//based on the ID passed into (which is set in the HTML) via
//the DOM....when you see $, realize that its calling this function
function $(id){return document.getElementById(id);}

//Function to convert key codes to direction strings
//Args: int keyCode
//Returns: string containing relevant direction
//if key is not a,w,s,d,up,down,left,right string will be empty
function keyToDir(keyCode){
//keyCode Reference for likely keys:
//'w'=87, 'a'=65, 's'=83, 'd'=68, SHIFT=16, SPACE=32, 'e'=69, 'q'=81
//UP=38, DOWN=40, LEFT=37, RIGHT=39, ENTER=13
    switch (keyCode) {
        case 87: return('up'); break;
        case 83: return('down'); break;
        case 68: return('right'); break;
        case 65: return('left'); break;
        case 38: return('up'); break;
        case 40: return('down'); break;
        case 39: return('right'); break;
        case 37: return('left'); break;
        default: return(''); //uncomment to check other key codes
    }
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


function drawFood(foodList,pen){
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

//Draw the boost meter
function drawBoostMeter(g,id){
	if(!g){return;}//game must be initialized
	if(id == ""){return;}//dont bother if we havnt set id yet
	//drawing boost meter on same canvas as scoreboard
	let scoreboard_canvas = $("scoreboard");
	let pen = scoreboard_canvas.getContext("2d");
	pen.font = "14px Arial";
	pen.fillStyle = "red";
	let h = Math.floor(g.players[id].boost_level);
	pen.fillText("Boost: (SPACE/SHIFT)", 10, 380);
	//alert(Math.floor(g.players[id].boost_level) + " was the height");
	pen.fillStyle = "#ff1c1c";
	pen.fillRect(70,250+(100-h),20,h);
}

//Draw the scoreboard
//currently draws on a separate canvas with id="scoreboard"
//later this will be drawn on the main canvas in the upper right corner
//Args: SHOULD take players list, (later a context for main canvas)
//ASSUMING use of global game object as of 4/13, indefinately...
function drawScores(g){
	let scoreboard_canvas = $("scoreboard");
	let pen = scoreboard_canvas.getContext("2d");
	pen.font = "20px Arial";
	pen.fillStyle = "red";
	//pen.textAlighn = "center";
	pen.fillText("Leaderboard", 45, 25);
	if(!g){return;}//game must be initialized
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
	for(var key in g.players) {
		if(g.players[key].alive){
  			tmp_array.push(g.players[key]);
  		}//console.log(tmp_array); //use console.log and view with developer tools in browser for debugging
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
		//pen.textAlign = "center";
		let tmp_str = "#" + count.toString(10);
		pen.fillText( tmp_str, 15, y_offset);
		//add a way to cut off the name if it's too long
		pen.fillText( tmp_array[i].name.slice(0,15), 45, y_offset);
		pen.fillText( tmp_array[i].score, 150, y_offset);
		y_offset += 20;
		count += 1;
	}
}

//Function to draw the snake
//Arg: positions list from player.pos_list
function drawSnake(pen, player){
	let tile = new Image();
	tile.src = "pictures/sprite_sheet.png";
	let offset = player.color*10;

	//draw back to front
	if(player.alive){
		for(let i=player.pos_list.length-1; i>=1; i--){
			pen.drawImage(tile, 40, offset, 10, 10, player.pos_list[i][0] - 5, player.pos_list[i][1] - 5, 11, 11);
		}

		switch (player.direction){
			case 'up':
				pen.drawImage(tile, 0, offset, 10, 10, player.pos_list[0][0] - 5, player.pos_list[0][1] - 5, 11, 11);
				break;
			case 'right':
				pen.drawImage(tile, 10, offset, 10, 10, player.pos_list[0][0] - 5, player.pos_list[0][1] - 5, 11, 11);
				break;
			case 'down':
				pen.drawImage(tile, 20, offset, 10, 10, player.pos_list[0][0] - 5, player.pos_list[0][1] - 5, 11, 11);
				break;
			case 'left':
				pen.drawImage(tile, 30, offset, 10, 10, player.pos_list[0][0] - 5, player.pos_list[0][1] - 5, 11, 11);
				break;
		}
	}

}

//Function to redraw entire canvas at end of update loop
//It will clear the canvas and call all needed draw functions
//Args: none
//Returns: none
function redrawCanvas(pen, game, id){
	pen.clearRect(0, 0, 640, 640);//clear canvas
	drawBG(pen);
	for(var key in game.players){
		drawSnake(pen, game.players[key]);
	}
	drawFood(game.foods, pen);
	let scoreboard_canvas = $("scoreboard");
	let scoreboard_pen = scoreboard_canvas.getContext("2d");
	scoreboard_pen.clearRect(0, 0, 200, 400);//clear scoreboard
	drawScores(game);
	drawBoostMeter(game, id);
}


//creating global input queue
//relevant array functionality:
//unshift(): add to front (returns new length of array if you want)
//pop(): remove from back (returns value removed)
//length: returns length
var inputQueue = [];

var player_ID = '';//stores ID of this player assigned by server
//initGame()
//This function is called when the player clicks the Play button...
//It should begin the game for them changing the display and requesting
//that the server add them to the game
function initGame(){

	//var game;
	//maybe dont need this but w/e
	//var game = {
	   // players: {},
	    //foods: [],
	    //board: {x: 640, y: 640}
	    //name2id: {}
	//};
	//because this element is a text field, .value will store the users input in our variable
    var name= $('player_name').value;
    //alert('hi ' + name + ' the game would be starting now if it existed');
    $('game_barrier').style.display = "none";//turns off cover that was positioned over the canvas
    //gameboard contains the <canvas> element above
	gameboard = $('canvas');
	//drawBuf is an object that will draw on our canvas
	ctx = gameboard.getContext('2d');

	drawBG(ctx);
	drawScores();
	
	//Establishing Connection to Game Server
	var socket = io.connect(document.location.origin);
	socket.on('connect', function(){
		//alert("you are connected");
		//send the name that the player typed in before starting
		socket.emit('initPlayer',{
        	playerName: name
        });
	});

	//listen for message containing clients own ID
	socket.on('passID', function(data){
		player_ID = data.name2id[name];
		//alert("you socket id on server is:" + player_ID);
	});

	/*THIS IS CLIENT PREDICTION LOOP (similar to update loop in function)
	//trying out main update functions that mirrors the server one as anon in set interval
	setInterval(function(inputQueue, game){

    //1. UPDATE PLAYER DIRECTIONS BASED ON INPUTS
    //THINK OF A WAY TO INCORPORATE AUTHORITATIVE UPDATE
    if(game){
	    let i;
	    let len = 0;
	    if(inputQueue){
	    	len = inputQueue.length;
	    }
	    for(i = 0; i < len; i++){
	        let input = inputQueue.pop();//input is [socket.id, key_code]
	        //process each input (only inputs are direction changes right now)
	        game.players[input[0]].direction = keyToDir(input[1]);
	    }
    //2. UPDATE PLAYER LOCATIONS BASED ON DIRECTION

    	moveSnakes(game);


	    //3. UPDATE PLAYERS BASED ON GAME EVENTS (check various types of collisions)
	    //change score, aliveness, length, food locations
	    //4. REDRAW BOARD
	    //gb = $('canvas');
		//drawBuf is an object that will draw on our canvas
		//ctx = gb.getContext('2d');
	    redrawCanvas(ctx, game);
	}
	}, 1000/15);// call func every 15 ms
	*/

	//setInterval calls function fiven by first arg, every x milliseconds given by second arg
	//so: call update() 30 times a second (basically determines framerate)
	//setInterval(update, 10000);//to add args to function, pass them as args to setInterval after the time arg

	//add event listener for player input
	//pass it an inline anon function
	window.addEventListener('keydown', function(event) {
       	let key_code = event.keyCode;
       	//alert("u pressed" + key_code);
        if (key_code == 16 || key_code == 32){//this is not written to handle client prediction yet
        	//alert("EMITTING BOOS MSG");
            socket.emit('playerBoost',{
	        	input: true //when key: SHIFT or SPACE is down, then toggle boost to true
        	});
        }else if(keyToDir(key_code) != ''){
        	//alert("the key you just pressed is a valid movement");
        	//inputQueue.unshift([player_ID, key_code])
            socket.emit('playerMovement',{
	        	input: key_code
	        	//NOTE when caught by listener on server key_code is accessed via arg.input
	        	//in our case the arg is called data, so data.input
        	});
        }
    }, false);

	//listen for keyup of shift or spacebar to end boost
	window.addEventListener('keyup', function(event) {
		let key_code = event.keyCode;
		if (key_code == 16 || key_code == 32){
            socket.emit('playerBoost',{
	        	input: false //when key: SHIFT or SPACE is down, then toggle boost to true
        	});
        }
    }, false);


	//listens for gameStateUpdate message from server (just alerts for testing)
	//(This works here, but doesn't work when called in update function)
    socket.on('gameStateUpdate', function(data){
		//alert('message: ' + data + ' received from server to update gamestate');
	});

	socket.on('authoritativeUpdate', function(data){
		//somehow update entire local gamestate with (data is the game obj here)
		game = data;//probly need to do deep copy, doubt this works
		//redrawCanvas(ctx, game, player_ID);//temporary while debugging
		//TEMPORARILY REMOVING TO ISOLATE BUG
		if(player_ID in game.players){
			redrawCanvas(ctx, game, player_ID);
			if(!game.players[player_ID].alive){
				$('game_barrier').style.display = "block";
				$('name_box').style.diplay = "none";
				$('game_over_box').style.display = "block";
			}
		}else{
			//player died and was deleted
			$('game_barrier').style.display = "block";
			$('name_box').style.diplay = "none";
			$('game_over_box').style.display = "block";
		}
		
	});

}
