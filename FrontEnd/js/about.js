$(document).ready(function(){


    $("#navbar-but").click(function(){
      var show = $("#navbarvalue").val()
      console.log(show)
      if(show){
        $("#navbarr").addClass("d-none")
        $("#navbarvalue").val("0")
      }
      if(show==0){
        $("#navbarr").removeClass("d-none")
        $("#navbarvalue").val("1")
        
      }
      
    });

    $('#spinnerModal').modal('show');
    
});