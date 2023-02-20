let fs = require('fs');
let util = require('util');
let exec = util.promisify(require('child_process').exec);
const path = require('path');


async function createDomainZone(data) {

    // Validate the domain name
    return new Promise(async (resolve, reject) => {
        try {
            for (domain of data) {
                console.log('test', domain)
                let domainName = domain.domain
                let ipAddress = domain.ip

                try {
                    let validDomainNameRegex = /^(?=.{1,253})(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/i

                    if (!validDomainNameRegex.test(domainName)) {
                        resolve({ error: true, message: 'Invalid domain name' });
                        return;
                    }

                    // Create the zone data for the domain
                    let zoneData = `$TTL 86400
@       IN      SOA     ns.${domainName}. admin.${domainName}. (
                        1       ; Serial
                        3600    ; Refresh
                        1800    ; Retry
                        604800  ; Expire
                        86400 ) ; Minimum TTL
        IN      NS      ns.${domainName}.
        
ns      IN      A       ${ipAddress}
@       IN      A       ${ipAddress}
`;


                    // Check if the zones directory exists, create it if it doesn't exist
                    let zonesDirectory = '/etc/bind/zones';
                    if (!fs.existsSync(zonesDirectory)) {
                        fs.mkdirSync(zonesDirectory, { recursive: true });
                    }

                    // Create the zone file
                    let zoneFilePath = path.join(zonesDirectory, `${domainName}.db`);
                    fs.writeFileSync(zoneFilePath, zoneData);

                    // Add the zone to the Bind9 configuration
                    let namedConfLocalPath = '/etc/bind/named.conf.local';
                    let namedConfLocalContent = fs.readFileSync(namedConfLocalPath, { encoding: 'utf8' });
                    let zoneConfig = `zone "${domainName}" {
                      type master;
                      file "${zoneFilePath}";
                  };
                  `;
                    fs.writeFileSync(namedConfLocalPath, namedConfLocalContent + zoneConfig);


                } catch (err) {
                    console.log(`Errro: ${err}`);
                    resolve({ error: true, message: 'Something went wrong' })
                    return;
                }
            }

            // Reload the Bind9 configuration
            await exec('sudo systemctl reload bind9')

            resolve({ error: false, message: `Domain(s) has been Added` });
            return;
        }
        catch (error) {
            console.log(`Errro: ${error}`);
            resolve({ error: true, message: 'Something went wrong' })
        }


    })

}


async function deleteDomainZone(data) {

    return new Promise(async (resolve, reject) => {
        for (domain of data) {
            try {
                let domainName = domain.domain
                // Check if the zone file exists
                let zoneFilePath = `/etc/bind/zones/${domainName}.db`;
                if (!fs.existsSync(zoneFilePath)) {
                    resolve({ error: true, message: `Zone file does not exist` });
                }

                // Remove the zone file
                try {
                    fs.unlinkSync(zoneFilePath);
                } catch (err) {
                    resolve({ error: true, message: `Could not Delete Zone File` });
                }

                // Check if the zone configuration exists in the Bind9 configuration
                let namedConfLocalPath = '/etc/bind/named.conf.local';
                let namedConfLocalContent = fs.readFileSync(namedConfLocalPath, { encoding: 'utf8' });
                let zoneConfigRegex = new RegExp(`zone\\s+"${domainName}"\\s*{[^}]*};`, 's');
                if (!zoneConfigRegex.test(namedConfLocalContent)) {
                    // Zone configuration doesn't exist, no need to delete
                    resolve({ error: true, message: `Zone Configuration doesn't Exists` });
                }

                // Remove the zone configuration from the Bind9 configuration
                namedConfLocalContent = namedConfLocalContent.replace(zoneConfigRegex, '');
                fs.writeFileSync(namedConfLocalPath, namedConfLocalContent);

                // Reload the Bind9 configuration

            } catch (error) {
                console.error(error)
                resolve({ error: true, message: 'Something went wrong.' })
            }
        }
        try {
            await exec('sudo systemctl reload bind9');
            resolve({ error: false, message: `Domains has been deleted` });
        } catch (error) {
            console.log(error)
            resolve({ error: true, message: 'Something went wrong.' })
        }
    })

}


function getDomainIPs() {
    try {
        // Define the path to the directory where zone files are stored
        let zonesDirPath = '/etc/bind/zones/';

        // Get the list of all files in the zones directory
        let files = fs.readdirSync(zonesDirPath);

        // Filter out any files that don't end in ".db"
        let zoneFiles = files.filter((file) => file.endsWith('.db'));

        // Extract the domain names from the file names
        let domainNames = zoneFiles.map((file) => file.slice(0, -3));

        id = 0;
        // Get the IP addresses for each domain
        let domainIPs = domainNames.map((domain) => {
            try {
                // Read the zone file for the domain
                let zoneFilePath = `${zonesDirPath}${domain}.db`;
                let zoneFileContents = fs.readFileSync(zoneFilePath, 'utf8');

                // Extract the IP address from the zone file contents
                let ipRegex = /^\s*@[^$]*?\b(?:A|AAAA)\s+([\d\w.:]+)/m;

                let ipMatch = zoneFileContents.match(ipRegex);
                if (ipMatch) {
                    // console.log(ipMatch[1].split('/\s+/'))
                    return { id: ++id, domain: domain, ip: ipMatch[1].split('/\s+/')[0] };
                } else {
                    return { id: ++id, domain: domain, ip: 'unknown' };
                }
            } catch (err) {
                console.error(`Error reading zone file for domain "${domain}": ${err.message}`);
                return { id: ++id, domain: domain, ip: 'unknown' };
            }
        });

        // Return the list of domain names and IP addresses
        return domainIPs;
    } catch (err) {
        console.error(`Error getting domain IPs: ${err.message}`);
        return [];
    }
}

module.exports = {
    createDomainZone,
    getDomainIPs,
    deleteDomainZone

}