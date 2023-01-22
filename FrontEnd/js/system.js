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

  async function changePassword() {
    let username = $("#username").val();
    let password = $("#password").val();
    let oldpassword = $("#old-password").val();
    let confirmPassword = $("#confirmpassword").val();

    if (!areAllfilled()) {
      errorModal("Please fill all the fields");
      return;
    }

    if (password === confirmPassword && password) {
      let data = {
        username: username,
        password: password,
        oldpassword: oldpassword
      }
      response = await postData('system/change-pass', data);
      response_data = await response.json()

      if (response_data.error) {
        errorModal(response_data.message);
      }
      else {
        successModal(response_data.message);

        $('input').val('')

      }
    }
    else {
      errorModal("Passwords do not match");
    }
  }

  $('#submit-pass').on('click', function () {
    changePassword()
  })

  $('#reset').on('click', function () {
    $('input').val('')
  })

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


  async function resetConfig() {
    // reset configuration
    let response = await postData('system/reset', {})
    let response_data = await response.json()
    if (response_data.error) {
      errorModal(response_data.message);
    }
    else {
      successModal(response_data.message);
    }
  }

  async function restartServices() {
    // restart services 
    // reset configuration
    let response = await postData('system/restart-services', {})
    let response_data = await response.json()
    if (response_data.error) {
      errorModal(response_data.message);
    }
    else {
      successModal(response_data.message);
    }
  }

  //Reboot Modal Actions
  $('#rebootModal').modal({
    backdrop: false
  });

  $('#resetModal').modal({
    backdrop: false
  });

  $("#reboot_bt").on('click', function () {

    $("#rebootModal").modal('show');
  })

  $("#reboot_close_modal_header").on('click', function () {
    $("#rebootModal").modal('hide');
  })

  $("#reboot_close_modal").on('click', function () {
    $("#rebootModal").modal('hide');
  })


  $("#reboot_proceed").on('click', function () {
    restartServices()
    $("#rebootModal").modal('hide');
  })

  // Reset Modal Actions
  $("#reset_bt").on('click', function () {

    $('#resetModal').modal('show');
  })

  $("#reset_close_modal_header").on('click', function () {
    $('#resetModal').modal('hide');
  })

  $("#reset_close_modal").on('click', function () {
    $('#resetModal').modal('hide');
  })


  $("#reset_proceed").on('click', function () {
    resetConfig()
    $('#resetModal').modal('hide');
  })
});