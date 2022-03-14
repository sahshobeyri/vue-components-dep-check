const gexf = require("graphology-gexf");
const {allSimplePaths} = require("graphology-simple-path");
const {
  GLOBAL_COMPONENTS_VIRTUAL_NODE,
  ENTRY_VIRTUAL_NODE,
  PAGES_FOLDER,
  LAYOUTS_FOLDER
} = require('./config')
const {DirectedGraph} = require('graphology')

function isComponentEntry(componentRelativePath) {
  return componentRelativePath.startsWith(PAGES_FOLDER) || componentRelativePath.startsWith(LAYOUTS_FOLDER)
}

function createUsageGraph(allCompsWithImports,allGlobalComponents) {
  const usageGraph = new DirectedGraph()

  for (const {component} of allCompsWithImports) {
    usageGraph.addNode(component)
  }
  usageGraph.addNode(ENTRY_VIRTUAL_NODE)
  if (allGlobalComponents.length) usageGraph.addNode(GLOBAL_COMPONENTS_VIRTUAL_NODE)
  for (const {component, imports} of allCompsWithImports) {
    if (!usageGraph.hasNode(component)) continue
    for (const importedComp of imports) {
      if (!usageGraph.hasNode(importedComp)) continue
      if (usageGraph.hasEdge(importedComp, component)) continue
      usageGraph.addEdge(importedComp, component)
    }
    if (isComponentEntry(component)) usageGraph.addEdge(component, ENTRY_VIRTUAL_NODE)
    if (allGlobalComponents.includes(component)) usageGraph.addEdge(component, GLOBAL_COMPONENTS_VIRTUAL_NODE)
  }
  if (allGlobalComponents.length) usageGraph.addEdge(GLOBAL_COMPONENTS_VIRTUAL_NODE, ENTRY_VIRTUAL_NODE)

  return usageGraph
}

function findOrphans(graph) {
  return graph.filterNodes(nodeKey => {
    if (nodeKey === ENTRY_VIRTUAL_NODE) return false
    return allSimplePaths(graph, nodeKey, ENTRY_VIRTUAL_NODE).length === 0
  })
}

function convertGraphToGexf(graph) {
  return gexf.write(graph, {pretty: true});
}

function calcAllPathsToEntryNode(graph) {
  const results = []
  graph.forEachNode(nodeKey => {
    results.push({
      component: nodeKey,
      pathsToEntry: allSimplePaths(graph,nodeKey,ENTRY_VIRTUAL_NODE),
    })
  })
  return results
}


function findUnusedComponents(graph) {
  return graph.filterNodes(nodeKey => {
    if (nodeKey === ENTRY_VIRTUAL_NODE) return false
    return graph.outDegree(nodeKey) === 0
  })
}

function findZeroDepComponents(graph) {
  return graph.filterNodes(nodeKey => {
    if (nodeKey === ENTRY_VIRTUAL_NODE) return false
    return graph.InDegree(nodeKey) === 0
  })
}

module.exports = {
  createUsageGraph,
  findOrphans,
  findUnusedComponents,
  findZeroDepComponents,
  convertGraphToGexf,
  calcAllPathsToEntryNode,
}
