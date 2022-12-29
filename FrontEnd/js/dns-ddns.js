var dns_data = [{
  "id": 1,
  "ip": "55.167.74.54"
}, {
  "id": 2,
  "ip": "233.23.23.11"
}, {
  "id": 3,
  "ip": "250.15.178.134"
}]

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

  //set selected value to providers dropdown
  $('#providers-list li').on('click', function () {
    console.log($("#provider").html())
    $('#provider').html($(this).text())
  });


  //Submit Dynamic DNS Parameters

  function SubmitDDns() {

    //get which radio is checked
    var ddns_enabled = document.querySelector('input[name="ddns-status"]:checked').value;
    //get dropdown parameters
    var provider = $("#provider").html()

    //Get Fields parameters
    var username = $("#username").val()
    var password = $("#password").val()
    var domain = $("#domain-name").val()


    //Construct json object
    var data = {
      "ddns_enabled": ddns_enabled,
      "provider": provider,
      "username": username,
      "password": password,
      "domain": domain
    }

    console.log(data)
  }

  $("#submit-ddns").click(function () {

    SubmitDDns()
  })
  //------------------------------------------------------------------------------------------

  // Create Active IP Addresses
  function CreateDnsTable(data) {

    data.forEach((item, index) => {

      var newRow = $('<tr id=item' + (index + 1) + ' class="border-bottom border-1 ">')
      var cols = ''

      cols += '<th class="text-center fs-5" scope="row">' + item.id + '</th>'
      cols += '<td class=" item fs-6 fw-bold" contenteditable="true">' + item.ip + '</td>'
      cols += ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

      newRow.append(cols)
      $("#dns-table").append(newRow)

    });

  }


  CreateDnsTable(dns_data); //Initialization of dns table
  //--------------------------------------------------------------------- 

  function AddRowDns() {

    var newRow = $('<tr class="border-bottom border-1 ">')
    var cols = ''
    var rows = document.getElementById("dns-table").rows.length;

    cols += '<th class="text-center fs-5" scope="row">' + (rows) + '</th>'
    cols += '<td class=" item fs-6 fw-bold" contenteditable="true">Type IP</td>'
    cols += ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

    newRow.append(cols)
    $("#dns-table").append(newRow)

  }

  $("#add-dns-entry").on('click', function () {
    AddRowDns() //Add new row to dns table
  })


  //--------------------------------------------------------------------- 


  function SubmitDns() {
    var dns_table = {
      "dns_table": []
    }

    $('#dns-table tr').each(function (index) {
      if (index) {
        var item = $(this).find(".item").html();
        dns_table.dns_table.push(item)
      }
    });
    console.log(dns_table)
  }

  $("#submit-dns-entry").click(function () {
    SubmitDns() //Add new row to dns table
  })




  //------------------------------------------------------------------------------------------
  var deletedDns = {
    "deletedDns": []
  }

  function updateRowNumDns() {
    console.log(1)
    $("#dns-table-body th").each(function (index, item) {
      console.log(item.innerText)
      item.innerText = index + 1
    })
  }

  $(document).on("click", ".table-remove", function () {
    var item = $(this).closest('tr')
    item.remove(); //remove item

    //get value
    deletedIP = item.find('.item').text()
    deletedDns.deletedDns.push(deletedIP)
    console.log(deletedDns)
    updateRowNumDns()
  });
  

  //  Modal Window
  $("#id-for-button").on('click', function () {
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

});

var authoritative_dns_data = [{
  "id": 1,
  "domain": "www.example.com",
  "ip" : "55.167.74.54"
}, {
  "id": 2,
  "domain": "mail.example.com",
  "ip": "233.23.23.11"
}, {
  "id": 3,
  "domain": "sftp.example.com",
  "ip": "250.15.178.134"
}]

function CreateAuthoritativeDnsTable(data) {

  data.forEach((item, index) => {

    var newRow = $('<tr id=item' + (index + 1) + ' class="border-bottom border-1 ">')
    var cols = ''

    cols += '<th class="text-center fs-5" scope="row">' + item.id + '</th>'
    cols += '<td class=" item fs-6 fw-bold" contenteditable="true">' + item.domain + '</td>'
    cols += '<td class=" item fs-6 fw-bold" contenteditable="true">' + item.ip + '</td>'
    cols += ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

    newRow.append(cols)
    $("#authoritative-dns-table").append(newRow)

  });

}

CreateAuthoritativeDnsTable(authoritative_dns_data);


function AddRowAuthoritativeDns() {

  var newRow = $('<tr class="border-bottom border-1 ">')
  var cols = ''
  var rows = document.getElementById("authoritative-dns-table-body").rows.length;

  cols += '<th class="text-center fs-5" scope="row">' + (rows + 1) + '</th>'
  cols += '<td class=" item fs-6 fw-bold" contenteditable="true">Type Domain</td>'
  cols += '<td class=" item fs-6 fw-bold" contenteditable="true">Type IP</td>'
  cols += '<td class=" text-center table-remove table-authoritative-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

  newRow.append(cols)
  $("#authoritative-dns-table-body").append(newRow)

}

$("#add-authoritative-dns-entry").on('click', function () {
  AddRowAuthoritativeDns() //Add new row to dns table
})

var deletedAuthoritativeDns = {
  "deletedAuthoritativeDns": []
}

//TODO: Solve bug on table update when entry is deleted
function updateRowNumAuthoritativeDns() {
  $("#authoritative-dns-table-body th").each(function (index, item) {
    console.log(item.innerText)
    item.innerText = index + 1
  })
}

$(document).on("click", ".table-authoritative-remove", function () {
  var item = $(this).closest('tr')
  item.remove(); //remove item

  //get value
  deletedDomain = item.find('.item').text()
  deletedAuthoritativeDns.deletedAuthoritativeDns.push(deletedDomain)
  console.log(deletedAuthoritativeDns)
  updateRowNumAuthoritativeDns()
});