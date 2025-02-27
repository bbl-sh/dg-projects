import { exec } from "child_process";

exec("python3 test.py", (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`${stdout}`);
    if (stderr != "") console.error(`stderr: ${stderr}`);
});
