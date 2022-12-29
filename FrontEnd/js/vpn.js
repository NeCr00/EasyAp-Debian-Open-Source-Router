$(document).ready(function () {


  $("#navbar-but").click(function () {
    var show = $("#navbarvalue").val()
    console.log(show)
    if (show) {
      $("#navbarr").addClass("d-none")
      $("#navbarvalue").val("0")
    }
    if (show == 0) {
      $("#navbarr").removeClass("d-none")
      $("#navbarvalue").val("1")

    }

  });

  //set selected value to protocol dropdown
  $('#protocol-list li').on('click', function () {
    //console.log($("#provider").html())
    $('#protocol').html($(this).text())
  });
  //set selected value to encryption cipher dropdown
  $('#enc_cipher-list li').on('click', function () {
    //console.log($("#provider").html())
    $('#enc_cipher').html($(this).text())
  });

  //set selected value to hash dropdown
  $('#hash-list li').on('click', function () {
    //console.log($("#provider").html())
    $('#hash').html($(this).text())
  });
   //set selected value to tls-cipher dropdown
   $('#tls-cipher-list li').on('click', function () {
    //console.log($("#provider").html())
    $('#tls-cipher').html($(this).text())
  });


  //Put scroll at the bottom of the log files by default
  var textarea = document.getElementById('vpn-logs');
  textarea.scrollTop = textarea.scrollHeight;

  // Get VPN configuration-----------------------------------------

  function SubmitVpnConf() {
    //get which radio is checked
    var vpn_enable = document.querySelector('input[name="vpn-status"]:checked').value;
    var ssid = $("#ssid").val();
    var port = $("#port").val();
    var protocol = $("#protocol").html();
    var enc_cipher = $("#enc_cipher").html();
    var hash = $("#hash").html();
    var cred_enable = document.querySelector('input[name="creds-status"]:checked').value;
    var username = $("#username").val();
    var password = $("#password").val();
    var tls_cipher = $("#tls-cipher").html();
    var key_pass = $("#key-pass").val();
    var tls_auth_key = $("#tls-auth-key").val();
    var ca_cert = $("#ca-cert").val();
    var pub_cert = $("#pub-cert").val();
    var pri_cert = $("#pri-cert").val();
    var add_config = $("#add-config").val();


  var data = {
    "vpn_enable": vpn_enable,
    "ssid": ssid,
    "port": port,
    "protocol": protocol,
    "enc_cipher": enc_cipher,
    "hash": hash,
    "cred_enable": cred_enable,
    "username": username,
    "password": password,
    "tls_cipher": tls_cipher,
    "key_pass": key_pass,
    "tls_auth_key": tls_auth_key,
    "ca_cert": ca_cert,
    "pub_cert": pub_cert,
    "pri_cert": pri_cert,
    "add_config": add_config
  }
  console.log(data)
  }


  
  $("#submit-vpn").click(function () {
    SubmitVpnConf();
    $('#modal').modal('show');
  })
  //---------------------------------------------------


  // Configuration File overview
  $("#vpn-file").val("test.txt");

  // Open vpn logs
  $("#vpn-logs").val("tes111111");



   //  Modal Window
 $("#submit-vpn").on('click', function () {
  $('#modal').modal('show');
})

$("#close_modal_header").on('click', function () {
  $('#modal').modal('hide');
})

$("#close_modal").on('click', function () {
  $('#modal').modal('hide');
})


$("#proceed").on('click', function () {
  $('#modal').modal('hide');
})
//--------------------------------------------------------------------------
});