const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const {updatePassAndSSID,getPassAndSSID} = require('../utils/Settings/settingsHandler')

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../FrontEnd/settings.html"));
});

router.get("/settings", async (req, res) => {

  data =  getPassAndSSID()
  console.log(data);
  res.json({
    ssid: data.ssid,
    password: data.wpa_passphrase,
  });
});

router.post("/settings", async (req, res) => {
  let data = req.body;
  applied = updatePassAndSSID(data.ssid, data.password);
  
  if (!applied.error) {
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

router.get("/devices", (req, res) => {
  let data = [
    { 
      id: 1,
      host: "kluis0",
      ip: "64.209.138.54",
      mac: "76-97-64-3D-5A-E5",
      status:"enabled"
    },
    {
      id: 2,
      host: "adrane1",
      ip: "209.91.175.209",
      mac: "FF-30-BB-E2-F5-5E",
      status:"disabled"
    },
    {
      id: 3,
      host: "ebalfre2",
      ip: "104.149.93.157",
      mac: "E3-DB-A9-85-1D-62",
      status:"enabled"
    },
  ];

  res.json(data);
});

router.get("/devices/ban", (req, res) => {
  let data =[{
    "id": 1,
    "mac": "F9-4A-76-30-53-93"
  }, {
    "id": 2,
    "mac": "4C-67-A7-CD-23-9E"
  }, {
    "id": 3,
    "mac": "A6-3B-41-5B-C9-B3"
  }]

  res.json(data);
});

router.post("/devices/ban", (req, res) => {
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

router.delete("/devices/ban", (req, res) => {
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
let data= [{
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
