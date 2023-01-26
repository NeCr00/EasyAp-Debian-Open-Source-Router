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

  //Delete data to server
  function deleteData(url, data) {
    return fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  //  Modal Window
  $("#id-for-button").on("click", function () {
    $("#modal").modal("show");
  });

  $("#close_modal_header").on("click", function () {
    $("#modal").modal("hide");
  });

  $("#close_modal").on("click", function () {
    $("#modal").modal("hide");
  });

  $("#proceed").on("click", function () {
    $("#modal").modal("hide");
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

  $("#navbar-but").click(function () {
    var show = $("#navbarvalue").val();
    console.log(show);
    if (show) {
      $("#navbarr").addClass("d-none");
      $("#navbarvalue").val("0");
    }
    if (show == 0) {
      $("#navbarr").removeClass("d-none");
      $("#navbarvalue").val("1");
    }
  });

  //show hide password value
  $("#show-password").on("click", function () {
    if (this.checked) {
      $("#password").prop("type", "text");
    } else {
      $("#password").prop("type", "password");
    }
  });
  // ----------------------------------------------------------------

  // reset wireless settings fields
  function resetWirelessSettings() {
    $("#ssid").val("");
    $("#password").val("");
  }

  $("#reset-settings").on("click", function () {
    resetWirelessSettings();
  });

  //----------------------------------------------------------------

// Get wireless settings

async function getWirelessSettings(){
  data = await getData('/settings/settings');

   $("#ssid").val(data.ssid);
   $("#password").val(data.password);
   console.log(data)
}
getWirelessSettings()

//---------------------------------------------------------------


  // Updating the Wireless Settings

  async function updateWirelessSettings() {
    let ssid = $("#ssid").val();
    let password = $("#password").val();

    let data = {
      ssid: ssid,
      password: password,
    };
    response = await postData("/settings/settings", data);
    response_data = response.json();

    if (response_data.error) {
      errorModal(response_data.message);
    } else {
      successModal("Settings Updated");
    }
  }

  $("#updateWirelessSettings").on("click", function () {
    updateWirelessSettings();
  });
  // ----------------------------------------------------------------

  //Check all the devices connected
  function checkAllDevices(checked) {
    if (checked) {
      $(".devices").each(function () {
        $(this).prop("checked", true);
      });
    } else {
      $(".devices").each(function () {
        $(this).prop("checked", false);
      });
    }
  }

  $("#check-all-devices").on("click", function () {
    checkAllDevices($(this).prop("checked"));
  });
  //----------------------------------------------------------------

  //Create the Connected devices table
  async function ConnectedDevicesFilterShow() {
    data = await getData("settings/devices");
    console.log(data);
    data.forEach((item) => {
      let checked = "";
      if (item.status === "enabled") checked = "checked";

      var newRow = $('<tr class="border-bottom border-1 ">');
      var cols = "";

      cols +=
        '<th class="text-center pe-4" scope="row"> <input ' +
        checked +
        ' class="devices form-check-input" type="checkbox"id="host' +
        item.id +
        '"></th>';
      cols +=
        ' <td class="host"><ion-icon class="desktop-icon" name="desktop-sharp"></ion-icon>' +
        item.host +
        "</td>";
      cols += '<td class="ip text-center" >' + item.ip + "</td>";
      cols += '<td class="mac_add text-center" >' + item.mac + "</td>";

      newRow.append(cols);
      $("#connectedDevices").append(newRow);
    });
  }

  ConnectedDevicesFilterShow();
  //----------------------------------------------------------------

  async function submitConnectedDevicesFilter() {
    var filter_mac = [];
    $(".devices").each(function () {
      let checked = $(this).prop("checked");
      let ip = $(this).parent().parent().find(".ip").html();
      let mac = $(this).parent().parent().find(".mac_add").html();
      let host = $(this).parent().parent().find(".host").val();

      if (checked) {
        filter_mac.push({ ip: ip, mac: mac, host: host, status: "enabled" });
      }
    });
    response = await postData("settings/connected-devices/ban");
    response_data = await response.json();

    if (response_data.error) {
      errorModal(response_data.message);
    } else {
      successModal("Connected Devices Updated");
    }
  }

  $("#submitConnectedDevices").on("click", function () {
    submitConnectedDevicesFilter();
  });
  //----------------------------------------------------------------

  // Create Active IP Addresses
  async function CreateMacFilterTable() {
    $("#mac-filter-table > tbody").html("");
    let data = await getData("settings/devices/ban");

    data.forEach((item, index) => {
      var newRow = $(
        "<tr id=item" + (index + 1) + ' class="border-bottom border-1 ">'
      );
      var cols = "";

      cols += '<th class="text-center fs-5" scope="row">' + item.id + "</th>";
      cols +=
        '<td class=" item fs-6 fw-bold" contenteditable="false">' +
        item.mac +
        "</td>";
      cols +=
        ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

      newRow.append(cols);
      $("#mac-filter-table").append(newRow);
    });
  }

  CreateMacFilterTable(); //Initialization of Mac filter table
  //---------------------------------------------------------------------

  function AddRowMac() {
    var rows = document.getElementById("mac-filter-table").rows.length;
    var newRow = $('<tr class="border-bottom border-1 ">');
    var cols = "";

    cols += '<th class="text-center fs-5" scope="row">' + rows + "</th>";
    cols +=
      '<td class=" new-item fs-6 fw-bold" contenteditable="true">Type a Mac Address</td>';
    cols +=
      ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

    newRow.append(cols);
    $("#mac-filter-table").append(newRow);
  }

  $("#add-mac").on("click", function () {
    AddRowMac(); //Add new row to dns table
  });

  //---------------------------------------------------------------------

  async function SubmitDns() {
    var mac_table = {
      mac_table: [],
    };

    $("#mac-filter-table tr").each(function (index) {
      if (index) {
        var item = $(this).find(".new-item").html();
        if(item)
        mac_table.mac_table.push(item);
      }
    });
    console.log(mac_table, deletedMac);

    response_post = await postData("settings/devices/ban", mac_table);
    response_data = await response_post.json();
    if (response_data.error) {
      errorModal(response_data.message);
      return;
    }

    if(deletedMac.length > 0){
      response_delete = await deleteData("settings/devices/ban", deletedMac);
      response_delete_data = await response_delete.json();
      if (response_delete_data.error) {
        errorModal(response_delete_data.message);
        return;
      }
    }
   

    successModal("Changes Applied Successfully");

    CreateMacFilterTable(); //Initialization of Mac filter table
  }

  $("#submit-mac").click(function () {
    SubmitDns(); //Add new row to dns table
  });

  //------------------------------------------------------------------------------------------
  var deletedMac = {
    deletedMac: [],
  };

  function updateRowNumDns() {
    $("#mac-filter-table-body th").each(function (index, item) {
      //console.log(item.innerText)
      item.innerText = index + 1;
    });
  }

  $(document).on("click", ".table-remove", function () {
    var item = $(this).closest("tr");
    item.remove(); //remove item

    //get value
    mac = item.find(".item").text();
    deletedMac.deletedMac.push(mac);
    console.log(deletedMac);
    updateRowNumDns();
  });

  //---------------------------------------------------------------------------



 async function CreateIpForwardTable() {
    $("#ip-forward-table > tbody").html("");

    data = await getData('settings/ip-forwarding')

    data.forEach((item, index) => {
      var newRow = $('<tr class="border-bottom border-1 ">');
      var cols = "";
      let status = "";

      if (item.status == 1) {
        status = "checked";
      }

      cols +=
        '<th class=" ip-forward-status text-center fs-5">' +
        "" +
        '<div class="col-md-4 col-sm-12 d-flex flex-row">' +
        "" +
        '<div class="form-check form-switch">' +
        "" +
        '<input class="status form-check-input checkbox"' +
        "" +
        'type="checkbox" role="switch"' +
        "" +
        'id="rule-status' +
        index +
        '" ' +
        status +
        ' value="' +
        item.id +
        '" />' +
        "" +
        "</div>" +
        "" +
        "</div>" +
        "" +
        " </th>";
      cols +=
        '<td class=" ip item fs-6 fw-bold" contenteditable="false" value=' +
        item.id +
        ">" +
        item.internal_ip +
        "</td>";
      cols +=
        '<td class=" int-port item fs-6 fw-bold" contenteditable="false" value=' +
        item.id +
        ">" +
        item.internal_port +
        "</td>";
      cols +=
        '<td class=" ext-port item fs-6 fw-bold" contenteditable="false" value=' +
        item.id +
        ">" +
        item.external_port +
        "</td>";
      cols +=
        ' <td  class="  text-center table-forward-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

      newRow.append(cols);
      $("#ip-forward-table").append(newRow);
    });
  }
  CreateIpForwardTable();

  //-----------------------------------------------------------

  //add new row to the ip forward table
  function AddRowIpForward() {
    var rows = document.getElementById("mac-filter-table").rows.length;
    var newRow = $('<tr class=" new-item border-bottom border-1 ">');
    var cols = "";

    cols +=
      '<th class=" ip-forward-status text-center fs-5">' +
      "" +
      '<div class="col-md-4 col-sm-12 d-flex flex-row">' +
      "" +
      '<div class="form-check form-switch">' +
      "" +
      '<input class="status form-check-input checkbox"' +
      "" +
      'type="checkbox" role="switch"' +
      "" +
      'id="rule-status' +
      rows +
      '" ' +
      "checked" +
      ' value="' +
      rows +
      '" />' +
      "" +
      "</div>" +
      "" +
      "</div>" +
      "" +
      " </th>";
    cols +=
      '<td class=" item fs-6 fw-bold" contenteditable="true" value=' +
      rows +
      ">" +
      "Type IP" +
      "</td>";
    cols +=
      '<td class=" item fs-6 fw-bold" contenteditable="true" value=' +
      rows +
      ">" +
      "Type Port" +
      "</td>";
    cols +=
      '<td class=" item fs-6 fw-bold" contenteditable="true" value=' +
      rows +
      ">" +
      "Type Port" +
      "</td>";
    cols +=
      ' <td  class="  text-center table-forward-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

    newRow.append(cols);
    $("#ip-forward-table").append(newRow);
  }

  $("#add-ipforward").on("click", function () {
    AddRowIpForward(); //Add new row to dns table
  });
  //----------------------------------------------------------------

  // Change Status for a firewall rule
  var ipForwardData = [];
  async function UpdateFirewallRuleStatus() {
    

    $("#ip-forward-table  tbody > .new-item").each(function () {
      let status = $(this).find(".status");
      let internal_ip = $(this).find("td").eq(0).text();
      let internal_port = $(this).find("td").eq(1).text();
      let external_port = $(this).find("td").eq(2).text();


      ipForwardData.push({
        internal_ip: internal_ip,
        internal_port: internal_port,
        external_port: external_port,
        status: status[0].checked,
      });
      //alert($(this).find('td').eq(0).text() );
    });

    
    //data = [ipForwardData,deletedRule]
    
    if(ipForwardData.length > 0) {
      response_post = await postData('settings/ip-forwarding',ipForwardData);
      response_post_data = response_post.json()
      if (response_post_data.error){
        errorModal(response_post_data.message)
        return
      }

    }

    if (deletedRule.length>0){
      response_post = await deleteData('settings/ip-forwarding',deletedRule);
      response_post_data = response_post.json()
      if (response_post_data.error){
        errorModal(response_post_data.message)
        return
      }
    }

    successModal("Changes applied successfully")
    ipForwardData = [];
    deletedRule=[]
    CreateIpForwardTable()
  }

  //------------------------------------------------

  // Delete a Firewall Rule

  var deletedRule = [];

  $(document).on("click", ".table-forward-remove", function () {
    var item = $(this).closest("tr");
    item.remove(); //remove item

    let ip = item.find(".ip").text()
    let external_port = item.find(".ext-port").text()
    let internal_port = item.find(".int-port").text()

    deletedRule.push({
      ip: ip,
      external_port: external_port,
      internal_port: internal_port,
    })
    
  });

  //-------------------------------------------

  $("#submit-forward-rules").on("click", function () {
    UpdateFirewallRuleStatus();
  });
});
