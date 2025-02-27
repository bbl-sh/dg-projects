import express from "express";
import CodeRoutes from "./routes/CodeRoutes.js";

const app = express();
app.use(express.json());

app.use("/api", CodeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
