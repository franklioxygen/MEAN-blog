
/*
var app = angular.module('myBlog', ['UserValidation']);

angular.module('UserValidation', []).directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = (viewValue !== scope.myForm.password.$viewValue);
                ctrl.$setValidity('noMatch', !noMatch);
            });
        }
    };
});
*/
var myApp = angular.module('myBlog',[]);


myApp.controller('LiveSearch', function($scope,$http){
  $scope.startSearch = function(){
  $http.get('/search/'+ $scope.keyword)
       .then(function(res){
         $scope.posts = res;
       });

  };
});


