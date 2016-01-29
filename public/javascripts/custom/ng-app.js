
/// <referance path="angular.min.js" />

var myApp = angular.module("myBlog",[]);

myApp.controller("liveSearch", function($scope,$http){
  $scope.startSearch = function(){
    if($scope.keyword){
      $http.get("/search/"+ $scope.keyword)
           .then(function(res){
             $scope.posts = res;
           });
     }
     else $scope.posts = null;
  };
});

myApp.controller("regValidation",function($scope){
  $scope.comparePassword = function(){
    if($scope.myForm.password.$viewValue===$scope.myForm.password_c.$viewValue){
      $scope.myForm.password_c.$setValidity("noMatch",true);
    }
    if($scope.myForm.password.$viewValue!==$scope.myForm.password_c.$viewValue){
      $scope.myForm.password_c.$setValidity("noMatch",false);
    }
  }

});

