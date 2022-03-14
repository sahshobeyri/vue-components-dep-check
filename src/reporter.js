const {createDirIfNotExist, writeFile} = require('./fs-util')
const {datetimeStrForFilename} = require('./string-util')

function doReport(data, options = {ext: "json", isRaw: false}) {
  const exportedData = options.isRaw ? data : JSON.stringify(data)
  const fileName = "reports/" + datetimeStrForFilename(new Date()) + "." + options.ext
  createDirIfNotExist('reports/')
  writeFile(fileName, exportedData);
  console.log('analysis report: ' + fileName)
}

module.exports = {
  doReport,
}
