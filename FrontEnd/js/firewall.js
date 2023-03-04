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

  $("#reset-ddns").click(function () {
    $("input").val("");
  });

  //set selected value to protocol dropdown
  $("#protocol-list li").on("click", function () {
    //console.log($("#provider").html())
    $("#protocol").html($(this).text());
  });
  //set selected value to encryption cipher dropdown
  $("#action-list li").on("click", function () {
    //console.log($("#provider").html())
    $("#action").html($(this).text());
  });

  // submit firewall rule --------------------------
  async function submitFirewallRules() {

    var chain = document.querySelector('input[name="chain"]:checked').value;
    
    var rule_name = $("#rule_name").val();
    var ip_source = $("#ip-source").val();
    var ip_dest = $("#ip-dest").val();
    var mac = $("#mac").val();
    var port_source = $("#port-source").val();
    var port_dest = $("#port-dest").val();
    var protocol = $("#protocol").html();
    var action = $("#action").html();

    var rules_data = {
      chain:chain,
      rule_name: rule_name,
      ip_source: ip_source,
      ip_dest: ip_dest,
      mac: mac,
      port_source: port_source,
      port_dest:port_dest,
      protocol: protocol,
      action: action,
    };

    let response = await postData("firewall/rules",rules_data);
    let response_data = await response.json();

    if (response_data.error) {
      errorModal(response_data.message);
    } else {
      await CreateFirewallRulesTable()
      successModal(response_data.message);
      
    }
  }

  $("#submit-rules").on("click", function () {
    submitFirewallRules();
  });

  //---------------------------------------------

  // Create Firewall rules table

  async function CreateFirewallRulesTable() {
    let data = await getData("firewall/rules");
    $("#firewall-table-body").html(" ");
    data.forEach((item, index) => {
      var newRow = $('<tr class="border-bottom border-1 ">');
      var cols = "";
      let status = "";

      if (item.status == 1) {
        status = "checked";
      }

      cols +=
        '<th class=" firewall-status text-center fs-5">' +
        "" +
        '<div class="col-md-4 col-sm-12 d-flex flex-row">' +
        "" +
        '<div class="form-check form-switch">' +
        "" +
        '<input class="form-check-input checkbox"' +
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
        '<td class=" item fs-6 fw-bold" contenteditable="false" value=' +
        item.id +
        ">" +
        item.rule_name +
        "</td>";

      cols +=
        '<td class=" fs-6 fw-bold" contenteditable="false" value=' +
        item.id +
        ">" +
        item.command +
        "</td>";
      cols +=
        ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>';

      newRow.append(cols);
      $("#firewall-table").append(newRow);
      
    });
  }
  CreateFirewallRulesTable();

  //-----------------------------------------------------------

  // Change Status for a firewall rule

  async function UpdateFirewallRuleStatus() {
    let rule_status = [];

    $("#firewall-table > tbody > tr").each(function () {
      let rule = $(this).find(".item").text();
      let status = $(this).find(".firewall-status input").prop("checked");
      rule_status.push({
        rule_name: rule,
        status: status,
      });
    });
    let data = [rule_status, deletedRule];

    let response = await postData("firewall/update-rules", data);
    let response_data = await response.json();

    if (response_data.error) {
      errorModal(response_data.message);
      return;
    }

    await CreateFirewallRulesTable()
    successModal("Firewall rules updated successfully");
    
  }

  //------------------------------------------------

  // Delete a Firewall Rule

  var deletedRule = [];

  $(document).on("click", ".table-remove", function () {
    var item = $(this).closest("tr");
    item.remove(); //remove item

    //get value
    rule = item.find(".item").text();
    id_rule = item.find(".item").attr("value");
    deletedRule.push({ id_rule: id_rule, deletedRule: rule });
  });

  //-------------------------------------------

  $("#submit-status-rules").on("click", function () {
    UpdateFirewallRuleStatus();
  });
  //-----------------------------------------------------------

  // Firewall Logs-------------------------------------------

  //Put scroll at the bottom of the log files by default
  var textarea = document.getElementById("firewall-logs");
  textarea.scrollTop = textarea.scrollHeight;
  

  async function getFirewallLogs() {
    logs = await getData("firewall/logs")
    
    if (logs.logs){
      $("#firewall-logs").val(logs.logs);
    }
    else{
      $("#firewall-logs").val("No Logs to Preview");
    }
  }
  getFirewallLogs()

  $("#refresh-firewall-logs").click(function () {
    getFirewallLogs()
  });
  //-----------------------------------------------------------
});
