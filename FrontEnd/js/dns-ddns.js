var dns_data = [{
  "id": 1,
  "ip": "55.167.74.54"
}, {
  "id": 2,
  "ip": "152.76.156.125"
}, {
  "id": 3,
  "ip": "250.15.178.134"
}]

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

  //set selected value to providers dropdown
  $('#providers-list li').on('click', function(){
    console.log($("#provider").html())
    $('#provider').html($(this).text())
});


  //Submit Dynamic DNS Parameters

  function SubmitDdns() {

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

    SubmitDdns()
  })
//------------------------------------------------------------------------------------------

 // Create Active IP Addresses
 function CreateDnsTable(data) {

  data.forEach(item => {

    var newRow = $('<tr class="border-bottom border-1 ">')
    var cols = ''

    cols += '<th class="text-center fs-5" scope="row">'+ item.id +'</th>'
    cols += '<td class=" fs-6 fw-bold" contenteditable="true">'+item.ip+'</td>'
    cols += ' <td id= class="text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

    newRow.append(cols)
    $("#dns-table").append(newRow)

  });

}


CreateDnsTable(dns_data) //Initialization of dns table
//--------------------------------------------------------------------- 

function AddRowDns() {



    var newRow = $('<tr class="border-bottom border-1 ">')
    var cols = ''

    var table_len = document.getElementById("dns-table").rows.length;

    cols += '<th class="text-center fs-5" scope="row">'+ table_len +'</th>'
    cols += '<td class=" fs-6 fw-bold" contenteditable="true"> Type DNS IP</td>'
    cols += ' <td id= class="text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

    newRow.append(cols)
    $("#dns-table").append(newRow)

}

$("#add-dns-entry").click(function(){
  AddRowDns() //Initialization of dns table
})


//--------------------------------------------------------------------- 


// delete ip dns from dns table
function DeleteDnsServer() {

}
//------------------------------------------------------------------------------------------


});