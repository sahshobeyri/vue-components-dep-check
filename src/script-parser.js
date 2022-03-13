const {refineImportPath} = require("./path-util")
const {parseComponent} = require('vue-sfc-parser')
const {removeParentheses, removeQuoteMarks} = require('./string-util')

const es6ImportRegex = /(?<=import)(.*?)(?=from)from(.*?)(?=[;\r\n])/g
const lazyImportRegex = /(?<=([\w.]+)\s*[=:]\s*(\(\s*\)\s*=>)?\s*)import(.*?)(?=[;,\r\n])/g
const requireRegex = /(?<=([\w.]+)\s*[=:]\s*)require(.*?)(?=[;,\r\n])/g

function removeCommentedStuff(codeStr) {
  return codeStr.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
}

function extractScriptPart(sfcStr) {
  return parseComponent(sfcStr).script.content;
}

function extractScriptImports(scriptStr,importerFilePath) {
  let imports = []
  const regex1Result = scriptStr.matchAll(es6ImportRegex);
  const regex2Result = scriptStr.matchAll(lazyImportRegex);
  const regex3Result = scriptStr.matchAll(requireRegex);

  Array.from(regex1Result).forEach(i => {
    const imported = i[1].trim()
    const importedFrom = removeQuoteMarks(i[2].trim())
    const refinedPath = refineImportPath(importedFrom,importerFilePath).refined
    if (refinedPath) imports.push(refinedPath)
  });

  Array.from(regex2Result).forEach(i => {
    const imported = i[1].trim()
    const importedFrom = removeQuoteMarks((removeParentheses(i[3].trim())).trim())
    const refinedPath = refineImportPath(importedFrom,importerFilePath).refined
    if (refinedPath) imports.push(refinedPath)
  });

  Array.from(regex3Result).forEach(i => {
    const imported = i[1].trim()
    const importedFrom = removeQuoteMarks((removeParentheses(i[2].trim())).trim())
    const refinedPath = refineImportPath(importedFrom,importerFilePath).refined
    if (refinedPath) imports.push(refinedPath)
  });
  return imports
}

export function extractFileImports(importerFileStr,importerFilePath) {
  const scriptPart = extractScriptPart(importerFileStr)
  const removedComments = removeCommentedStuff(scriptPart)
  return extractScriptImports(removedComments,importerFilePath)
}