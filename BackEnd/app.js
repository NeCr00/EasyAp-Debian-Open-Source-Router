// Modules
const express = require('express')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser');
const router = express.Router()
const app = express()
const port = 3000
const {authorization} = require('./middlewares/authorization')
//-----------------------------------------------------------------------------------------

// Functions that should be executed to configure and  initialize some functionalities
const {insertDefaultUser} = require('./Helpers/defaultUser')
const {monitorNetworkConnections} = require('./utils/Dashboard/getServerIP')
const {saveTrafficData} = require('./utils/Dashboard/networkTrafficMonitor')
const {initializeTrafficMonitorData} = require('./utils/Dashboard/networkTrafficMonitor')
const {enableDataUsageForIP,resetDataUsageDevicesStats} = require('./utils/DataUsage/enableDataUsage')
const {collectTrafficDataIPs} = require('./utils/DataUsage/collectClientsUsage')

//-----------------------------------------------------------------------------------------

//Routes
const login = require('./routes/login')
const index = require('./routes/index')
const dashboard = require('./routes/dashboard')
const logout = require('./routes/logout');
const dhcp = require('./routes/dhcp')
const dns_ddns = require('./routes/dns-ddns')
const firewall = require('./routes/firewall')
const settings  = require('./routes/settings')
const system = require('./routes/system')
const vpn = require('./routes/vpn')
const data_usage = require('./routes/data_usage')
const about = require('./routes/about');
//------------------------------------------------------------------------------------------


// Enabling body parsing to read json data from request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


//Making accessible the resources for all html files
app.use('/static/css', express.static(path.join(__dirname, '../FrontEnd/css'))) //static files for css files
app.use('/static/js', express.static(path.join(__dirname, '../FrontEnd/js'))) //static files for js files
app.use('/static/assets', express.static(path.join(__dirname, '../FrontEnd/assets'))) //static files for js files

// Default headers for caching
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


//Authentication Mechanisms explained:
//creates an express session. At the first land of the user in /login a cookie is returned. Cookie does not contain a userID value.
//At successful login, api appends a cookie with userID value with the corresponding id 
// the userID is checked if exists inside in cookie body to verify if the user has been authenticated.
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge: oneDay },
  resave: false
}));


//Initialization Functions that needs to run at the beginning
 insertDefaultUser()
 initializeTrafficMonitorData()
 resetDataUsageDevicesStats()

//This section contains functions that must run periodically
 setInterval(enableDataUsageForIP,4000)
 setInterval(collectTrafficDataIPs, 7000);

// // enables the network monitor for the dashboard
  
 setInterval(saveTrafficData,10000)
 setInterval(monitorNetworkConnections,5000)



// Unprotected Routes
app.use('/',index) // if is authenticated redirects user to dashboard,otherwise redirect to login
app.use('/login',login) //Login endpoint, if is authenticated redirects user to dashboard,otherwise redirect to login
app.use('/logout',logout) 

//Protected API Calls and routes.
// The following routes are using the authorization middleware to perform authorization checks
//If user is not authenticated and by extension is not authorizaed, api returns a statuc code 401
app.use('/dashboard',authorization, dashboard) // Dashboard page and rest api calls
app.use('/dhcp',authorization,dhcp) //
app.use('/dns_ddns',authorization,dns_ddns)
app.use('/firewall',authorization,firewall)
app.use('/settings',authorization,settings)
app.use('/system',authorization,system)
app.use('/vpn',authorization,vpn)
app.use('/data_usage',authorization,data_usage)
app.use('/about',authorization,about)



app.listen(port, () => {
  console.log(`Application is listening on port ${port}`)
})