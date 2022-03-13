const {doReportRaw} = require("./src/reporter");
const {nonVueFilesFilter} = require("./src/path-util");
const {restoreVueExtensionInPath} = require("./src/path-util");
const {restoreIndexFileInPath} = require("./src/path-util");
const {doReport} = require('./src/reporter')
const {pathFromProjDir} = require('./src/path-util')
const {extractFileImports} = require('./src/script-parser')
const {readAllVueFiles} = require('./src/glob-util')
const {PROJ_DIR} = require('./src/config')
const {DirectedGraph} = require('graphology')
const render = require('graphology-svg');
const {isComponentEntry} = require("./src/analyzer");

async function main () {
  const allVueFiles = await readAllVueFiles(PROJ_DIR)
  const allCompsWithImports = allVueFiles.map(({filePath,fileStr}) => ({
    component:  pathFromProjDir(filePath),
    imports: extractFileImports(fileStr,filePath)
      .map(restoreIndexFileInPath)
      .map(restoreVueExtensionInPath)
      .filter(nonVueFilesFilter)
      .map(pathFromProjDir)
  }));


  const ENTRY_VIRTUAL_NODE = '---ENTRY-VIRTUAL-NODE---'
  const usageGraph = new DirectedGraph()

  for (const {component} of allCompsWithImports) {
    usageGraph.addNode(component)
  }
  usageGraph.addNode(ENTRY_VIRTUAL_NODE)
  for (const {component, imports} of allCompsWithImports) {
    if (!usageGraph.hasNode(component)) continue
    for (const importedComp of imports) {
      if (!usageGraph.hasNode(importedComp)) continue
      if (usageGraph.hasEdge(importedComp,component)) continue
      usageGraph.addEdge(importedComp,component)
    }
    if (isComponentEntry(component)) usageGraph.addEdge(component,ENTRY_VIRTUAL_NODE)
  }

  console.log('Number of nodes', usageGraph.order);
  console.log('Number of edges', usageGraph.size);

  // console.log(usageGraph.export())
  doReport(usageGraph.export())
  // console.log(allCompsWithImports)
  // doReport(allCompsWithImports)
}

main().then(() => console.log('exited with code 0'))

// depGraph.addNode('Ali')
// depGraph.addNode('Hassan')
// depGraph.addEdge('Ali', 'Hassan');
// depGraph.addEdge('Hassan', 'Ali');
// console.log('Number of nodes', depGraph.order);
// console.log('Number of edges', depGraph.size);
// depGraph.forEachNode(node => {
//   console.log(node);
// });