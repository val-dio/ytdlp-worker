const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/video", (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "Missing URL"
    });
  }

  const yt = spawn("yt-dlp", [
    "-j",
    "--no-playlist",
    url
  ]);

  let data = "";
  let error = "";

  yt.stdout.on("data", chunk => {
    data += chunk.toString();
  });

  yt.stderr.on("data", chunk => {
    error += chunk.toString();
  });

  yt.on("close", () => {
    if (!data) {
      return res.status(500).json({
        success: false,
        error
      });
    }

    try {
      const json = JSON.parse(data);

      const formats = (json.formats || [])
        .filter(f => f.url && f.ext === "mp4")
        .map(f => ({
          quality: f.format_note || "unknown",
          url: f.url,
          type: "mp4"
        }));

      // ADD MP3 OPTION
      const audio = (json.formats || [])
        .find(f => f.acodec !== "none");

      if (audio) {
        formats.push({
          quality: "mp3",
          url: audio.url,
          type: "mp3"
        });
      }

      res.json({
        success: true,
        title: json.title,
        thumbnail: json.thumbnail,
        duration: json.duration,
        formats
      });

    } catch (e) {
      res.status(500).json({
        success: false,
        error: e.message
      });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("GoTube backend running on Railway");
});