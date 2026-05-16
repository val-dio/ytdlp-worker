const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  const yt = spawn("yt-dlp", [
    "-f",
    "best",
    "--no-playlist",
    url
  ]);

  let output = "";

  yt.stdout.on("data", (data) => {
    output += data.toString();
  });

  yt.stderr.on("data", (data) => {
    console.log(data.toString());
  });

  yt.on("close", () => {
    res.json({
      success: true,
      data: output
    });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("yt-dlp worker running");
});