const {createDirIfNotExist, writeFile} = require('./fs-util')
const {datetimeStrForFilename} = require('./string-util')

function reportFilesWithNoWayToEntry(vueFiles) {
  const result = findFilesWithNoWayToEntries(vueFiles)
  doReport(result)
}
function reportUnusedFiles(vueFiles) {
  const result = findUnusedFiles(vueFiles)
  doReport(result)
}
function reportFilesWithNoWayToEntry(vueFiles) {
  const result = vueFiles
  doReport(result)
}

function doReport(data) {
  createDirIfNotExist('reports/')
  writeFile("reports/" + datetimeStrForFilename(new Date()) + ".json", JSON.stringify(data));
}