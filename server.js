import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    const output = "video.%(ext)s";

    const command = `yt-dlp -f mp4 -o "${output}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Download failed" });
        }

        const file = fs.readdirSync("./").find(f => f.startsWith("video."));

        if (!file) {
            return res.status(500).json({ error: "File not found" });
        }

        res.download(file, () => {
            fs.unlinkSync(file);
        });
    });
});

app.get("/", (req, res) => {
    res.send("Nexus backend running.");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started.");
});
