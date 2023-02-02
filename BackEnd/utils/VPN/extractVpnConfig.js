const fs = require('fs');

function extractVPNConfig() {
  try {
    const file = fs.readFileSync(__dirname+'/test.conf', 'utf-8');
    console.log(file);
    const lines = file.split('\n');

    let result = {
      serverIP: '',
      port: '',
      protocol: '',
      username: '',
      password: '',
      encCipher: '',
      hash: '',
      keyPass: '',
      caCert: '',
      pubCert: '',
      priCert: '',
      tlsAuth: '',
      tlsAuthKey: '',
      addConfig: '',
    };

    lines.forEach(line => {
        if (line.startsWith('remote ')) {
          let remote = line.split(' ');
          result.serverIP = remote[1];
          result.port = remote[2];
        } else if (line.startsWith('proto ')) {
          result.protocol = line.split(' ')[1];
        } else if (line.startsWith('auth-user-pass')) {
          let credentials = lines[lines.indexOf(line) + 1].split(',');
          result.username = credentials[0];
          result.password = credentials[1];
        } else if (line.startsWith('cipher ')) {
          result.encCipher = line.split(' ')[1];
        } else if (line.startsWith('auth ')) {
          result.hash = line.split(' ')[1];
        } else if (line.startsWith('tls-auth ') || line.startsWith('key-direction ')) {
          result.tlsAuth = line.startsWith('tls-auth') ? 'tls-auth' : 'tls-crypt';
          result.tlsAuthKey = line.split(' ').slice(-1)[0];
        } else if (line.startsWith('<ca>')) {
          let caLines = lines.slice(lines.indexOf(line), lines.indexOf('</ca>') + 1);
          result.caCert = caLines.filter(line => !line.startsWith('#') && !line.startsWith(';')).join('\n');
        } else if (line.startsWith('<cert>')) {
          let certLines = lines.slice(lines.indexOf(line), lines.indexOf('</cert>') + 1);
          result.pubCert = certLines.filter(line => !line.startsWith('#') && !line.startsWith(';')).join('\n');
        } else if (line.startsWith('<key>')) {
          let keyLines = lines.slice(lines.indexOf(line), lines.indexOf('</key>') + 1);
          result.priCert = keyLines.filter(line => !line.startsWith('#') && !line.startsWith(';')).join('\n');
        } else if (!line.startsWith('#') && !line.startsWith(';') && !line.startsWith('\n')) {
          result.addConfig += line +'\n'
        }
    });

    console.log(result);
  } catch (err) {
    console.error(err);
  }
}


function writeConfigFile(data) {
  let config = '';

  if (data.server_ip) {
    config += `remote ${data.server_ip}\n`;
  }

  if (data.port) {
    config += `port ${data.port}\n`;
  }

  if (data.protocol) {
    config += `proto ${data.protocol}\n`;
  }

  if (data.username) {
    config += `auth-user-pass\n`;
  }

  if (data.password) {
    config += `auth-user-pass\n`;
  }

  if (data.enc_cipher) {
    config += `cipher ${data.enc_cipher}\n`;
  }

  if (data.hash) {
    config += `auth ${data.hash}\n`;
  }

  if (data.key_pass) {
    config += `tls-auth ${data.key_pass}\n`;
  }

  if (data.ca_cert) {
    config += `ca ${data.ca_cert}\n`;
  }

  if (data.pub_cert) {
    config += `cert ${data.pub_cert}\n`;
  }

  if (data.pri_cert) {
    config += `key ${data.pri_cert}\n`;
  }

  if (data.add_config) {
    config += `${data.add_config}\n`;
  }

  try {
    fs.writeFileSync('/etc/openvpn/client.conf', config);
    console.log('OpenVPN configuration file updated successfully');
    return 'Success';
  } catch (error) {
    console.error(error);
    return 'Error';
  }
}



module.exports = {
    extractVPNConfig
}