const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const validator = require("../middlewares/dataValidator");
const { getDnsServers, editDnsServers } = require('../utils/DNS/dnsServers')
const { createDomainZone, getDomainIPs, deleteDomainZone } = require('../utils/DNS/dnsDomains')
const { getDDnsConfigs, editDDnsConfigs } = require('../utils/DNS/ddnsConfig')


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

router.post("/dns", async (req, res) => {
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

router.get("/nameserver", async (req, res) => {

  let authoritativeDnsData = getDomainIPs()
  res.json(authoritativeDnsData);
});

router.post("/nameserver", async (req, res) => {

  data = req.body

  let status = await createDomainZone(data)


  if (!status.error) {
    res.json({
      error: false,
      message: status.message,
    });
  } else {
    res.json({
      error: true,
      message: status.message,
    });
  }
});

router.delete("/nameserver", async (req, res) => {

  data = req.body

  let status = await deleteDomainZone(data)

  if (!status.error) {
    res.json({
      error: false,
      message: status.message,
    });
  } else {
    res.json({
      error: true,
      message: status.message,
    });
  }
});

module.exports = router;
