const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.get("/download", (req, res) => {
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

      res.json({
        success: true,
        title: json.title,
        thumbnail: json.thumbnail,
        duration: json.duration,
        formats: json.formats
          .filter(f => f.ext === "mp4")
          .map(f => ({
            quality: f.format_note,
            url: f.url
          }))
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
  console.log("yt-dlp worker running");
});