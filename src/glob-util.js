const glob = require('glob-promise')
const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises;
const {excludedFoldersFilter} = require('./path-util');

async function readAllFilesWithExt(dir,ext) {
  const allVueFiles = await glob(path.join(dir, "/**/*." + ext), {})
  const probedFiles = allVueFiles.filter(excludedFoldersFilter)

  let readFilesPromises = []
  probedFiles.forEach(f => {
    const pms = fsPromises.readFile(f).then(data => ({
      filePath: f,
      fileStr: data.toString(),
    }));
    readFilesPromises.push(pms)
  })
  return (await Promise.allSettled(readFilesPromises)).map(pr => pr.value)
}

module.exports = {
  readAllFilesWithExt
}
