
/// <reference path="angular.min.js" />

var myApp = angular.module("myBlog",[]);


myApp.controller("regValidation", function($scope){
  $scope.comparePassword = function(){
    if($scope.myForm.password.$viewValue===$scope.myForm.password_c.$viewValue){
      $scope.myForm.password_c.$setValidity("noMatch",true);
    }
    if($scope.myForm.password.$viewValue!==$scope.myForm.password_c.$viewValue){
      $scope.myForm.password_c.$setValidity("noMatch",false);
    }
  }

});

myApp.controller("ngSearch", function($scope,$http){
  $scope.startSearch = function(){
    if($scope.keyword){
      $http.get("/search/"+ $scope.keyword)
           .then(function(res){
             $scope.posts = res.data;
           });
     }
     else {
      $scope.posts = null;
    }
  };
});

myApp.controller("ngComment", function($scope,$http){
  $scope.initComment = function(){
  var postId= $scope.articleId;
  $http.get("/getComment/"+ postId)
          .then(function(res){
          $scope.postComments = res.data;
           });
  };

  var config = {
    headers : {
        'Content-Type': 'application/json'
    }
  };

  $scope.sendPost = function(){
      var postId= $scope.articleId;
      var data ={
        id:$scope.articleId,
        name:$scope.username,
        email:$scope.useremail,
        content:$scope.content
    };
  $http.post('/p/'+postId,data)
       .then(
        function(res){
          $http.get("/getComment/"+ postId)
          .then(function(res){
          $scope.postComments = res.data;
          $scope.content=null;
           });
        },
        function(err){}
       );
   
  };
});
