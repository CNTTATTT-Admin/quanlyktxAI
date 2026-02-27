const fs = require("fs");
const https = require("https");
const path = require("path");

const baseUrl =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";
const files = [
  "ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1",
  "ssd_mobilenetv1_model-shard2",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

const targetDir = path.join(__dirname, "public", "models");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to get '${url}' (Status Code: ${response.statusCode})`,
            ),
          );
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function run() {
  for (const fileName of files) {
    const url = baseUrl + fileName;
    const dest = path.join(targetDir, fileName);
    console.log(`Downloading ${fileName}...`);
    try {
      await download(url, dest);
      const stats = fs.statSync(dest);
      console.log(`Finished ${fileName} (${stats.size} bytes)`);
    } catch (err) {
      console.error(`Error downloading ${fileName}: ${err.message}`);
    }
  }
}

run();
