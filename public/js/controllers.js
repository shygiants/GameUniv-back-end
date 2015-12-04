var gameUnivControllers = angular.module('gameUnivControllers', []);

gameUnivControllers.controller('HomeCtrl', ['$scope',
  function($scope) {
    $scope.title = "GameUniv";
  }]);
