var Config = function(){
  this.pageSize = function(){
    return 5;
  };
  this.logger = function(){
    return 1;
  };

  this.dbSettings = function(params){
    var param = params;
    switch(param){
    case "URI":
	    return "mongodb://localhost/blog";
    case "secret":
	    return "myBlog";
    case "cookie-key":
	    return "myBlog";
    case "cookie-days":
            return 10;
    default:
            return 0;

    
    }
  };



  this.fileType = function(mime){
  switch(mime){
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    }
  } 

}

/*
var config= {
  pageSize: 5
};
*/
module.exports=Config;
