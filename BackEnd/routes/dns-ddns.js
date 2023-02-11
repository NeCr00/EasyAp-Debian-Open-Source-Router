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
  
  let data = getDDnsConfigs()
  res.json(data);
});

router.post("/ddns", async (req, res) => {
  console.log('posted ddns data:')
  console.log(req.body)
  await editDDnsConfigs(req.body)
  
  if (0) {
  } else {
    res.json({
      error: true,
      message: "An error occurred",
    });
  } //if error is occured

});

router.get("/dns", (req, res) => {
  
  let dnsServers = getDnsServers()
  res.json(dnsServers);
});

router.post("/dns", validateDataDNS, async (req, res) => {
  //Add new dns entries
  data = req.body;
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

router.delete("/dns", async (req, res) => {

  await editDnsServers('DELETE', req.body)

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
  
  let authoritativeDnsData = getDnsDomains()
  res.json(authoritativeDnsData);
});

router.post("/nameserver", validateDataNameserver, async (req, res) => {

  await editDnsDomains('POST', req.body)
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

router.delete("/nameserver", async (req, res) => {

  await editDnsDomains('DELETE', req.body)
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
