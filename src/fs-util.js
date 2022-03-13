const fs = require('fs')

export function isDir(p) {
  try {
    let stat = fs.lstatSync(p);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

export function fileExists(p) {
  return fs.existsSync(p)
}

export function createDirIfNotExist(p) {
  if (!fileExists(p)) fs.mkdirSync(p)
}

export function writeFile(p,data) {
  fs.writeFileSync(p, data);
}
