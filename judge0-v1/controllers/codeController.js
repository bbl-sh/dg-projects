import { executeCode } from "../models/codeModel.js";

export const runCode = async (req, res) => {
    const { code, language_id, test_cases } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Code is required" });
    }

    try {
        const results = await executeCode(code, language_id, test_cases);
        //console.log(results);
        res.json({ results });
    } catch (error) {
        res.status(500).json({
            error: "Failed to execute code",
            details: error.message,
        });
    }
};
