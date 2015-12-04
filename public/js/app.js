var gameUniv = angular.module('gameUniv', [
  'ngRoute',
  'gameUnivControllers'
]);

gameUniv.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/app', {
        templateUrl: 'views/index',
        controller: 'HomeCtrl'
      }).
      otherwise({
        redirectTo: '/app'
      });
  }]);
