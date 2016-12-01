(function(){
	'use strict';
	
	angular.module('WordcountApp', [])
		.service('wordcountService', ['$http', '$q', '$timeout', 
			function($http, $q, $timeout){
				//Gets wordcount from job ID
				this.getWordCount = function(jobID){
					var wordcountData = $q.defer()
					var timeout = ""
					var poller = function(){
						$http.get('/results/' + jobID)
							.success(function(data, status, headers, config){
								if(status === 202){
									wordcountData.notify(data + ' ' + status)
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
				
				//Returns job ID from URL (returns a promise that resolves to the job ID)
				this.getJobID = function(url){
					return $http.post('/start', {"url": url})
								.then(function(response){
									return response.data
								})
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
							return jobID
						}
					)
					.then(wordcountService.getWordCount) //Get results from job ID
					.then(function(data){ //Handle data returned from polling job ID
							$log.log(data)
							$scope.wordcounts = data
						}, null, $log.log
					)
					.catch(function(error){
							$log.log(error)
							$scope.urlerror = true
					})
					.finally(function(){
						$scope.loading = false
						$scope.submitButtonText = 'Submit'
					})
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