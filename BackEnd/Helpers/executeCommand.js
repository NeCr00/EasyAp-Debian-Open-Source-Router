function executeCommand(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return false;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            //command produced error
            return false;
        }
        console.log(`stdout: ${stdout}`);
        //command executed successfully
        return true;
    });
}

module.exports= {executeCommand}