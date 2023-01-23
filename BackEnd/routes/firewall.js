const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
const bodyParser = require('body-parser');
const { getFirewallLogs, getFirewallRules } = require('../utils/firewallRulesHelper')


router.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, '../../FrontEnd/firewall.html'));


})



router.get('/rules', async (req, res) => {

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

  let rules = await getFirewallRules()
  console.log(rules)
  res.json(rules);


})

router.post('/rules', (req, res) => {

  let data = req.body

  if (1) {
    res.json({
      "error": false,
      "message": "Rule added successfully"
    })
  }
  else {
    res.json({
      "error": true,
      "message": "An error occurred"
    })
  }

})

router.post('/update-rules', (req, res) => {

  let data = req.body
  console.log(data)

  if (1) {
    res.json({
      "error": false,
      "message": "Rule added successfully"
    })
  }
  else {
    res.json({
      "error": true,
      "message": "An error occurred"
    })
  }


})

router.post('/custom-rule', (req, res) => {

  let data = req.body.rule
  const command_name = data.split("--name");

  command = command_name[0]
  rule_name = command_name[1]
  console.log(command, rule_name)

  if (1) {
    res.json({
      "error": false,
      "message": "Rule added successfully"
    })
  }
  else {
    res.json({
      "error": true,
      "message": "An error occurred"
    })
  }


})

router.get('/logs', async (req, res) => {

  logs = await getFirewallLogs()

  res.json({ "logs": logs })
})



module.exports = router;