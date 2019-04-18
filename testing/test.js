// Unit testing requires mocha and chai. Refer to the README file for more info.

var proto_frontend_scripts = require('../public/js/proto_frontend_scripts')
var expect = require('chai').expect



////////////////////////////////////////////////////////////////////////////////

///////// Due to some of the limitations of javascript and Node.js, and the uncertainty of
///////// which files specific funtions will be, for now, we are including the functions 
///////// that need unit testing within test.js
///////// We eventually plan to separate the testing from the functions to account for changes 
///////// in the original files

function check_overlap(x1, y1, x2, y2, rad1, rad2){
  if ( (x1+rad1 >= x2-rad2 && x1+rad1 <= x2+rad2) || (x1-rad1 <= x2+rad2 && x1+rad1 >= x2-rad2) ) {
    if ( (y1+rad1 >= y2-rad2 && y1+rad1 <= y2+rad2) || (y1-rad1 <= y2+rad2 && y1-rad1 >= y2-rad2) ){
      return true;
    }
  }
  return false;
}


function checkCollision_Board(p1,g) {
  if (p1.pos_list[0][0]+5 >= g.board.x || p1.pos_list[0][1]+5 >= g.board.y) {return true;}
  else if (p1.pos_list[0][0]-5 <= 0 || p1.pos_list[0][0]-5 <= 0) {return true;}
  return false;
}


function checkCollision_Player(p1, p2) {
  for (var i = 0; i < p2.pos_list.length; i++) {
    if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[i][0], p2.pos_list[i][1], 5,5) == true){
      return true;
    }
  }
  return false;
}


function checkCollision_Food(p1, foods) {
  return check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], foods.x, foods.y, 5,5);
}


// initSnakeLocations and initFoods are used just to provide objects for testing
function initSnakeLocations(/*arr,*/ length, direction/*, playersObj*/){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    //generate length many locations specified direction
    let x = Math.floor(Math.random() * 320) + 160; //current board is 640px X 640px so
    let y = Math.floor(Math.random() * 320) + 160; //place player randomly between 160px-480px (not too close to edge)
    let tmp_arr = [];
    tmp_arr.push([x,y]);
    let i;
    for(i=1; i<length; i++){
      //generating points points based on direction, points are 5 px apart
      let offset = i*6;
      switch (direction) {
        case 'up': tmp_arr.push( [ x, (y+offset) ] ); break;
        case 'right': tmp_arr.push( [ (x-offset), y ] ); break;
        case 'down': tmp_arr.push( [ x, (y-offset) ] ); break;
        case 'left': tmp_arr.push( [ (x+offset), y ] ); break;   
      }
    }
    //call collision detection on each location
    let validated = true;
    for(i=0; i<length; i++){
      //LEAVING IT OUT FOR NOW but for each point in tmp_arr check that its not on top of another snake
      //also we need to consider speed and timing... this collision detection will likely need to look for wide
      //open spaces so that new snakes dont die instantly and old snakes dont have new snakes spawning
      //in front of them out of nowhere... would kinda ruin the game
      //detectCollision(tmp_arr[i][0], tmp_arr[i][1], playersObj); ... or wutever
      //if any location fails, then validated will be turned to valse
    }
    //if all locations are valid, then save to exit loop, else generate new random locations
    if(validated){
      locationsNotValidated = false; //the locs are valid, loop will exit
      arr = tmp_arr;
    }
  }//end while
  return arr;
}

function initFoods(g){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<arr.length; i++){
      if(check_overlap(fx, fy, arr[i].x, arr[i].y, 6)){
        currFoodValid = false;
      }
    }
    if(currFoodValid){
      arr.push({x:fx, y:fy}); 
    }
    if(arr.length >= 10){
      locationsNotValidated = false;
    }
  }
  g.foods = arr;
}

////////////////////////////////////////////////////////////////////////////////

// objects below used as testing inputs

var pa = {
	name: "p1",
	pos_list: initSnakeLocations(4, 'up')
}
var pb = {
	name: "p2",
	pos_list: initSnakeLocations(0, 'left')
}
var pc = {
	name: "p3",
	pos_list: initSnakeLocations(11, 'down')
}
var pd = {
	name: "p4",
	pos_list: initSnakeLocations(100, 'right')
}
pd.pos_list[0][0] += 900;
var game = {
    players: {pa, pb, pc},
    foods: [],
    board: {x: 640, y: 640} 
};
var game2 = {
    players: {pc},
    foods: [],
    board: {x: 33, y: 60} 
};
var game3 = {
    players: {pd, pa},
    foods: [],
    board: {x: 900, y: 10} 
};
var game4 = {
    players: {pd},
    foods: [],
    board: {x: 40, y: 20} 
};
var game5 = {
    players: {pd},
    foods: [],
    board: {x: 5, y: 5} 
};
initFoods(game)
initFoods(game2)
initFoods(game3)
initFoods(game4)
////////////////////////////////////////////////////////////////////////////////




// 7 Tests for check_overlap

describe("check_overlap Tests", function() {
	it("Tests to check if the current player is colliding with either the gameboard boundaries, any of the players, or any of the food objects", function() {
		expect(check_overlap(1, 3, 5, 7, 5, 5)).to.equal(true)
		expect(check_overlap(6, 0, 13, 9, 0, 0)).to.equal(false)
		expect(check_overlap(0, -6, 17, 3, 25, 25)).to.equal(true)
		expect(check_overlap(0, 0, 100, 100, -3, 50)).to.equal(false)
		expect(check_overlap(35, 28, 15, 12, 11, 19)).to.equal(true)
		expect(check_overlap(9, 30, 25, 30, 5, 5)).to.equal(false)
		expect(check_overlap(35, 28, 15, 12, 11, 19)).to.equal(true)
	})
})


// 5 Tests for checkCollision_Board

describe("checkCollision_Board", function() {
	it("Tests to check if a player has hit the boundaries of a gameboard", function() {
		expect(checkCollision_Board(pa, game)).to.equal(false)
		expect(checkCollision_Board(pb, game2)).to.equal(true)
		expect(checkCollision_Board(pc, game3)).to.equal(true)
		expect(checkCollision_Board(pd, game4)).to.equal(true)
		expect(checkCollision_Board(pd, game2)).to.equal(true)
	})
})

/* Due to randomness, checkCollision_Player tests cannot have guaranteed results
// 6 Tests for checkCollision_Player

describe("checkCollision_Player", function() {
	it("Tests to check if players make contact with each other", function() {
		expect(checkCollision_Player(pa, pa)).to.equal(true)
		expect(checkCollision_Player(pb, pd)).to.equal(false)
		expect(checkCollision_Player(pc, pa)).to.equal(false)
		expect(checkCollision_Player(pd, pa)).to.equal(false)
		expect(checkCollision_Player(pa, pd)).to.equal(false)
		expect(checkCollision_Player(pb, pc)).to.equal(false)
	})
})
*/

// 10 Tests for checkCollision_Food

describe("checkCollision_Food", function() {
	it("Tests to check if players make contact with food", function() {
		expect(checkCollision_Food(pa, game.foods)).to.equal(false)
		expect(checkCollision_Food(pb, game3.foods)).to.equal(false)
		expect(checkCollision_Food(pc, game4.foods)).to.equal(false)
		expect(checkCollision_Food(pd, game2.foods)).to.equal(false)
		expect(checkCollision_Food(pd, game.foods)).to.equal(false)
		expect(checkCollision_Food(pa, game3.foods)).to.equal(false)
		expect(checkCollision_Food(pa, game5.foods)).to.equal(false)
		expect(checkCollision_Food(pc, game3.foods)).to.equal(false)
		expect(checkCollision_Food(pb, game2.foods)).to.equal(false)
		expect(checkCollision_Food(pa, game4.foods)).to.equal(false)
	})
})

