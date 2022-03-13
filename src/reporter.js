const {createDirIfNotExist, writeFile} = require('./fs-util')
const {datetimeStrForFilename} = require('./string-util')
const {findFilesWithNoWayToEntries, findUnusedFiles} = require('./analyzer')

function reportFilesWithNoWayToEntry(vueFiles) {
  const result = findFilesWithNoWayToEntries(vueFiles)
  doReport(result)
}

function reportUnusedFiles(vueFiles) {
  const result = findUnusedFiles(vueFiles)
  doReport(result)
}

function reportVueFiles(vueFiles) {
  doReport(vueFiles)
}

function doReport(data) {
  createDirIfNotExist('reports/')
  const fileName = "reports/" + datetimeStrForFilename(new Date()) + ".json"
  writeFile(fileName, JSON.stringify(data));
  console.log('analysis report: ' + fileName)
}

function doReportRaw(data) {
  createDirIfNotExist('reports/')
  const fileName = "reports/" + datetimeStrForFilename(new Date()) + ".json"
  writeFile(fileName, data);
  console.log('analysis report: ' + fileName)
}

module.exports = {
  doReport,
  doReportRaw
}