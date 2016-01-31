var Config = function(){
  this.pageSize = function(){
    return 5;
  };
  this.logger = function(){
    return 1;
  };

  this.dbURI = function(){
            return "mongodb://localhost/blog";
  };
  this.dbSecret = function(){
            return "myBlog";
  };
  this.dbCookieKey = function(){
            return "myBlog";
  };
  this.dbCookieDays = function(){
            return "10";
  };



  this.fileType = function(mime){
  switch(mime){
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    }
  };

};

/*
var config= {
  pageSize: 5
};
*/
module.exports=Config;
