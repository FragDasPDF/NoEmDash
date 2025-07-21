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

// Function to recursively copy a directory
function copyDirectoryRecursive(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDirectoryRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  });
}

// Copy icons, img, and locales directories
if (fs.existsSync("icons")) {
  copyDirectoryRecursive("icons", "dist/icons");
}

if (fs.existsSync("img")) {
  copyDirectoryRecursive("img", "dist/img");
}

if (fs.existsSync("_locales")) {
  copyDirectoryRecursive("_locales", "dist/_locales");
}

console.log("Extension built successfully");
