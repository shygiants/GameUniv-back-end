var gameUnivControllers = angular.module('gameUnivControllers', []);

gameUnivControllers.controller('HomeCtrl', ['$scope', '$window', '$location', 'User',
  function($scope, $window, $location, User) {
    $scope.title = "GameUniv";

    if (!$window.sessionStorage.token) {
      // TODO: Redirection to login page
      $location.path('app/login');
    } else {
      User.getUser().$promise.then(function(data) {
        console.log(data);
        $scope.user = data;
      }, function(err) {
        console.log(err);
        delete $window.sessionStorage.email;
        delete $window.sessionStorage.token;
        // TODO: Redirection to login page
        $location.path('app/login');
      })
    }
  }]);

gameUnivControllers.controller('AuthCtrl', ['$scope', '$window', '$location', 'Auth',
  function($scope, $window, $location, Auth) {
    $scope.title = "GameUniv";
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
