import express from "express";
import cors from "cors";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Create downloads folder
const downloadsDir = '/tmp/downloads';
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

app.post("/download", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    const timestamp = Date.now();
    const output = path.join(downloadsDir, `video_${timestamp}.%(ext)s`);

    const args = ['-f', 'best[height<=1080]', '--no-playlist', '-o', output, url];

    console.log("Downloading:", url);

    execFile('yt-dlp', args, (error, stdout, stderr) => {
        if (error) {
            console.error("Error:", stderr);
            return res.status(500).json({ error: "Download failed. Make sure the video is public." });
        }

        // Find the downloaded file
        const files = fs.readdirSync(downloadsDir);
        const file = files.find(f => f.startsWith(`video_${timestamp}`));

        if (!file) {
            return res.status(500).json({ error: "File not found" });
        }

        const filePath = path.join(downloadsDir, file);
        
        res.download(filePath, () => {
            // Clean up after download
            fs.unlinkSync(filePath);
        });
    });
});

app.get("/", (req, res) => {
    res.send("Nexus backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});