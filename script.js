// The main controller javascript

// Define the Angular app
var lifeApp = angular.module('lifeApp', []);

// A class for the cells in the grid
function Cell(){
	this.alive = false;

	// Creates a copy of the cell object
	this.clone = function clone(){
		var other = new Cell();
		other.alive = this.alive;
		return other;
	}
}

// The main controller
lifeApp.controller('LifeController', function($scope, $timeout){
	// This changes between start/stop, based on what the button will do
	$scope.curAction = 'Start';

	// The current grid in the game
	$scope.grid = [];

	// The previous grid
	$scope.prevGrid = [];

	// The count of how many cycles/ticks have passed
	$scope.tickCount = 0;

	// The size of the grid
	$scope.size = 40;

	// Flag for if the simulation is currently running
	$scope.isRunning = false;

	// Function called on page load
	$scope.init = function init(){
		// Make sure that the size is a number within the valid range
		if(isNaN($scope.size) || $scope.size < 30 || $scope.size > 100){
			// Uhoh. The size is invalid, dont do anything
			return;
		}

		// Reset the grid
		$scope.resetGrid();
		// Shake it up
		$scope.randomizeGrid();

		// Make sure the display is up to date
		$scope.safeApply();
		console.log('Grid set up');
	};

	// Reset the grid to all dead cells
	$scope.resetGrid = function resetGrid(){
		console.log('Resetting grid with a size of '+$scope.size);
		$scope.tickCount = 0;
		$scope.grid = [];
		// Set up the grid
		for(var i =0; i < $scope.size; i++){
			$scope.grid[i] = [];
			for(var j =0; j < $scope.size; j++){
				// Give it a cell
				$scope.grid[i][j] = new Cell();
			}
		}
	};

	// Set random cells alive
	$scope.randomizeGrid = function randomizeGrid(){
		console.log('Randomizing grid cells');
		// Randomize 8% of the grid
		var randomCount = 0.08 * $scope.size * $scope.size

		for(var i =0; i < randomCount; i++){
			var row = Math.floor(Math.random() * $scope.size);
			var col = Math.floor(Math.random() * $scope.size);
			// Mark it as alive
			$scope.grid[row][col].alive = true;
		}
	};

	// Create a deep copy of the current grid as the prevGrid object
	$scope.createPrevGrid = function createPrevGrid(){
		console.log('Creating copy of grid');
		$scope.prevGrid = [];
		for(var i =0; i < $scope.grid.length; i++){
			$scope.prevGrid[i] = [];
			for(var j = 0; j < $scope.grid[i].length; j++){
				// Deepcopy the objects
				$scope.prevGrid[i][j] = $scope.grid[i][j].clone();
			}
		}
	};

	// Starts or stops the simulation
	$scope.startStop = function startStop(){
		if($scope.isRunning){
			// Set the button text
			$scope.curAction = 'Start';
			$scope.isRunning = false;
			$scope.safeApply();
		} else {
			// Set the button text
			$scope.curAction = 'Stop';
			$scope.isRunning = true;
			// Start the game
			runGame();
		}
	};

	// Function that will loop to run the simulation as long as the $scope.isRunning flag is true
	function runGame(){
		if($scope.isRunning){
			runTick();
			// Give some time between ticks
			$timeout(runGame, 200);
		}
	}

	// Runs though a single tick of the simulation
	function runTick(){
		console.log('Running a tick');
		$scope.tickCount++;
		// Create a copy of the grid
		$scope.createPrevGrid();

		// Update all the cells
		for(var i =0; i < $scope.size; i++){
			for(var j = 0; j < $scope.size; j++){
				checkCell(i,j);
			}
		}

		// Make sure the grid is up to date
		$scope.safeApply();
	}

	/*
	 * Applies the rules of the game to the cell at [row,column]
	 * Note that this compares to cells in $scope.prevGrid, but modifies $scope.grid
	 */
	function checkCell(row, column){
		var aliveNeighborCount = 0;

		// Check all neighboring cells
		for(var tmpRow = row - 1; tmpRow <= row + 1; tmpRow++){
			// Make sure to keep everything in the range of the grid
			var curRow = checkValue(tmpRow);
			for(var tmpCol = column - 1; tmpCol <= column + 1; tmpCol++){
				// Keep in bounds
				var curCol = checkValue(tmpCol);

				// Check if the cell at curRow,curCol is alive
				if($scope.prevGrid[curRow][curCol].alive){
					aliveNeighborCount++;
				}
			}
		}

		// Now that we have the counts, apply the rules
		if(aliveNeighborCount == 3){
			// If the count of all 9 cells around a given cell is 3,
			// it will always be alive in the next frame
			$scope.grid[row][column].alive = true;
		} else if (aliveNeighborCount == 4){
			// If the count of all 9 cells around a given cell is 4,
			// it will always stay the same
			// No need to do anything here
		} else {
			// All other alive counts will result in death
			$scope.grid[row][column].alive = false;
		}
	}

	// Makes sure that the row/column value is within the bounds
	function checkValue(val){
		if(val < 0){
			val =  val + $scope.size;
		} else if(val >= $scope.size){
			val = val % $scope.size;
		}
		return val;
	}

	// A handy function that checks the current phase before calling apply
	// From here: https://coderwall.com/p/ngisma/safe-apply-in-angular-js
	$scope.safeApply = function(fn) {
	  var phase = this.$root.$$phase;
	  if(phase == '$apply' || phase == '$digest') {
	    if(fn && (typeof(fn) === 'function')) {
	      fn();
	    }
	  } else {
	    this.$apply(fn);
	  }
	};

});

