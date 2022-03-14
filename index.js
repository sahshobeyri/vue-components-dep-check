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
  console.group('Reading .vue files...')
  const allVueFiles = await readAllVueFiles(PROJ_DIR)
  console.log('Read ' + allVueFiles.length + ' files.')
  console.groupEnd()

  console.group('Extracting imports from .vue files...')
  const allCompsWithImports = allVueFiles.map(({filePath, fileStr}) => ({
    component: pathFromProjDir(filePath),
    imports: extractFileImports(fileStr, filePath)
      .map(restoreIndexFileInPath)
      .map(restoreVueExtensionInPath)
      .filter(nonVueFilesFilter)
      .map(pathFromProjDir)
  }));
  console.log('Done.')
  console.groupEnd()


  console.group('Creating Usage-Graph...')
  const usageGraph = createUsageGraph(allCompsWithImports)
  console.log('Usage-Graph created.')
  console.log('Number of nodes', usageGraph.order);
  console.log('Number of edges', usageGraph.size);
  console.groupEnd()

  console.group('Finding orphan components...')
  const orphans = findOrphans(usageGraph)
  doReport(orphans)
  console.groupEnd()

  console.group('Converting graph To gexf format...')
  const gexfString = convertGraphToGexf(usageGraph)
  doReport(gexfString, {isRaw: true, ext: "gexf"})
  console.groupEnd()

}

main().then(() => console.log('exited with code 0'))
