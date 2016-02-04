(function() {
  'use strict';
  // angular module or controller definition goes here
})();


var myApp = angular.module('myBlog', []);


myApp.controller('signinValidation', function() {});

myApp.controller('editProfileValidation', function($scope) {
  $scope.comparePassword = function() {
    if ($scope.editProfileForm.newPassword.$viewValue === $scope.editProfileForm.newPassword_c.$viewValue) {
      $scope.editProfileForm.newPassword_c.$setValidity('noMatch', true);
    }
    if ($scope.editProfileForm.newPassword.$viewValue !== $scope.editProfileForm.newPassword_c.$viewValue) {
      $scope.editProfileForm.newPassword_c.$setValidity('noMatch', false);
    }
  };
});

myApp.controller('regValidation', function($scope) {
  $scope.comparePassword = function() {
    if ($scope.regForm.password.$viewValue === $scope.regForm.password_c.$viewValue) {
      $scope.regForm.password_c.$setValidity('noMatch', true);
    }
    if ($scope.regForm.password.$viewValue !== $scope.regForm.password_c.$viewValue) {
      $scope.regForm.password_c.$setValidity('noMatch', false);
    }

  };
});


myApp.controller('ngSearch', function($scope, $http) {
  $scope.startSearch = function() {
    if ($scope.keyword) {
      $http.get('/search/' + $scope.keyword)
        .then(function(res) {
          $scope.posts = res.data;
        });
    } else {
      $scope.posts = null;
    }
  };
});

myApp.controller('ngComment', function($scope, $http) {
  $scope.initComment = function() {
    var postId = $scope.articleId;
    $http.get('/getComment/' + postId)
      .then(function(res) {
        $scope.postComments = res.data;
      });
  };

  $scope.sendPost = function() {
    var postId = $scope.articleId;
    var data = {
      id: $scope.articleId,
      name: $scope.username,
      email: $scope.useremail,
      content: $scope.content
    };
    $http.post('/p/' + postId, data)
      .then(
        function(res) {
          $http.get('/getComment/' + postId)
            .then(function(res) {
              $scope.postComments = res.data;
              $scope.content = null;
            });
        });
  };
});

myApp.controller('sendEmail', function($scope, $http, $timeout) {
  var dismissTime=2;
  $scope.sendEmail = function() {
    $scope.statusMessage='Please wait...';
    var data = {
      emailName: $scope.emailName,
      emailAddress: $scope.emailAddress,
      emailContent: $scope.emailContent
    };
    $http.post('/sendEmail' , data)
      .then(function(res) {
        $scope.emailContent = null;
        if(res.status===200){
          $scope.statusMessage='Email has been sent.';
          $timeout(function(){
            $('#sendingEmail').modal('hide');
          }, dismissTime*1000);  
        }
        if(res.status===500){
          $scope.statusMessage='Failure, please contact phone.';
        }
      });
  };
});