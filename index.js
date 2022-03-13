const {pathFromProjDir} = require('./src/path-util')
const {extractFileImports} = require('./src/script-parser')
const {readAllVueFiles} = require('./src/glob-util')

async function main () {
  const allVueFiles = readAllVueFiles()
  const allCompsWithImports = allVueFiles.map(({filePath,fileStr}) => ({
    component:  pathFromProjDir(filePath),
    imports: extractFileImports(fileStr,filePath)
  }));
}
