var gameUnivControllers = angular.module('gameUnivControllers', []);

gameUnivControllers.controller('HomeCtrl', ['$scope', '$window', '$location', 'User',
  function($scope, $window, $location, User) {
    if (!$window.sessionStorage.token) {
      $location.path('app/login');
    } else {
      User.getUser().$promise.then(function(data) {
        console.log(data);
        $scope.user = data;
        $scope.gameDetail = function(gameId) {
          $location.path('app/games/' + gameId);
        };
      }, function(err) {
        console.log(err);
        delete $window.sessionStorage.email;
        delete $window.sessionStorage.token;
        $location.path('app/login');
      })
    }
  }]);

gameUnivControllers.controller('AuthCtrl', ['$scope', '$window', '$location', 'Auth',
  function($scope, $window, $location, Auth) {
    $scope.submit = function(email, password) {
      Auth.signin({ email: email }, { passwd: password }).$promise
      .then(function(data) {
        $window.sessionStorage.email = email;
        $window.sessionStorage.token = data.token;
        $location.path('app');
      }, function(err) {
        console.log(err);
        delete $window.sessionStorage.email;
        delete $window.sessionStorage.token;
      });
    };
  }]);

gameUnivControllers.controller('GameCtrl', ['$scope', '$window', '$location', '$routeParams', 'Game', 'UploadFile',
  function($scope, $window, $location, $routeParams, Game, UploadFile) {
    var gameId = $routeParams.gameId;

    if (!$window.sessionStorage.token) {
      $location.path('app/login');
    } else {
      Game.getGame({ gameId: gameId }).$promise.then(function(data) {
        console.log(data);
        $scope.game = data;
        $scope.submit = function() {
          var file = $scope.game_icon;
          UploadFile.uploadGameIcon($scope.game._id, file);
        }
      }, function(err) {
        console.log(err);
        delete $window.sessionStorage.email;
        delete $window.sessionStorage.token;
        $location.path('app/login');
      })
    }

  }]);
