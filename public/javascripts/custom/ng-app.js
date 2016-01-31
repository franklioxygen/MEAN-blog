
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

  var config = {
    headers : {
        'Content-Type': 'application/json'
    }
  };

  $scope.sendPost = function(){
      var postId= $scope.articleId;

      var data = $.param({
      json: JSON.stringify({
        id:$scope.articleId,
        name:$scope.username,
        email:$scope.useremail,
        content:$scope.content
      })
    });

      var data = JSON.stringify({
        id:$scope.articleId,
        name:$scope.username,
        email:$scope.useremail,
        content:$scope.content
    });
/*
  
  $http({
    method: 'post',
    url: '/p/' + postId,
    data: data,
    config: config
  })
  .success(function(){})
  .error(function(){});

*/
  $http.post('/p/'+postId,data,config)
       .then(
        function(res){},
        function(err){  }
       )
   
  };
});
