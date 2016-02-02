//custom js

$(function(){

  $('#alertMe').click(function(e){
    e.previentDefault();
  });

  $('a.pop').click(function(e){
    e.preventDefault();
  });

  $('a.pop').popover();
  $('[rel="tooltip"]').tooltip();


  $('#loginAlert').fadeTo(2000, 500).slideUp(500, function(){
    $('#loginAlert').alert('close');
  });

});
