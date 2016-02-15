var app = angular.module("test", []);
app.controller("test", function($scope, $http)
{
	$scope.code = "result.turn = 1;";
	$scope.canvas = document.getElementById("result");
	$scope.render = function(canvas, target, ship)
	{
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.save();
		ctx.translate(ship.x, ship.y);
		ctx.rotate(ship.dir);
		ctx.fillRect(-4, -2, 8, 4);
		ctx.fillStyle = "blue";
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(300, Math.sin(ship.sensorWidth)*300);
		ctx.lineTo(300, -Math.sin(ship.sensorWidth)*300);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
		ctx.fillStyle = "red";
		ctx.fillRect(target.x-4, target.y-4, 8, 8);
	}
	$scope.update = function(ship, target, code, $scope) {
		var dx = target.x-ship.x;
		var dy = target.y-ship.y;
		var a = Math.atan2(dy, dx)
		var b = ship.dir;
		var dirDiff = (a - b + Math.PI*2) % (Math.PI*2);
		if (dirDiff > Math.PI) dirDiff = (Math.PI*2) - dirDiff;
		var sensorData = {
			beep: Math.abs(dirDiff) < ship.sensorWidth,
			beepDist: undefined,
		};
		var result = {
			turn: 0,
		};
		try
		{
			eval(code);
		}
		catch(e) {
			$scope.result = "Syntax is wrong!";
			$scope.$apply();
			return false;
		}
		var r = [];
		if(result.turn < -1)
		{
			r.push("Turn is less than -1");
		}
		if(result.turn > 1)
		{
			r.push("Turn is more than 1");
		}
		var resHTML = "";
		if(r.length > 0)
		{
			r.forEach(function(re) {
				resHTML += re+"\n";
			});
			$scope.result = resHTML;
			$scope.$apply();
			return false;
		}
		else
		{
			resHTML = "Code succesful!";
		}
		$scope.result = resHTML;
		$scope.$apply();
		ship.dir += result.turn*ship.turnSpeed;
		ship.x += Math.cos(ship.dir)*ship.speed;
		ship.y += Math.sin(ship.dir)*ship.speed;
		return true;
	};
	$scope.doStuff = function() {
		var code = "(function(sensorData, result) {"+$scope.code+"})(sensorData, result)";
		
		$scope.ship = {
			x: 200,
			y: 200,
			speed: 2,
			dir: 0,
			turnSpeed: .1,
			sensorWidth: .2,
		};
		var target = {
			x: 40,
			y: 40,
		};
		var lastTime = Date.now();
		var remainder = 0;
		var timeSpent = 0;
		var update = function() {
			var now = Date.now();
			var dt = now-lastTime;
			remainder += dt;
			var cont = true;
			while(remainder > 16)
			{
				cont = $scope.update($scope.ship, target, code, $scope);
				remainder -= 16;
			}
			$scope.render($scope.canvas, target, $scope.ship);
			timeSpent += dt;
			lastTime = now;
			if(cont && timeSpent < 6000)
			{
				requestAnimationFrame(update);
			}
		};
		requestAnimationFrame(update);
	};
});