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
  let log_textarea = document.getElementById('vpn-logs');
  log_textarea.scrollTop = log_textarea.scrollHeight;

  //On selecting a file, parse its content in the textarea
  $("#openVPNFileInput").change(function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      $("#vpn-config").val(e.target.result);
    };
    reader.readAsText(file);
  });

  // Get VPN configuration-----------------------------------------

  async function SubmitVpnConf() {
    var username = $("#username").val();
    var password = $("#password").val();
    var file = $('#openVPNFileInput').prop('files')[0];
  
    let data = {
      "file": '',
      "username": username,
      "password": password
    };
  
    // Create a new Promise object to wait for the file to load
    const fileLoaded = new Promise(resolve => {
      var reader = new FileReader();
      reader.onload = function(e) {
        var contents = e.target.result;
        data['file'] = contents;
        resolve(); // Resolve the Promise once the file is loaded
      };
      reader.readAsText(file);
    });
  
    // Wait for the file to load before making the API call
    await fileLoaded;
  
    response = await postData('vpn/config_file/upload', data);
    response_data = await response.json();
  
    console.log(response_data);
    if (response_data.error) {
      errorModal(response_data.message);
    } else {
      successModal(response_data.message);
    }
  }
  

  $("#apply-vpn-form").click(function () {
    SubmitVpnConf();
    $('#modal').modal('show');
  })
  //---------------------------------------------------

  //Get VPN configuration-----------------------------------------

  // Visualize if connected or disconnected to VPN
  async function getVpnStatus(){
    let response = await getData("vpn/status");
    if (response['vpn_status'] === 'connected'){
      $(".status-light").removeClass("disconnected");
      $(".status-light").addClass("connected");
      $("#vpn-status").html("Connected");
    }
  }
  getVpnStatus()

  // Configuration File overview
  async function getConfigFile() {
    let data = await getData("vpn/config_file");
    
    $("#vpn-config").val(data.file);
    
    if (data.auth){
      $("#username").val(data.auth.username);
      $("#password").val(data.auth.password);
    }
    
  }
  getConfigFile()


  // Open vpn logs
  async function getLogs() {
    let data = await getData("vpn/logs");
    $("#vpn-logs").val(data.file);
  }
  getLogs()

  $("#refresh-vpn-logs").click(function () {
    getLogs()
  });

  async function PostConfigFile() {
    let data = $("#vpn-config").val();
    // console.log(data)
    await postData('/vpn/config_file', { data })
  }
  $("#apply-vpn-configs").click(function () {
    PostConfigFile();
    $('#modal').modal('show');
  })

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

  $("#connect-btn").click(async function () {

    let connect = await postData('/vpn/connect', []);
    let connect_data = await connect.json();

    if (connect_data.error) {
      errorModal(response_data.message);
      return;
    }

    $(".status-light").removeClass("disconnected");
    $(".status-light").addClass("connected");
    $("#vpn-status").html("Connected");
  });

  $("#disconnect-btn").click(async function () {

    let disconnect = await postData('/vpn/disconnect', []);
    let connect_data = await disconnect.json();

    if (connect_data.error) {
      errorModal(response_data.message);
      return;
    }

    $(".status-light").removeClass("connected");
    $(".status-light").addClass("disconnected");
    $("#vpn-status").html("Disconnected");
  });



});