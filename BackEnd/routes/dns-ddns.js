const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const validator = require("../middlewares/dataValidator");
const { getDnsServers, editDnsServers } = require('../utils/DNS/dnsServers')
const { getDnsDomains, editDnsDomains } = require('../utils/DNS/dnsDomains')
const { getDDnsConfigs, editDDnsConfigs } = require('../utils/DNS/ddnsConfig')

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
  // let data = [
  //   {
  //     ddns_enabled: "1",
  //     domain: "localhost",
  //     provider: "DYN",
  //     username: "admin",
  //     password: "admin",
  //   },
  // ];
  let data = getDDnsConfigs()

  res.json(data);
});

router.post("/ddns", async (req, res) => {
  // console.log(req.body);

  await editDDnsConfigs(req.body)
  
  if (0) {
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  } //if error is occured

});

router.get("/dns", async (req, res) => {
  // var dnsServers = [
  //   {
  //     id: 1,
  //     ip: "55.167.74.54",
  //   },
  //   {
  //     id: 2,
  //     ip: "233.23.23.11",
  //   },
  //   {
  //     id: 3,
  //     ip: "250.15.178.134",
  //   },
  // ];
  let dnsServers = await getDnsServers()

  res.json(dnsServers);
});

router.post("/dns", validateDataDNS, async (req, res) => {
  //Add new dns entries
  data = req.body;
  // console.log('post dns')
  // console.log(data);
  await editDnsServers('POST', req.body)
  
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
  console.log('delete dns')
  console.log(req.body);
  // editDnsServers('POST', req.body)

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
  var authoritativeDnsData = [
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
  // let authoritativeDnsData = getDnsDomains()

  res.json(authoritativeDnsData);
});

router.post("/nameserver", validateDataNameserver, (req, res) => {
  console.log(req.body);
  // editDnsDomains('POST', req.body)
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
  // editDnsDomains('DELETE', req.body)
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
