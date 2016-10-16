(function(){
	'use strict';
	
	angular.module('WordcountApp', [])
		.controller('WordcountController', ['$scope', '$log', '$http', '$timeout',
			function($scope, $log, $http, $timeout){
				$scope.submitButtonText = 'Submit'
				$scope.loading = false
				$scope.urlerror = false
				function getWordCount(jobID){
					var timeout = ""
					var poller = function(){
						$http.get('/results/' + jobID)
							.success(function(data, status, headers, config){
								if(status === 202){
									$log.log(data, status)
								} else if(status === 200){
									$scope.loading = false
									$scope.submitButtonText = 'Submit'
									$scope.wordcounts = data
									$timeout.cancel(timeout)
									return false
								}
								//call poller till timeout is cancelled
								timeout = $timeout(poller, 2000)
							})
							.error(function(error){
								$scope.urlerror = true
								$scope.submitButtonText = 'Submit'
								$scope.loading = false
							})
					}
					poller()
				}
	
				$scope.getResults = function(){
					//Clear warnings and chart
					$scope.urlerror = false
					angular.element("#chart").html("")
					//Get URL
					var userInput = $scope.url
					//Post input to server
					$http.post('/start', {"url": userInput})
						.success(function(results){
							$log.log(results)
							getWordCount(results)
							$scope.loading = true
							$scope.submitButtonText = 'Loading...'
						}).error(function(error){
							$log.log(error)
						});
				}
			}
		])
		.directive('wordCountChart', ['$parse', function($parse){
			return {
				restrict: 'E',
				replace: true,
				template: "<div id='chart'></div>",
				link: function(scope){
				  scope.$watch('wordcounts', function() {
					d3.select('#chart').selectAll('*').remove()
					var data = scope.wordcounts
					for (var word in data) {
						d3.select('#chart')
						  .append('div')
						  .selectAll('div')
						  .data(word[0])
						  .enter()
						  .append('div')
						  .style('width', function(){
							  return (data[word] * 20) + 'px'
						  })
						  .text(function(d){
							  return word
						  })
					}
				  }, true)
				}
			}
		}])
	
	
}());