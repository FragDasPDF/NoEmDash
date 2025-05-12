const fs = require("fs");
const path = require("path");

// Create dist directory if it doesn't exist
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}

// Copy files to dist
const filesToCopy = ["manifest.json", "content.js", "options.html", "options.js"];

filesToCopy.forEach((file) => {
  fs.copyFileSync(file, path.join("dist", file));
});

console.log("Build completed. Files copied to dist/ directory.");
