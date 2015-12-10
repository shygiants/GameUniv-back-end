var gameUnivServices = angular.module('gameUnivServices', ['ngResource']);

gameUnivServices.factory('AuthInterceptor', ['$rootScope', '$q', '$window',
  function($rootScope, $q, $window) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
          config.headers.Authorization = $window.sessionStorage.token;
        }
        return config;
      },
      response: function(response) {
        return response || $q.when(response);
      }
    };
  }]);

gameUnivServices.factory('Auth', ['$resource',
  function($resource) {
    return $resource('authTokens/:email', { email: '@email' }, {
      signin: { method: 'POST' }
    });
}]);

gameUnivServices.factory('User', ['$resource', '$window',
  function($resource, $window) {
    return $resource('users/:email', { email: $window.sessionStorage.email }, {
      getUser: {
        method: 'GET',
        params: { developed: true }
      }
    });
  }]);

gameUnivServices.factory('Game', ['$resource', '$window',
  function($resource, $window) {
    return $resource('games/:gameId', { gameId: '@gameId' }, {
      getGame: {
        method: 'GET',
        params: { development: true }
      },
      addAchievement: {
        method: 'POST',
        url: 'games/:gameId/achievements',
        params: { gameId: '@gameId' }
      }
    });
  }]);

gameUnivServices.factory('UploadFile', ['$http', '$window',
  function($http, $window) {
    this.uploadGameIcon = function(id, file) {
      var formData = new FormData();
      formData.append('game_icon', file);
      console.log(formData);
      $http.put('games/' + id + '/gameIcons', formData, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      }).success(function() {

      }).error(function() {

      });
    };
    return this;
  }]);
