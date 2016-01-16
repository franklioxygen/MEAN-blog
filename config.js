var Config = function(){
  this.pageSize = function(){
    return 5;
  }
  this.logger = function(){
    return 1;
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
