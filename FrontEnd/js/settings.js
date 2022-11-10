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


    //Reboot Modal Actions
    $("#reboot_bt").on('click', function(){
        $('.modal').modal('show');
    })

    $("#reboot_close_modal_header").on('click', function(){
        $('.modal').modal('hide');
    })

    $("#reboot_close_modal").on('click', function(){
        $('.modal').modal('hide');
    })


    $("#reboot_proceed").on('click', function(){
        $('.modal').modal('hide');
    })

    // Reset Modal Actions
    $("#reset_bt").on('click', function(){
        $('.modal').modal('show');
    })

    $("#reset_close_modal_header").on('click', function(){
        $('.modal').modal('hide');
    })

    $("#reset_close_modal").on('click', function(){
        $('.modal').modal('hide');
    })


    $("#reset_proceed").on('click', function(){
        $('.modal').modal('hide');
    })
});