var gameUnivServices = angular.module('gameUnivServices', ['ngResource']);

gameUnivServices.factory('Auth', ['$resource',
  function($resource) {
    return $resource('authTokens/:email', { email: '@email' }, {
      signin: { method: 'POST' }
    });
}]);

gameUnivServices.factory('User', ['$resource', '$window',
  function($resource, $window) {
    return $resource('users/:email', { email: '@email' }, {
      getUser: {
        method: 'GET',
        headers: { Authorization: $window.sessionStorage.token },
        params: { email: $window.sessionStorage.email }
      }
    });
  }])
