var gameUniv = angular.module('gameUniv', [
  'ngRoute',
  'gameUnivControllers',
  'gameUnivServices'
]);

gameUniv.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/app', {
        templateUrl: 'views/index',
        controller: 'HomeCtrl'
      })
      .when('/app/login', {
        templateUrl: 'views/login',
        controller: 'AuthCtrl'
      })
      .otherwise({
        redirectTo: '/app'
      });
  }]);
