//json dumb data for address table
var address_data = [{
  "id": 1,
  "host": "Sax",
  "ip": "227.81.229.125",
  "mac": "4D-D2-2A-CC-E7-37",
  "time": 12646
}, {
  "id": 2,
  "host": "Creigh",
  "ip": "168.212.191.141",
  "mac": "1B-AB-EC-93-A8-DF",
  "time": 10674
}, {
  "id": 3,
  "host": "Donni",
  "ip": "26.128.171.197",
  "mac": "98-1D-20-04-09-B9",
  "time": 12087
}]
//----------------------------------------------------------------------------

$(document).ready(function () {

   // var lease_toggle = false
  // change toggle value $("#lease-time").prop('checked', true).change();

  $("#lease-time").change(function () {
    if ($(this).prop("checked") == true) {
      lease_toggle = true;
    } else {
      lease_toggle = false;
    }

  });


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

  //  Modal Window
  $("#submit-dhcp").on('click', function () {
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
  //----------------------------------------------------------------------------


  // Create Active IP Addresses
  function CreateAddressTable(data) {

    data.forEach(item => {

      var newRow = $('<tr class="border-bottom border-1 ">')
      var cols = ''

      cols += '<th class="text-center fs-5" scope="row">' + item.id + '</th>'
      cols += '<td class=" fs-6 fw-bold" >' + item.host + '</td>'
      cols += '<td class=" fs-6 fw-bold" >' + item.ip + '</td>'
      cols += '<td class=" fs-6 fw-bold" >' + item.mac + '</td>'
      cols += '<td class="text-center fs-6 fw-bold">' + item.time + '</td>'

      newRow.append(cols)
      $("#table-address").append(newRow)

    });

  }


  CreateAddressTable(address_data)
  //--------------------------------------------------------------------- 


  //Submit DHCP Parameters

  function SubmitDHCP() {

    //get which radio is checked
    var dhcp_enable = document.querySelector('input[name="dchp-status"]:checked').value;
    //get lease time toggle value
    var lease_isEnabled = $("#lease-time")[0].checked;

    //Get Fields parameters
    var start_ip = $("#start-ip").val()
    var end_ip = $("#end-ip").val()
    var mask = $("#mask").val()
    var lan_ip = $("#lan-ip").val()
    var time = $("#time").val()

    //Construct json object
    var data = {
      "dhcp_enable": dhcp_enable,
      "start_ip": start_ip,
      "end_ip": end_ip,
      "mask": mask,
      "lan_ip": lan_ip,
      "time": time,
      "lease_isEnabled": lease_isEnabled
    }

    console.log(data)
  }

  $("#submit-dhcp").click(function () {

    SubmitDHCP()
  })

  $("#reset-dhcp").click(function () {
    $("input").val('')
  })

});