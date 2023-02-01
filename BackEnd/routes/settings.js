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
const { forwardPort, removeForwardPort,changeStatusIPForwarding,getAllRules} = require('../utils/Settings/portForwading')
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
  applied = await updatePassAndSSID(data.ssid, data.password);

  console.log(applied);
  //if config was updated return success, otherwise return error message
  if (!applied) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: applied.message,
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
  let bannedMac = req.body.mac_table
  console.log(bannedMac);
  error = addMACAddress (bannedMac);
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
  console.log(mac)
  deleted = removeMACAddress(mac)

  if (deleted) {
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



router.get("/ip-forwarding", (req, res) => {
//get all the port forwarding rules
data = getAllRules()

  res.json(data);
});

router.post("/ip-forwarding", (req, res) => {

  data = req.body
  statusChanged = changeStatusIPForwarding('wlan0',data.internal_port,data.internal_ip,data.external_port,data.status,)

  console.log(data);
  if (statusChanged)  {
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

router.post("/ip-forwarding/add", (req, res) => {

  data = req.body
  applied = forwardPort('wlan0',data.internal_port,data.internal_ip,data.external_port)

  console.log(data);
  if (applied)  {
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

router.post("/ip-forwarding/status", (req, res) => {

  data = req.body
  statusChanged = changeStatusIPForwarding('wlan0',data.internal_port,data.internal_ip,data.external_port,data.status,)

  console.log(data);
  if (statusChanged)  {
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


router.delete("/ip-forwarding", (req, res) => {
  data = req.body
  //delete  the port forwarding rules
  deleted = removeForwardPort('wlan0',data.internal_port,data.internal_ip,data.external_port)
  console.log(data);

  if (deleted) {
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

module.exports = router;
