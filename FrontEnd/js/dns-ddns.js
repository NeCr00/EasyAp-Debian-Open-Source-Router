$(document).ready(function () {
  // Set Modal Backgroud without color
  $("#modal").modal({
    backdrop: false,
  });

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

  function areAllfilled() {
    var isValid = true;
    $("input").each(function () {
      var element = $(this);
      if (element.val() == "") {
        isValid = false;
      }
    });
    return isValid;
  }

  //set selected value to providers dropdown
  $("#providers-list li").on("click", function () {
    console.log($("#provider").html());
    $("#provider").html($(this).text());
  });

  //set Already submited values to DDNS settings
  async function getDDNSConfig() {
    data = await getData("dns_ddns/ddns");
    data = data[0];

    $("#provider").html(data.provider);
    $("#username").val(data.username);
    $("#password").val(data.password);
    $("#domain-name").val("1");
    if (data.ddns_enabled == "1") {
      $("#ddns-status-enable").prop("checked", true);
      $("#ddns-status-disable").prop("checked", false);
    } else {
      $("#ddns-status-enable").prop("checked", false);
      $("#ddns-status-disable").prop("checked", true);
    }
  }

  getDDNSConfig();
  //Submit Dynamic DNS Parameters

  async function SubmitDDns() {
    if (areAllfilled()) {
      //get which radio is checked
      var ddns_enabled = document.querySelector(
        'input[name="ddns-status"]:checked'
      ).value;

      //get dropdown parameters
      var provider = $("#provider").html();

      //Get Fields parameters
      var username = $("#username").val();
      var password = $("#password").val();
      var domain = $("#domain-name").val();

      //Construct json object
      var data = {
        ddns_enabled: ddns_enabled,
        provider: provider,
        username: username,
        password: password,
        domain: domain,
      };

      let response = await postData("dns_ddns/ddns", data);
      let response_data = await response.json();

      if (response_data.error) {
        errorModal(response_data.message);
      } else {
        successModal(response_data.message);
      }
    } else {
      errorModal("Please fill all the fields");
    }
  }

  $("#submit-ddns").click(function () {
    SubmitDDns();
  });
  //------------------------------------------------------------------------------------------

  // Create Active IP Addresses
  async function CreateDnsTable() {
    $("#dns-table > tbody").html("");
    
    let data = await getData("dns_ddns/dns");

    data.forEach((item, index) => {
      var newRow = $(
        "<tr id=item" + (index + 1) + ' class="border-bottom border-1 ">'
      );
      var cols = "";

      cols += '<th class="text-center fs-5" scope="row">' + item.id + "</th>";
      cols +=
        '<td class=" item fs-6 fw-bold" contenteditable="false">' +
        item.ip +
        "</td>";
      cols +=
        ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

      newRow.append(cols);
      $("#dns-table").append(newRow);
    });
  }

  CreateDnsTable(); //Initialization of dns table
  //---------------------------------------------------------------------

  function AddRowDns() {
    var newRow = $('<tr class="border-bottom border-1 ">');
    var cols = "";
    var rows = document.getElementById("dns-table").rows.length;

    cols += '<th class="text-center fs-5" scope="row">' + rows + "</th>";
    cols +=
      '<td class="  new-item fs-6 fw-bold" contenteditable="true">Type IP</td>';
    cols +=
      ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

    newRow.append(cols);
    $("#dns-table").append(newRow);
  }

  $("#add-dns-entry").on("click", function () {
    AddRowDns(); //Add new row to dns table
  });

  //---------------------------------------------------------------------

  async function SubmitDns() {
    var dns_table = {
      new_dns: [],
      deleted_dns: deletedDns.deletedDns,
    };

    $("#dns-table-body tr").each(function (item) {
      var item = $(this).find(".new-item").html();
      if (item) dns_table.new_dns.push(item);
    });

    if (dns_table.new_dns.length > 0) {
      let response = await postData("dns_ddns/dns", dns_table.new_dns);
      let response_data = await response.json();
      if (response_data.error) {
        errorModal(response_data.message);
        $(".new-item").parent().remove();
      } else {
        successModal(response_data.message);
      }
    }

    if (dns_table.deleted_dns.length > 0) {
      let res = await deleteData("dns_ddns/dns", dns_table.deleted_dns);
      let res_data = await res.json();
      if (res_data.error) {
        errorModal(res_data.message);
      } else {
        successModal(res_data.message);
      }
    }
    
    CreateDnsTable()
  }

  $("#submit-dns-entry").click(function () {
    SubmitDns(); //Add new row to dns table
    deletedDns.deletedDns = []
  });

  //------------------------------------------------------------------------------------------
  var deletedDns = {
    deletedDns: [],
  };

  function updateRowNumDns() {
    console.log(1);
    $("#dns-table-body th").each(function (index, item) {
      console.log(item.innerText);
      item.innerText = index + 1;
    });
  }

  $(document).on("click", ".table-remove", function () {
    var item = $(this).closest("tr");
    item.remove(); //remove item

    //get value
    deletedIP = item.find(".item").text();
    deletedDns.deletedDns.push(deletedIP);
    console.log(deletedDns);
    updateRowNumDns();
  });

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
  //----------------------------------------------------------------------------

  async function CreateAuthoritativeDnsTable(data) {
    let data_dns = await getData("dns_ddns/nameserver");

    data_dns.forEach((item, index) => {
      var newRow = $(
        "<tr id=item" + (index + 1) + ' class="border-bottom border-1 ">'
      );
      var cols = "";

      cols += '<th class="text-center fs-5" scope="row">' + item.id + "</th>";
      cols +=
        '<td class=" item fs-6 fw-bold" contenteditable="false">' +
        item.domain +
        "</td>";
      cols +=
        '<td class=" item fs-6 fw-bold" contenteditable="false">' +
        item.ip +
        "</td>";
      cols +=
        ' <td  class=" table-authoritative-remove text-center "> <ion-icon name="trash-sharp"> </ion-icon> </td>';

      newRow.append(cols);
      $("#authoritative-dns-table").append(newRow);
    });
  }

  CreateAuthoritativeDnsTable();

  function AddRowAuthoritativeDns() {
    var newRow = $('<tr class="border-bottom border-1 ">');
    var cols = "";
    var rows = document.getElementById("authoritative-dns-table-body").rows
      .length;

    cols += '<th class="text-center fs-5" scope="row">' + (rows + 1) + "</th>";
    cols +=
      '<td class=" new-item-auth-domain  fs-6 fw-bold" contenteditable="true">Type Domain</td>';
    cols +=
      '<td class=" new-item-auth-ip fs-6 fw-bold" contenteditable="true">Type IP</td>';
    cols +=
      '<td class=" text-center  table-authoritative-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

    newRow.append(cols);
    $("#authoritative-dns-table-body").append(newRow);
  }

  $("#add-authoritative-dns-entry").on("click", function () {
    AddRowAuthoritativeDns(); //Add new row to dns table
  });

  async function submitAuthoritativeDns() {
    var auth_dns = []
    let deleted = deletedAuthoritativeDns 
  
    $("#authoritative-dns-table-body tr .new-item-auth-domain").each(function (item) {
      ip = $(this).parent().find(".new-item-auth-ip").html();
      domain = $(this).html()
      auth_dns.push({
        domain: domain,
        ip: ip,
    });
  })
    if (auth_dns.length > 0) {
      let response = await postData("dns_ddns/nameserver", auth_dns);
      let response_data = await response.json();
      if (response_data.error) {
        errorModal(response_data.message);
        $(".new-item-auth-ip").parent().remove();
        $(".new-item-auth-domain").parent().remove();
      } else {
        successModal(response_data.message);
      }
    }
    console.log(deleted)
    if (deleted.deletedAuthoritativeDns.length > 0) {
      let res = await deleteData("dns_ddns/nameserver", deleted);
      let res_data = await res.json();
      if (res_data.error) {
        errorModal(res_data.message);
      } else {
        successModal(res_data.message);
      }
    }
   }
  



 $("#submit-authoritative-dns").on("click", function () {
  submitAuthoritativeDns();
   //Submit new row to authoritative dns table
})

  var deletedAuthoritativeDns = {
    deletedAuthoritativeDns: [],
  };




  function updateRowNumAuthoritativeDns() {
    $("#authoritative-dns-table-body th").each(function (index, item) {
      console.log(item.innerText);
      item.innerText = index + 1;
    });
  }

  $(document).on("click", ".table-authoritative-remove", function () {
    var item = $(this).closest("tr");
    item.remove(); //remove item

    //get value
    deletedDomain = item.find(".item").text();
    deletedDomain = {
      domain: deletedDomain.replace(/\d+\.\d+\.\d+\.\d+$/, '').trim(),
      ip:     deletedDomain.replace(/^[^\d]+/, '').trim(),
    }
    deletedAuthoritativeDns.deletedAuthoritativeDns.push(deletedDomain);
    console.log(deletedAuthoritativeDns);
    updateRowNumAuthoritativeDns();
  });
});


