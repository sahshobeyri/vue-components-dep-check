const {doReport} = require('./src/reporter')
const {pathFromProjDir} = require('./src/path-util')
const {extractFileImports} = require('./src/script-parser')
const {readAllVueFiles} = require('./src/glob-util')
const {PROJ_DIR} = require('./src/config')

async function main () {
  const allVueFiles = await readAllVueFiles(PROJ_DIR)
  const allCompsWithImports = allVueFiles.map(({filePath,fileStr}) => ({
    component:  pathFromProjDir(filePath),
    // imports: extractFileImports(fileStr,filePath)
  }));
  console.log(allCompsWithImports)
  doReport(allCompsWithImports)
}

main().then(() => console.log('exited with code 0'))