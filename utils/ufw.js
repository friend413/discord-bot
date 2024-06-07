import { exec } from "child_process"; 

export const allowIP = async (ip_address) => {
    const ufwcommand = `sudo ufw allow from ${ip_address}`;
    exec(ufwcommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`);
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}

export const deleteIP = async (ip_address) => {
    const ufwcommand = `sudo ufw delete allow from ${ip_address}`
    exec(ufwcommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`);
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}