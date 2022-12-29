$(document).ready(function () {
  $("form").on("submit", function (e) {
    e.preventDefault();
  });

  $("#submit-creds").on("click", async function () {
    var username = $("#username").val();
    var password = $("#password").val();

    if (username && password) {
      var data = { username: username, password: password };

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      let response = await fetch("/login/submit", {
        method: "POST",
        headers: myHeaders,
        mode: "cors",
        cache: "default",
        body: JSON.stringify(data),
        redirect: "follow",
      });


      
      let response_data = await response;
    

      //console.log(response_data.redirected);
      if (response_data.redirected) {
        window.location.href = "/dashboard";
      } 
      else{
        let response_body= await response.json();
        $("#notification").html(response_body);
      }
        
        
      
    } else {
      $("#notification").html("Please enter a username and password");
      //alert("Please enter a username and password");
    }
  });

});
