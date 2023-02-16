const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const { updatePassAndSSID,
  getPassAndSSID,
  getBlockedMACAddresses,
  addMACAddress,
  removeMACAddress } = require('../utils/Settings/settingsHandler')
const { getDevices } = require('../utils/Dashboard/getConnectedDevices')
const { forwardPort, removeForwardPort, changeStatusIPForwarding, getAllRules } = require('../utils/Settings/portForwarding')
const interface = require('../Helpers/constants')



router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../FrontEnd/settings.html"));
});


router.get("/settings", async (req, res) => {

  //get the Password and SSID from the hostapd.conf
  data = getPassAndSSID()

  res.json({
    ssid: data.ssid,
    password: data.wpa_passphrase,
  });
 
});

router.post("/settings", async (req, res) => {

  let data = req.body;
  //update the ssid and password at hostapd.conf
  output = await updatePassAndSSID(data.ssid, data.password);


  //if config was updated return success, otherwise return error message
  if (!output.error) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: output.message,
    });
  }
});

router.get("/devices", async (req, res) => {

  // get connected devices 
  connDevices = await getDevices()
  res.json(connDevices);

});

//Get Banned Mac
router.get("/devices/ban", (req, res) => {

  bannedMac = getBlockedMACAddresses()

  res.json(bannedMac);
});

router.post("/devices/ban", (req, res) => {

  let bannedMac = req.body

  let error = false;

  bannedMac.forEach(function () {
    output = addMACAddress(bannedMac);
    if (output.error) {
      error = true;
    }
  })

  if (!error) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occured",
    });
  }
});

router.delete("/devices/ban", (req, res) => {
  let mac = req.body

  let error = false;

  mac.forEach(function (mac) {
    output = removeMACAddress(mac)
    if (output.error) {
      error = true;
    }
  })


  if (!error) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occured",
    });
  }
})



router.get("/ip-forwarding", async (req, res) => {
  //get all the port forwarding rules
  data = await getAllRules()

  res.json(data);
});

router.post("/ip-forwarding", async (req, res) => {

  data = req.body
  statusChanged = await changeStatusIPForwarding(interface, data.internal_port, data.internal_ip, data.external_port, data.status)

  
  if (statusChanged) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occured",
    });
  }
});

router.post("/ip-forwarding/add", async (req, res) => {
  let data = req.body;

  for (let forwardData of data) {
    let output = await forwardPort(forwardData.internal_port, forwardData.internal_ip, forwardData.external_port,true);
    if (output.error) {
      res.json({
        error: true,
        message: "An error occured",
      });
      return;
    }
  }

  res.json({
    error: false,
    message: "Changes applied successfully",
  });
});

router.post("/ip-forwarding/status", async (req, res) => {

  let error = false;
  let data = req.body;
  
  for (let item of data) {
    
    output = await changeStatusIPForwarding(item.internal_port, item.internal_ip, item.external_port, item.status)

    if (output.error) {
      error = true;
      break;
    }
  }

  if (error) {
    return res.json({
      error: true,
      message: "An error occured",
    });
  }

  return res.json({
    error: false,
    message: "Changes applied successfully",
  });
});


router.delete("/ip-forwarding", async (req, res) => {
  let error = false;
  let data = req.body;

  for (let item of data) {
    
    let { internal_port, ip, external_port } = item;
    let output = await removeForwardPort(internal_port, ip, external_port,true);

    if (output.error) {
      error = true;
      break;
    }
  }

  if (error) {
    return res.json({
      error: true,
      message: "An error occured",
    });
  }

  return res.json({
    error: false,
    message: "Changes applied successfully",
  });
});

module.exports = router;
