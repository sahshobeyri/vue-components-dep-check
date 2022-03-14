const {
  nonVueFilesFilter,
  restoreVueExtensionInPath,
  restoreIndexFileInPath,
  pathFromProjDir
} = require("./src/path-util");
const {
  createUsageGraph,
  findOrphans,
  convertGraphToGexf
} = require("./src/analyzer");
const {doReport} = require('./src/reporter')
const {extractFileImports} = require('./src/script-parser')
const {readAllVueFiles} = require('./src/glob-util')
const {PROJ_DIR} = require('./src/config')

async function main() {
  const allVueFiles = await readAllVueFiles(PROJ_DIR)
  const allCompsWithImports = allVueFiles.map(({filePath, fileStr}) => ({
    component: pathFromProjDir(filePath),
    imports: extractFileImports(fileStr, filePath)
      .map(restoreIndexFileInPath)
      .map(restoreVueExtensionInPath)
      .filter(nonVueFilesFilter)
      .map(pathFromProjDir)
  }));

  const usageGraph = createUsageGraph(allCompsWithImports)

  console.log('Number of nodes', usageGraph.order);
  console.log('Number of edges', usageGraph.size);

  const orphans = findOrphans(usageGraph)
  doReport(orphans)

  const gexfString = convertGraphToGexf(usageGraph)
  doReport(gexfString, {isRaw: true, ext: "gexf"})

}

main().then(() => console.log('exited with code 0'))
