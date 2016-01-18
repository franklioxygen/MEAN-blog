var Config = function(){
  this.pageSize = function(){
    return 5;
  }
  this.logger = function(){
    return 1;
  }

  this.dbServer =function(params){
    var param=params;
    if (param=='host'){
      return 'mongodb://localhost/';
    }
    if (param=='database'){
      return 'blog';
    }
  }

  this.fileType = function(mime){
  if (mime=='image/png')
    return '.png';
  if (mime=='image/jpeg')
    return '.jpg';

  } 

}

/*
var config= {
  pageSize: 5
};
*/
module.exports=Config;
