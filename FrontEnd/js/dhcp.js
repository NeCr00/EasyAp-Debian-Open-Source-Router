

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

  // Set Modal Backgroud without color
  $("#modal").modal({
    backdrop: false,
  });

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

  //  Modal Window
  $("#submit-dhcp").on("click", function () {
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
  //----------------------------------------------------------------------------

  //get already configured dhcp values
  async function getDHCP() {
    let data = await getData("/dhcp/config");
    
    if (data) {
      $("#start-ip").val(data.start_ip);
      $("#end-ip").val(data.end_ip);
      $("#mask").val(data.mask);
      $("#lan-ip").val(data.lan_ip);

      $("#time").val(data.time);

      if (data.lease_isEnabled)
        $("#lease-time").prop("checked", true);


      if (data.ddns_enabled == "1") {
        $("#dhcp-status-enable").prop("checked", true);
        $("#dhcp-status-disable").prop("checked", false);
      } else {
        $("#dhcp-status-enable").prop("checked", false);
        $("#dhcp-status-disable").prop("checked", true);
      }
    }
  }

  getDHCP()

  // Create Active IP Addresses
  async function CreateAddressTable() {
    var data = await getData("dhcp/connected_devices");

    data.forEach((item) => {
      var newRow = $('<tr class="border-bottom border-1 ">');
      var cols = "";

      cols += '<th class="text-center" scope="row">' + item.id + "</th>";
      cols += '<td class="  fw-bold" >' + item.host + "</td>";
      cols += '<td class="  fw-bold" >' + item.ip + "</td>";
      cols += '<td class="  fw-bold" >' + item.mac + "</td>";
      cols += '<td class="text-center  fw-bold">' + item.lease_time + "</td>";

      newRow.append(cols);
      $("#table-address").append(newRow);
    });
  }


  CreateAddressTable();

  //---------------------------------------------------------------------

  //Submit DHCP Parameters

  async function SubmitDHCP() {
    //get which radio is checked
    var dhcp_enable = document.querySelector(
      'input[name="dchp-status"]:checked'
    ).value;
    //get lease time toggle value
    var lease_isEnabled = $("#lease-time")[0].checked;

    //Get Fields parameters
    var start_ip = $("#start-ip").val();
    var end_ip = $("#end-ip").val();
    var mask = $("#mask").val();
    var lan_ip = $("#lan-ip").val();
    var time = $("#time").val();

    //Construct json object
    var data = {
      dhcp_enable: dhcp_enable,
      start_ip: start_ip,
      end_ip: end_ip,
      mask: mask,
      time: time,
      lease_isEnabled: lease_isEnabled,
    };
    
    //post data to server
    let res_status = await postData("dhcp/submit", data);
    let res_data = await res_status.json();
    console.log(res_status);
    console.log(res_data);
    if (res_data.error) {
      errorModal(res_data.message);
    } else {
      successModal(res_data.message);

    }
  }


  async function CreateStaticIpTable(data) {
    $("#static-ip-table > tbody").html("");
    let static_ip = await getData("dhcp/static-ips");
  
    static_ip.forEach((item, index) => {
      var newRow = $(
        "<tr id=item" + (index + 1) + ' class="border-bottom border-1 ">'
      );
      var cols = "";
  
      cols += '<th class="text-center fs-5" scope="row">' + (index + 1) + "</th>";
      cols +=
        '<td class=" item item-ip fs-6 fw-bold" contenteditable="false">' +
        item.ip +
        "</td>";
      cols +=
        '<td class=" item item-mac fs-6 fw-bold" contenteditable="false">' +
        item.mac +
        "</td>";
      cols +=
        ' <td  class=" table-authoritative-remove text-center "> <ion-icon name="trash-sharp"> </ion-icon> </td>';
  
      newRow.append(cols);
      $("#static-ip-table").append(newRow);
    });
  }
  
  CreateStaticIpTable();
  
  function AddStaticIP() {
    var newRow = $('<tr class="border-bottom border-1 ">');
    var cols = "";
    var rows = document.getElementById("static-ip-table-body").rows
      .length;
  
    cols += '<th class="text-center fs-5" scope="row">' + (rows + 1) + "</th>";
    cols +=
      '<td class=" new-item-ip  fs-6 fw-bold" contenteditable="true">Type IP</td>';
    cols +=
      '<td class=" new-item-mac fs-6 fw-bold" contenteditable="true">Type Mac</td>';
    cols +=
      '<td class=" text-center  table-authoritative-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';
  
    newRow.append(cols);
    $("#static-ip-table-body").append(newRow);
  }
  
  $("#add-static-ip-entry").on("click", function () {
    AddStaticIP(); //Add new row to dns table
  });
  
  async function submitStaticIPChanges() {
    var static_ip = []
    let deleted = deletedStaticIPs
  
    $("#static-ip-table-body tr .new-item-ip").each(function (item) {
      mac = $(this).parent().find(".new-item-mac").html();
      ip = $(this).html()
      static_ip.push({
        mac: mac,
        ip: ip,
      });
    })
    if (static_ip.length > 0) {
      let response = await postData("dhcp/static-ips", static_ip);
      let response_data = await response.json();
      console.log(response_data);
      if (response_data.error) {
        errorModal(response_data.message);
        $(".new-item-mac").parent().remove();
  
      } else {
        successModal(response_data.message);
      }
    }
    console.log(deleted)
    if (deleted.length > 0) {
      let res = await deleteData("dhcp/static-ips", deleted);
      let res_data = await res.json();
      if (res_data.error) {
        errorModal(res_data.message);
      } else {
        successModal(res_data.message);
      }
    }
    
  
    deletedStaticIPs = []
    CreateStaticIpTable();
  }
  
  
  $("#submit-static").on("click", function(){
    submitStaticIPChanges
  })
  
  
  
  
  var deletedStaticIPs = []
  
  
  
  function updateStaticIPRowNum() {
    $("#authoritative-dns-table-body th").each(function (index, item) {
      console.log(item.innerText);
      item.innerText = index + 1;
    });
  }
  
  $(document).on("click", ".table-authoritative-remove", function () {
    var item = $(this).closest("tr");
    item.remove(); //remove item
  
    //get value
    deletedIP = item.find(".item-ip").text();
    deletedMac = item.find(".item-mac").text();
  
    deletedStaticIPs.push({
      ip: deletedIP,
      mac: deletedMac,
    });
  
    updateStaticIPRowNum();
  });


  $("#submit-dhcp").click(function () {
    SubmitDHCP();
  });

  $("#reset-dhcp").click(function () {
    $("input").val("");
  });




});
