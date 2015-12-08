var gameUniv = angular.module('gameUniv', [
  'ngRoute',
  'gameUnivControllers',
  'gameUnivServices',
  'gameUnivDirectives'
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
      .when('/app/games/:gameId', {
        templateUrl: 'views/gameDetail',
        controller: 'GameCtrl'
      })
      .otherwise({
        redirectTo: '/app'
      });
  }]);

gameUniv.config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  }]);
