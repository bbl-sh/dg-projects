import { executeCode } from "../models/codeModel.js";

export const runCode = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Code is required" });
    }

    try {
        const { stdout, stderr } = await executeCode(code);
        res.json({ stdout, stderr });
    } catch (error) {
        res.status(500).json({
            error: "Failed to execute code",
            details: error.message,
        });
    }
};
