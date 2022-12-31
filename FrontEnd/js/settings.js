var connDevices = [{
  "id": 1,
  "host": "kluis0",
  "ip": "64.209.138.54",
  "mac": "76-97-64-3D-5A-E5"
}, {
  "id": 2,
  "host": "adrane1",
  "ip": "209.91.175.209",
  "mac": "FF-30-BB-E2-F5-5E"
}, {
  "id": 3,
  "host": "ebalfre2",
  "ip": "104.149.93.157",
  "mac": "E3-DB-A9-85-1D-62"
}, {
  "id": 4,
  "host": "mheaford3",
  "ip": "192.228.116.28",
  "mac": "E8-EB-2E-F3-7F-C0"
}]

$(document).ready(function(){

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

//show hide password value
  $("#show-password").on("click", function(){
    if (this.checked){
      $("#password").prop("type", "text")
    }
    else{
      $("#password").prop("type", "password")
    }
  })
// ----------------------------------------------------------------

// reset wireless settings fields
function resetWirelessSettings(){
  $("#ssid").val("")
  $("#password").val("")
}

$("#reset-settings").on("click", function(){
  resetWirelessSettings()
})

//----------------------------------------------------------------
  // Updating the Wireless Settings

  function updateWirelessSettings(){
    let ssid = $("#ssid").val()
    let password = $("#password").val()

    let data = {
      ssid: ssid,
      password: password
    }
    //console.log(data)
  }

  $("#updateWirelessSettings").on('click',function(){
    updateWirelessSettings()
  })
// ----------------------------------------------------------------

//Check all the devices connected
function checkAllDevices(checked){
  if (checked){
    $(".devices").each(function() {
      $(this).prop('checked', true);
  });
  }
  else{
    $(".devices").each(function() {
      $(this).prop('checked', false);
  });
  }

}

$("#check-all-devices").on('click', function(){

  checkAllDevices($(this).prop('checked'))
})
//----------------------------------------------------------------

//Create the Connected devices table
function ConnectedDevicesFilterShow(data){

  data.forEach(item => {

    var newRow = $('<tr class="border-bottom border-1 ">')
    var cols = ''

    cols += '<th class="text-center pe-4" scope="row"> <input  class="devices form-check-input" type="checkbox"id="host'+item.id+'"></th>'
    cols += ' <td class="host"><ion-icon class="desktop-icon" name="desktop-sharp"></ion-icon>'+item.host+'</td>'
    cols += '<td class="ip text-center" >' + item.ip + '</td>'
    cols += '<td class="mac_add text-center" >' + item.mac + '</td>'
   

    newRow.append(cols)
    $("#connectedDevices").append(newRow)

  });
}

ConnectedDevicesFilterShow(connDevices)
//----------------------------------------------------------------

function submitConnectedDevicesFilter(){
  var filter_mac = []
  $(".devices").each(function() {
    

    let checked = $(this).prop('checked');
    let ip = $(this).parent().parent().find(".ip").html()
    let mac = $(this).parent().parent().find(".mac_add").html()
    let host = $(this).parent().parent().find(".host").val()

    if(checked){
      filter_mac.push({"ip":ip,"mac":mac,"host":host})
    }
    
});
console.log(filter_mac)
}

$("#submitConnectedDevices").on("click", function() {
  submitConnectedDevicesFilter(); 
})
//----------------------------------------------------------------

var mac_filter_data=[{
  "id": 1,
  "mac": "F9-4A-76-30-53-93"
}, {
  "id": 2,
  "mac": "4C-67-A7-CD-23-9E"
}, {
  "id": 3,
  "mac": "A6-3B-41-5B-C9-B3"
}]



 // Create Active IP Addresses
 function CreateMacFilterTable(data) {
console.log(1)
  data.forEach((item, index) => {

    var newRow = $('<tr id=item' + (index + 1) + ' class="border-bottom border-1 ">')
    var cols = ''

    cols += '<th class="text-center fs-5" scope="row">' + item.id + '</th>'
    cols += '<td class=" item fs-6 fw-bold" contenteditable="false">' + item.mac + '</td>'
    cols += ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

    newRow.append(cols)
    $("#mac-filter-table").append(newRow)

  });

}


CreateMacFilterTable(mac_filter_data); //Initialization of Mac filter table
//--------------------------------------------------------------------- 

function AddRowMac() {
  var rows = document.getElementById("mac-filter-table").rows.length;
  var newRow = $('<tr class="border-bottom border-1 ">')
  var cols = ''

  cols += '<th class="text-center fs-5" scope="row">' + rows + '</th>'
  cols += '<td class=" item fs-6 fw-bold" contenteditable="true">Type a Mac Address</td>'
  cols += ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'


  newRow.append(cols)
  $("#mac-filter-table").append(newRow)

}

$("#add-mac").on('click', function () {
  AddRowMac() //Add new row to dns table
})


//--------------------------------------------------------------------- 


function SubmitDns() {
  var mac_table = {
    "mac_table": []
  }

  $('#mac-filter-table tr').each(function (index) {
    if (index) {
      var item = $(this).find(".item").html();
      mac_table.mac_table.push(item)
    }
  });
  console.log(mac_table,deletedMac)
CreateMacFilterTable(mac_filter_data); //Initialization of Mac filter table

}

$("#submit-mac").click(function () {
  SubmitDns() //Add new row to dns table
})




//------------------------------------------------------------------------------------------
var deletedMac = {
  "deletedMac": []
}

function updateRowNumDns() {
  
  $("#mac-filter-table-body th").each(function (index, item) {
    //console.log(item.innerText)
    item.innerText = index + 1
  })
}

$(document).on("click", ".table-remove", function () {
  var item = $(this).closest('tr')
  item.remove(); //remove item

  //get value
  mac = item.find('.item').text()
  deletedMac.deletedMac.push(mac)
  console.log(deletedMac)
  updateRowNumDns()
});



//---------------------------------------------------------------------------

// Create Ipforwarding rules table
var ipForwardingData = [{
  "id": 1,
  "internal_ip": "100.196.150.242",
  "internal_port": 49,
  "external_port": 77,
  "status": false
}, {
  "id": 2,
  "internal_ip": "65.209.89.81",
  "internal_port": 98,
  "external_port": 50,
  "status": false
}, {
  "id": 3,
  "internal_ip": "7.221.27.61",
  "internal_port": 75,
  "external_port": 28,
  "status": true
}]

function CreateIpForwardTable(data) {
  data.forEach((item, index) => {

    var newRow = $('<tr class="border-bottom border-1 ">')
    var cols = ''
    let status = ""

    if (item.status == 1) {
      status = "checked"

    }

    cols += '<th class=" ip-forward-status text-center fs-5">' +
      '' +
      '<div class="col-md-4 col-sm-12 d-flex flex-row">' +
      '' +
      '<div class="form-check form-switch">' +
      '' +
      '<input class="status form-check-input checkbox"' +
      '' +
      'type="checkbox" role="switch"' +
      '' +
      'id="rule-status' + index + '" ' + status + ' value="'+item.id+'" />' +
      '' +
      '</div>' +
      '' +
      '</div>' +
      '' +
      ' </th>';
    cols += '<td class=" item fs-6 fw-bold" contenteditable="false" value='+item.id+'>' + item.internal_ip + '</td>'
    cols += '<td class=" item fs-6 fw-bold" contenteditable="false" value='+item.id+'>' + item.internal_port + '</td>'
    cols += '<td class=" item fs-6 fw-bold" contenteditable="false" value='+item.id+'>' + item.external_port + '</td>'
    cols += ' <td  class="  text-center table-forward-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

    newRow.append(cols)
    $("#ip-forward-table").append(newRow)



  });
}
CreateIpForwardTable(ipForwardingData)

//-----------------------------------------------------------

//add new row to the ip forward table
function AddRowIpForward() {
  var rows = document.getElementById("mac-filter-table").rows.length;
  var newRow = $('<tr class="border-bottom border-1 ">')
  var cols = ''

  cols += '<th class=" ip-forward-status text-center fs-5">' +
  '' +
  '<div class="col-md-4 col-sm-12 d-flex flex-row">' +
  '' +
  '<div class="form-check form-switch">' +
  '' +
  '<input class="status form-check-input checkbox"' +
  '' +
  'type="checkbox" role="switch"' +
  '' +
  'id="rule-status' + rows + '" ' + 'checked' + ' value="'+rows+'" />' +
  '' +
  '</div>' +
  '' +
  '</div>' +
  '' +
  ' </th>';
cols += '<td class=" item fs-6 fw-bold" contenteditable="true" value='+rows+'>' + 'Type IP' + '</td>'
cols += '<td class=" item fs-6 fw-bold" contenteditable="true" value='+rows+'>' + 'Type Port' + '</td>'
cols += '<td class=" item fs-6 fw-bold" contenteditable="true" value='+rows+'>' + 'Type Port' + '</td>'
cols += ' <td  class="  text-center table-forward-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'


  newRow.append(cols)
  $("#ip-forward-table").append(newRow)

}

$("#add-ipforward").on('click', function () {
  AddRowIpForward() //Add new row to dns table
})
//----------------------------------------------------------------

// Change Status for a firewall rule

function UpdateFirewallRuleStatus() {
  var ipForwardData=[]

  $("#ip-forward-table  tbody > tr").each(function () {
    let status = $(this).find('.status')
    let internal_ip = $(this).find('td').eq(0).text()
    let internal_port = $(this).find('td').eq(1).text()
    let external_port = $(this).find('td').eq(2).text()
    
    ipForwardData.push({
      internal_ip: internal_ip,
      internal_port: internal_port,
      external_port: external_port,
      status: status[0].checked
    })
    //alert($(this).find('td').eq(0).text() );
});

console.log(ipForwardData)
}


//------------------------------------------------

// Delete a Firewall Rule

var deletedRule = []


$(document).on("click", ".table-forward-remove", function () {
var item = $(this).closest('tr')
item.remove(); //remove item
});

//-------------------------------------------


$("#submit-forward-rules").on('click', function () {
  UpdateFirewallRuleStatus();
})



});