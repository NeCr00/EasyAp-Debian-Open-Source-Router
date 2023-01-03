const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const validator = require("../middlewares/dataValidator");

function validateDataDNS(req, res, next) {
  let data = req.body;
  let errors = false;
  data.forEach((item) => {
    let checkIpDNS = validator.validateIP(item);
    if (checkIpDNS.error) {
      errors = true;
      message = "Please enter a valid IP address";
    }
  });

  if (errors) res.json({ error: true, message: message });
  else next();
  console.log(errors); 
}

function validateDataNameserver(req, res, next) {
  let data = req.body;
  let errors = false;
  data.forEach((item) => {
    let checkIp = validator.validateIP(item.ip);
    if (checkIp.error) {
      errors = true;
      message = "Please enter a valid IP address";
    }
  });

  if (errors) res.json({ error: true, message: message });
  else next();
  console.log(errors); 
}

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../FrontEnd/dns-ddns.html"));
});

router.get("/ddns", (req, res) => {
  //get the already configured ddns from the database
  let data = [
    {
      ddns_enabled: "1",
      domain: "localhost",
      provider: "DYN",
      username: "admin",
      password: "admin",
    },
  ];

  res.json(data);
});

router.post("/ddns", (req, res) => {
  console.log(req.body);

  if (0) {
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  } //if error is occured
});

router.get("/dns", (req, res) => {
  var dns_data = [
    {
      id: 1,
      ip: "55.167.74.54",
    },
    {
      id: 2,
      ip: "233.23.23.11",
    },
    {
      id: 3,
      ip: "250.15.178.134",
    },
  ];

  res.json(dns_data);
});

router.post("/dns", validateDataDNS, (req, res) => {
  //Add new dns entries
  data = req.body;
  console.log(data);

  if (1) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  }
});

router.delete("/dns", (req, res) => {
  console.log(req.body);

  if (1) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  }
});

router.get("/nameserver", (req, res) => {
  var authoritative_dns_data = [
    {
      id: 1,
      domain: "www.example.com",
      ip: "55.167.74.54",
    },
    {
      id: 2,
      domain: "mail.example.com",
      ip: "233.23.23.11",
    },
    {
      id: 3,
      domain: "sftp.example.com",
      ip: "250.15.178.134",
    },
  ];

  res.json(authoritative_dns_data);
});

router.post("/nameserver", validateDataNameserver, (req, res) => {
  console.log(req.body);
  if (1) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  }
});

router.delete("/nameserver", (req, res) => {
  console.log(req.body);

  if (1) {
    res.json({
      error: false,
      message: "Changes applied successfully",
    });
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  }
});

module.exports = router;
