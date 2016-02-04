( function () {
  'use strict';
  // angular module or controller definition goes here
} )();


var myApp = angular.module('myBlog',[]);


myApp.controller('signinValidation',function(){});

myApp.controller('editProfileValidation', function($scope){
  $scope.comparePassword = function(){
    if($scope.editProfileForm.newPassword.$viewValue===$scope.editProfileForm.newPassword_c.$viewValue){
      $scope.editProfileForm.newPassword_c.$setValidity('noMatch',true);
    }
    if($scope.editProfileForm.newPassword.$viewValue!==$scope.editProfileForm.newPassword_c.$viewValue){
      $scope.editProfileForm.newPassword_c.$setValidity('noMatch',false);
    }
  };
});

myApp.controller('regValidation', function($scope){
  $scope.comparePassword = function(){
    if($scope.regForm.password.$viewValue===$scope.regForm.password_c.$viewValue){
      $scope.regForm.password_c.$setValidity('noMatch',true);
    }
    if($scope.regForm.password.$viewValue!==$scope.regForm.password_c.$viewValue){
      $scope.regForm.password_c.$setValidity('noMatch',false);
    }

  };
});


myApp.controller('ngSearch', function($scope,$http){
  $scope.startSearch = function(){
    if($scope.keyword){
      $http.get('/search/'+ $scope.keyword)
           .then(function(res){
             $scope.posts = res.data;
           });
     }
     else {
      $scope.posts = null;
    }
  };
});

myApp.controller('ngComment', function($scope,$http){
  $scope.initComment = function(){
  var postId= $scope.articleId;
  $http.get('/getComment/'+ postId)
          .then(function(res){
          $scope.postComments = res.data;
           });
  };

  $scope.sendPost = function(){
      var postId= $scope.articleId;
      var data ={
        id:$scope.articleId,
        name:$scope.username,
        email:$scope.useremail,
        content:$scope.content
    };
  $http.post('/p/' + postId,data)
       .then(
        function(res){
          $http.get('/getComment/'+ postId)
          .then(function(res){
          $scope.postComments = res.data;
          $scope.content=null;
           });
        });
  };
});
