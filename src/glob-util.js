import {excludedFoldersFilter} from "./path-util";

const glob = require('glob')
const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises;

export async function readAllVueFiles (dir) {
  let promises = []
  glob(path.join(dir, "/**/*.vue"), {}, function (er, files) {
    const probedFiles = files.filter(excludedFoldersFilter)
    probedFiles.forEach(f => {
      const pms = fsPromises.readFile(f).then(data => ({
        filePath: f,
        fileStr: data.toString(),
      }));
      promises.push(pms)
    })
  })
  return await Promise.allSettled(promises)
}