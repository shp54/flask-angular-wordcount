(function(){
	'use strict';
	
	angular.module('WordcountApp', [])
		.service('wordcountService', ['$http', '$q', '$log', '$timeout', 
			function($http, $q, $log, $timeout){
				//Gets wordcount from job ID
				this.getWordCount = function(jobID){
					var wordcountData = $q.defer()
					var timeout = ""
					var poller = function(){
						$http.get('/results/' + jobID)
							.success(function(data, status, headers, config){
								if(status === 202){
									$log.log(data, status)
								} else if(status === 200){
									wordcountData.resolve(data)
									$timeout.cancel(timeout)
									return false
								}
								//call poller till timeout is cancelled
								timeout = $timeout(poller, 2000)
							})
							.error(function(error){
								wordcountData.reject(error)
							})
					}
					
					//Set initial timeout
					timeout = $timeout(poller, 1000)
					
					return wordcountData.promise
				}
				
				//Returns job ID from URL
				this.getJobID = function(url){
					var jobID = $q.defer()
					$http.post('/start', {"url": url})
						.success(function(results){
							jobID.resolve(results)
						}).error(function(error){
							jobID.reject(error)
						})
							
					return jobID.promise
				}
			}
		])
		.controller('WordcountController', ['$scope', '$log', 'wordcountService',
			function($scope, $log, wordcountService){
				$scope.submitButtonText = 'Submit'
				$scope.loading = false
				$scope.urlerror = false
	
				$scope.getResults = function(){
					//Clear warnings and chart
					$scope.urlerror = false
					$("#chart").html("")
					//Get URL
					var userInput = $scope.url
					//Post input to server
					wordcountService.getJobID(userInput).then(
						function(jobID){
							$log.log(jobID)
							$scope.loading = true
							$scope.submitButtonText = 'Loading...'
							getWordCount(jobID)
							
						}, 
						function(error){
							$log.log(error)
						}
					)
						
					//Get results from job ID
					function getWordCount(jobID){
						wordcountService.getWordCount(jobID).then(
							function(data){
								$log.log(data)
								$scope.wordcounts = data
							},
							function(error){
								$log.log(error)
								$scope.urlerror = true
							}
						).finally(function(){
							$scope.loading = false
							$scope.submitButtonText = 'Submit'
						})
					}
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