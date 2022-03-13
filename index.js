const glob = require('glob')
const path = require('path')
const {parseComponent} = require('vue-sfc-parser')
const fs = require('fs')
const fsPromises = fs.promises;

const {removeParentheses, removeQuoteMarks, datetimeStrForFilename} = require('string-util')

const PROJ_DIR = process.argv[2]

let PAGES_FOLDER = 'pages'
let LAYOUTS_FOLDER = 'layouts'
let excludedFolders = ['node_modules']

// old one : const importVueComponentRegex = /^(import)(.*)(from)(.*)(;*)?$/gm
const importVueComponentRegex = /(?<=import)(.*?)(?=from)from(.*?)(?=[;\r\n])/g
const lazyImportVueComponentRegex = /(?<=([\w.]+)\s*[=:]\s*(\(\s*\)\s*=>)?\s*)import(.*?)(?=[;,\r\n])/g
const requireVueComponentRegex = /(?<=([\w.]+)\s*[=:]\s*)require(.*?)(?=[;,\r\n])/g

const vueFiles = Object.create(null)

function removeCommentedStuff(codeStr) {
  return codeStr.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
}

function posixifyPath(p) {
  return p.split(path.sep).join(path.posix.sep)
}

function isComponentEntry(componentRelativePath) {
  return componentRelativePath.startsWith(PAGES_FOLDER) || componentRelativePath.startsWith(LAYOUTS_FOLDER)
}

function parsePath(p,currentFilePath) {
  if (p.startsWith('@/') || p.startsWith('~/')){
    return {
      type: 'ABSOLUTE_PATH',
      refined: posixifyPath(path.resolve(PROJ_DIR, p.slice(2)))
    }
  }else if (p.startsWith('./') || p.startsWith('../')) {
    return {
      type: 'RELATIVE_PATH',
      refined: posixifyPath(path.resolve(currentFilePath, '..' , p))
    }
  }else {
    return {
      type: 'PACKAGE',
      refined: null,
    }
  }
}

function extractScriptPart(sfcStr) {
  return parseComponent(sfcStr).script.content;
}

function extractImports(scriptStr,filePath) {
  let imports = []
  // normal imports
  const regex1Result = scriptStr.matchAll(importVueComponentRegex);
  // lazy imports
  const regex2Result = scriptStr.matchAll(lazyImportVueComponentRegex);
  // imports with require
  const regex3Result = scriptStr.matchAll(requireVueComponentRegex);

  Array.from(regex1Result).forEach(i => {
    const imported = i[1].trim()
    if (imported.trim().startsWith('{')) {
      // not default import
    }
    const importedFrom = removeQuoteMarks(i[2].trim())
    const refinedPath = parsePath(importedFrom,filePath).refined
    if (refinedPath) imports.push(refinedPath)
  });

  Array.from(regex2Result).forEach(i => {
    const imported = i[1].trim()
    const importedFrom = removeQuoteMarks((removeParentheses(i[3].trim())).trim())
    const refinedPath = parsePath(importedFrom,filePath).refined
    if (refinedPath) imports.push(refinedPath)
  });

  Array.from(regex3Result).forEach(i => {
    const imported = i[1].trim()
    const importedFrom = removeQuoteMarks((removeParentheses(i[2].trim())).trim())
    const refinedPath = parsePath(importedFrom,filePath).refined
    if (refinedPath) imports.push(refinedPath)
  });
  return imports
}

function pathFromProjDir(p) {
  return posixifyPath(path.relative(PROJ_DIR, p))
}

function isDir(p) {
  try {
    let stat = fs.lstatSync(p);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

function fileExists(p) {
  return fs.existsSync(p)
}

function restoreIndexFileInPath (p) {
  if (isDir(p)) {
    let indexFilePath = path.resolve(p,'index.vue')
    if (fileExists(indexFilePath)) {
      return posixifyPath(indexFilePath)
    }
  }
  return p
}

function restoreVueExtensionInPath (p) {
  if (!p.endsWith(".vue")){
    let pathWithExtension = p + '.vue'
    if (fileExists(pathWithExtension)) {
      return pathWithExtension
    }
  }
  return p
}

function nonVueFilesFilter (p) {
  return p.endsWith('.vue')
}

function findUnusedFiles(vueFilesObj) {
  let result = []
  for (let comp in vueFilesObj) {
    if (vueFilesObj[comp].usedIn.length === 0) result.push(comp)
  }
  return result
}

function findFilesWithNoWayToEntries(vueFilesObj) {
  let result = []
  for (let comp in vueFilesObj) {
    if (!vueFilesObj[comp].hasWayToEntry) result.push(comp)
  }
  return result
}

function report() {
  // const result = Object.create(null)
  // for (const [key, value] of Object.entries(vueFiles)) {
  //   result[key] = {hasWayToEntry: value.hasWayToEntry}
  // }
  // const unusedFiles = findUnusedFiles(vueFiles)
  const filesWithNoWayToEntries = findFilesWithNoWayToEntries(vueFiles)
  const result = filesWithNoWayToEntries
  // const result = vueFiles
  if (!fs.existsSync("reports/")) fs.mkdirSync("reports/")
  fs.writeFileSync("reports/" + datetimeStrForFilename(new Date()) + ".json", JSON.stringify(result));
}

function calcUsedIn() {
  const comps = [...Object.keys(vueFiles)]
  for (let used of comps) {
    vueFiles[used].usedIn = []
    for (let usedInCandidate of comps) {
      if (vueFiles[usedInCandidate].imports.includes(used))
        vueFiles[used].usedIn.push(usedInCandidate)
    }
  }
}

function hasWayToEntry(comp) {
  const compData = vueFiles[comp]
  if (compData.isEntry) return true
  for (const usedInComp of compData.usedIn) {
    if (hasWayToEntry(usedInComp)) return true
  }
  return false
}

function calcHasWayToEntries() {
  [...Object.keys(vueFiles)].forEach(comp => {
    vueFiles[comp].hasWayToEntry = hasWayToEntry(comp)
  })
}

function excludedFoldersFilter(p) {
  for (const excludedFolder of excludedFolders) {
    if (pathFromProjDir(p).startsWith(excludedFolder)) return false
  }
  return true
}

glob(path.join(PROJ_DIR, "/**/*.vue"), {}, function (er, files) {
  let promises = []
  // const additionalTestFiles = [
    // 'layouts/chat.vue',
  // ].map(i => path.join(PROJ_DIR,i))
  // files.slice(0,100).concat(additionalTestFiles).forEach(f => {
  const probedFiles = files.filter(excludedFoldersFilter)
  probedFiles.forEach(f => {
    // console.log(pathFromProjDir(f))
    const pms = fsPromises.readFile(f).then(data => {
      const scriptPart = removeCommentedStuff(extractScriptPart(data.toString()))
      let imports = extractImports(scriptPart,f)
        .map(restoreIndexFileInPath)
        .map(restoreVueExtensionInPath)
        .filter(nonVueFilesFilter)
        .map(pathFromProjDir);
      vueFiles[pathFromProjDir(f)] = {
        imports,
        isEntry: isComponentEntry(pathFromProjDir(f))
      }
    });
    promises.push(pms)
  })
  Promise.allSettled(promises).then( () => {
    calcUsedIn()
    calcHasWayToEntries()
    report()
    console.log('Analyze Accomplished, total files probed: ', probedFiles.length)
  })
})
