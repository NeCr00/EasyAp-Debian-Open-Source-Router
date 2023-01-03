$(document).ready(function () {

  
  //get data from
  function getData(url) {
    let data = fetch(url)
      .then((data) => {
        return data.json();
      })
      .then((post) => {
        //console.log(post);
        return post;
      });
    return data;
  }

  //post data to server
  function postData(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }


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

   // Set Modal Backgroud without color
   $("#modal").modal({
    backdrop: false,
  });
  //Error Modal
  function errorModal(msg) {
    $("#modal").modal("show");
    $("#modal-title").html('<p style="color:red; font-weight:bold;">Error</p>');
    $(".modal-body").html(
      '<p style="color:red; font-weight:bold;">' + msg + "</p>"
    );
  }

  function successModal(msg) {
    $("#modal").modal("show");
    $("#modal-title").html(
      '<p style="color:green; font-weight:bold;">Success</p>'
    );
    $(".modal-body").html(
      '<p style="color:green; font-weight:bold;">' + msg + "</p>"
    );
  }

  $("#reset-ddns").click(function () {
    $("input").val("");
  });


  //Put scroll at the bottom of the log files by default
  var textarea = document.getElementById('vpn-logs');
  textarea.scrollTop = textarea.scrollHeight;

  // Get VPN configuration-----------------------------------------

   async function SubmitVpnConf() {
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
  response = await postData('vpn/config', data);
  response_data = await response.json();

  if (response_data.error) {
    errorModal(response_data.message);
  } else {
    successModal(response_data.message);
  }

  }


  
  $("#submit-vpn").click(function () {
    SubmitVpnConf();
    $('#modal').modal('show');
  })
  //---------------------------------------------------

  //Get VPN configuration-----------------------------------------

 async  function GetVpnConf() {
    let data = await getData('vpn/config')

    if (data.cred_enable == "1") {
      $("#vpn-status-enable").prop("checked", true);
      $("#vpn-status-disable").prop("checked", false);
    } else {
      $("#vpn-status-enable").prop("checked", false);
      $("#vpn-status-disable").prop("checked", true);
    }

    if (data.cred_enable == "1") {
      $("#creds-status-enable").prop("checked", true);
      $("#creds-status-disable").prop("checked", false);
    } else {
      $("#creds-status-enable").prop("checked", false);
      $("#creds-status-disable").prop("checked", true);
    }

    $("#ssid").val(data.ssid);
     $("#port").val(data.port);
     $("#protocol").html(data.protocol);
     $("#enc_cipher").html(data.enc_cipher);
    $("#hash").html(data.hash);
     $("#username").val(data.username);
     $("#password").val(data.password);
     $("#tls-cipher").html(data.tls_cipher);
     $("#key-pass").val(data.key_pass);
     $("#tls-auth-key").val(data.tls_auth_key);
   $("#ca-cert").val(data.ca_cert);
     $("#pub-cert").val(data.pub_cert);
     $("#pri-cert").val(data.pri_cert);
    $("#add-config").val(data.add_config);

  }

  GetVpnConf()


  // Configuration File overview
  async function getConfigFile(){
   let data = await getData("vpn/config_file");
   $("#vpn-file").val(data.file);
  }
  getConfigFile()


  // Open vpn logs
  async function getLogs(){
    let data = await getData("vpn/logs");
    $("#vpn-logs").val(data.file);
   }
 
   getLogs()


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