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
  let bannedMac = req.body
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

router.post("/connected-devices/ban", (req, res) => {
  let data = req.body
  if (0) {
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

router.get("/ip-forwarding", (req, res) => {
  let data = [{
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

  res.json(data);
});

router.post("/ip-forwarding", (req, res) => {

  data = req.body
  console.log(data);
  if (1) {
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
  console.log(data);
  if (1) {
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
