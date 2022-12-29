

var firewall_rules = [{
  "id": 1,
  "rule_name": "rule 1",
  "status": "1"
}, {
  "id": 2,
  "rule_name": "rule 2",
  "status": "0"
}, {
  "id": 3,
  "rule_name": "rule 3",
  "status": "1"
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



  //set selected value to protocol dropdown
  $('#protocol-list li').on('click', function () {
    //console.log($("#provider").html())
    $('#protocol').html($(this).text())
  });
  //set selected value to encryption cipher dropdown
  $('#action-list li').on('click', function () {
    //console.log($("#provider").html())
    $('#action').html($(this).text())
  });

  // submit firewall rule --------------------------
  function submitFirewallRules() {
    var rule_name = $("#rule_name").val();
    var ip = $("#ip").val();
    var mac = $("#mac").val();
    var port = $("#port").val();
    var protocol = $("#protocol").html();
    var action = $("#action").html();

    var rules_data = {
      "rule_name": rule_name,
      "ip": ip,
      "mac": mac,
      "port": port,
      "protocol": protocol,
      "action": action
    }
    console.log(rules_data)
  }

  $("#submit-rules").on('click', function () {
    submitFirewallRules()
  })

  //---------------------------------------------


  // Create Firewall rules table

  function CreateFirewallRulesTable(data) {
    data.forEach((item, index) => {

      var newRow = $('<tr class="border-bottom border-1 ">')
      var cols = ''
      let status = ""

      if (item.status == 1) {
        status = "checked"

      }

      cols += '<th class=" firewall-status text-center fs-5">' +
        '' +
        '<div class="col-md-4 col-sm-12 d-flex flex-row">' +
        '' +
        '<div class="form-check form-switch">' +
        '' +
        '<input class="form-check-input checkbox"' +
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
      cols += '<td class=" item fs-6 fw-bold" contenteditable="true" value='+item.id+'>' + item.rule_name + '</td>'
      cols += ' <td  class="  text-center table-remove"> <ion-icon name="trash-sharp"> </ion-icon> </td>'

      newRow.append(cols)
      $("#firewall-table").append(newRow)



    });
  }
  CreateFirewallRulesTable(firewall_rules)

  //-----------------------------------------------------------

  // Change Status for a firewall rule

  function UpdateFirewallRuleStatus() {
    let elements = $('.firewall-status input');
    elements.each((index, item) => {
      //console.log(item.checked)
      let status = 0;
      if (item.checked) {
        status = 1;
      }
      let id = item.value
      console.log(id)
      console.log(status)
      firewall_rules[id-1].status=status
    })
    console.log(firewall_rules)
  }


//------------------------------------------------

// Delete a Firewall Rule

var deletedRule = []


$(document).on("click", ".table-remove", function () {
  var item = $(this).closest('tr')
  item.remove(); //remove item

  //get value
  rule = item.find('.item').text()
  id_rule = item.find('.item').attr('value')
  deletedRule.push({ "id_rule": id_rule,"deletedRule": rule})
  console.log(deletedRule)
});

//-------------------------------------------


  $("#submit-status-rules").on('click', function () {
    //UpdateFirewallRuleStatus();
  })
  //-----------------------------------------------------------


// Firewall Logs-------------------------------------------

  //Put scroll at the bottom of the log files by default
  var textarea = document.getElementById('firewall-logs');
  textarea.scrollTop = textarea.scrollHeight;
$("#firewall-logs").val("No Logs to Preview")
//-----------------------------------------------------------

});