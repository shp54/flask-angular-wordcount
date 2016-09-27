(function(){
	'use strict';
	
	angular.module('WordcountApp', [])
		.controller('WordcountController', ['$scope', '$log', '$http', 
			function($scope, $log, $http){
				$scope.getResults = function(){
					$log.log("test")
					var userInput = $scope.url
					//Post input to server
					$http.post('/start', {"url": userInput})
						.success(function(results){
							$log.log(results)
						}).error(function(error){
							$log.log(error)
						});
				}
			}
		])
	
	
	
}());