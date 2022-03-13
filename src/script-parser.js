const {refineImportPath} = require("./path-util")
const {parseComponent} = require('vue-sfc-parser')
const {removeParentheses, removeQuoteMarks} = require('./string-util')

const es6ImportRegex = /(?<=import).*?(?=from\s*['"])from(.*?)(?=[;\r\n])/g
const lazyImportRegex = /import\s*\(([\S\s]*?)\)/g
const requireRegex = /require\s*\(([\S\s]*?)\)/g

function removeCommentedStuff(codeStr) {
  return codeStr.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
}

function extractScriptPart(sfcStr) {
    return parseComponent(sfcStr).script?.content || ''
}

function extractScriptImports(scriptStr,importerFilePath) {
  let imports = []
  const regex1Result = Array.from(scriptStr.matchAll(es6ImportRegex))
  const regex2Result = Array.from(scriptStr.matchAll(lazyImportRegex))
  const regex3Result = Array.from(scriptStr.matchAll(requireRegex))
  const allResults = [...regex1Result,...regex2Result,...regex3Result]

  allResults.forEach(i => {
    if (i[1].trim().startsWith('`')) return
    const importedFrom = removeQuoteMarks(i[1].trim())
    const refinedPath = refineImportPath(importedFrom,importerFilePath).refined
    if (refinedPath) imports.push(refinedPath)
  });

  return imports
}

function extractFileImports(importerFileStr,importerFilePath) {
  const scriptPart = extractScriptPart(importerFileStr)
  const removedComments = removeCommentedStuff(scriptPart)
  return extractScriptImports(removedComments,importerFilePath)
}

module.exports = {
  extractFileImports
}