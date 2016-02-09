var Config = function(){
  this.pageSize = function(){
    return 5;
  };
  this.logger = function(){
    return 0; // 1 for enable, 0 for disable
  };
  this.portNum = function(){
            return "3000";
  };
  this.dbURI = function(){
            return "mongodb://localhost/blog";
  //  return "mongodb://meanblog:mbpass@ds060968.mongolab.com:60968/mean-blog";
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

module.exports=Config;
