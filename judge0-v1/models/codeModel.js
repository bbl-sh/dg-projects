import { exec } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";

// Utility to promisify exec
const execPromise = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ stdout, stderr });
        });
    });
};

export const executeCode = async (code) => {
    const uniqueId = randomUUID(); // Generate unique ID for temp file
    const tempFilePath = `/tmp/${uniqueId}.py`; // Temporary file path

    try {
        await writeFile(tempFilePath, code);
        const dockerCommand = `docker run --rm -v ${tempFilePath}:/app/code.py testing python /app/code.py`;
        const { stdout, stderr } = await execPromise(dockerCommand);

        return { stdout, stderr };
    } finally {
        try {
            await unlink(tempFilePath);
        } catch (cleanupError) {
            console.error("Failed to delete temp file:", cleanupError);
        }
    }
};
