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

const languageConfigs = {
    1: {
        image: "cpp-image",
        extension: "cpp",
        command: "g++ /app/code.cpp -o /app/code && /app/code < /app/input.txt",
    },
    2: {
        image: "python-image",
        extension: "py",
        command: "python /app/code.py < /app/input.txt",
    },
    3: {
        image: "node-image",
        extension: "js",
        command: "node /app/code.js < /app/input.txt",
    },
    4: {
        image: "python-image",
        extension: "py",
        command: "python /app/code.py < /app/input.txt",
    }, // Pandas
    5: {
        image: "bash-image",
        extension: "sh",
        command: "bash /app/code.sh < /app/input.txt",
    },
    6: {
        image: "python-image",
        extension: "py",
        command: "python /app/code.py < /app/input.txt",
    }, // PyTorch
    7: {
        image: "go-image",
        extension: "go",
        command:
            "go build -o /app/code /app/code.go && /app/code < /app/input.txt",
    },
};

export const executeCode = async (code, language_id, test_cases) => {
    if (!code || !test_cases || !Array.isArray(test_cases)) {
        throw new Error("Invalid input: code and test_cases are required.");
    }

    const config = languageConfigs[language_id];
    if (!config) {
        throw new Error(`Unsupported language_id: ${language_id}`);
    }

    const results = [];

    for (const tc of test_cases) {
        const uniqueId = randomUUID();
        const tempCodePath = `/tmp/${uniqueId}_code.${config.extension}`;
        const tempInputPath = `/tmp/${uniqueId}_input.txt`;

        try {
            await writeFile(tempCodePath, code);
            await writeFile(tempInputPath, tc.input);

            // Run Docker container with input redirected from file
            const dockerCommand = `docker run --rm -v ${tempCodePath}:/app/code.${config.extension} -v ${tempInputPath}:/app/input.txt ${config.image} bash -c "${config.command}"`;
            const { stdout, stderr } = await execPromise(dockerCommand);
            let passed;

            if (stdout.trim() == tc.expected.trim()) {
                passed = true;
            } else {
                passed = false;
            }
            results.push({
                input: tc.input,
                expected: tc.expected,
                output: stdout,
                stderr: stderr,
                passed: passed,
            });
        } catch (error) {
            results.push({
                input: tc.input,
                expected: tc.expected,
                error: error.message,
            });
        } finally {
            try {
                await Promise.all([
                    unlink(tempCodePath),
                    unlink(tempInputPath),
                ]);
            } catch (cleanupError) {
                console.error("Failed to delete temp files:", cleanupError);
            }
        }
    }
    //console.log(results);
    return results;
};
