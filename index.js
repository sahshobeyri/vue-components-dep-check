const {extractGlobalComponentsRegistered} = require("./src/script-parser");
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
const {readAllFilesWithExt} = require('./src/glob-util')
const {PROJ_DIR} = require('./src/config')

async function main() {
  console.group('Reading .vue files...')
  const allVueFiles = await readAllFilesWithExt(PROJ_DIR,'vue')
  console.log(`Read ${allVueFiles.length} files.`)
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

  console.group('Reading .js files...')
  const allJsFiles = await readAllFilesWithExt(PROJ_DIR,'js')
  console.log(`Read ${allJsFiles.length} files.`)
  console.groupEnd()

  console.group('Extracting global components...')
  let allGlobalComponents = []
  allJsFiles.forEach(({filePath, fileStr}) => {
    const globalComponents = extractGlobalComponentsRegistered(fileStr,filePath)
      .map(restoreIndexFileInPath)
      .map(restoreVueExtensionInPath)
      .filter(nonVueFilesFilter)
      .map(pathFromProjDir)
    allGlobalComponents.push(...globalComponents)
  })
  console.log(`Found ${allGlobalComponents.length} global components.`)
  console.groupEnd()

  console.group('Creating Usage-Graph...')
  const usageGraph = createUsageGraph(allCompsWithImports,allGlobalComponents)
  console.log('Usage-Graph created.')
  console.log('Number of nodes', usageGraph.order);
  console.log('Number of edges', usageGraph.size);
  console.groupEnd()

  console.group('Finding orphan components...')
  const orphans = findOrphans(usageGraph)
  console.log(`Found ${orphans.length} global components.`)
  doReport(orphans)
  console.groupEnd()

  console.group('Converting graph To gexf format...')
  const gexfString = convertGraphToGexf(usageGraph)
  doReport(gexfString, {isRaw: true, ext: "gexf"})
  console.groupEnd()

}

main().then(() => console.log('exited with code 0'))
