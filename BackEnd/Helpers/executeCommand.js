const util = require('util');
const exec = util.promisify(require('child_process').exec)

function executeCommand(command) {


    return new Promise(function (resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                resolve(false);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                //command produced error
                resolve(false);
            }
            // console.log(`stdout: ${stdout}`);
            //command executed successfully
            resolve(stdout);
            // return stdout;
        });
    })

}

module.exports = { executeCommand }