const fs = require("fs");
const path = require("path");

// Make sure dist exists
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}

// Copy extension files
const files = ["manifest.json", "content.js", "options.html", "options.js"];

files.forEach((file) => {
  fs.copyFileSync(file, path.join("dist", file));
});

// Copy icons and assets
if (fs.existsSync("icons")) {
  if (!fs.existsSync("dist/icons")) {
    fs.mkdirSync("dist/icons");
  }
  fs.readdirSync("icons").forEach((file) => {
    fs.copyFileSync(path.join("icons", file), path.join("dist/icons", file));
  });
}

if (fs.existsSync("img")) {
  if (!fs.existsSync("dist/img")) {
    fs.mkdirSync("dist/img");
  }
  fs.readdirSync("img").forEach((file) => {
    fs.copyFileSync(path.join("img", file), path.join("dist/img", file));
  });
}

console.log("Extension built successfully");
