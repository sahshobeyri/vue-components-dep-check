const fs = require('fs')

function isDir(p) {
  try {
    let stat = fs.lstatSync(p);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

function fileExists(p) {
  return fs.existsSync(p)
}

function createDirIfNotExist(p) {
  if (!fileExists(p)) fs.mkdirSync(p)
}

function writeFile(p,data) {
  fs.writeFileSync(p, data);
}

module.exports = {
  writeFile,
  createDirIfNotExist,
  fileExists,
  isDir,
}