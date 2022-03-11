const glob = require('glob')
const path = require('path')
const {parseComponent} = require('vue-sfc-parser')
const fs = require('fs')
const fsPromises = fs.promises;

// const PROJ_DIR = "D:/Projects/Basalam/basalam-nuxt"
const PROJ_DIR = "G:/REAL DRIVE D/Projects/Basalaam/_DoorKari/BasalamNuxtNew/basalam-nuxt"
const importVueComponentRegex = /^(import)(.*)(from)(.*)(;*)?$/gm

const vueFiles = {}

function removeQuoteMarks(str) {
  const first = str[0]
  const last = str[str.length - 1]
  if ((first === "'" && last === "'") || (first === '"' && last === '"')) return str.slice(1,-1)
  throw Error('bad string')
}

function posixifyPath(p) {
  return p.split(path.sep).join(path.posix.sep)
}

function parsePath(p,currentFilePath) {
  const trimmed = p.trim()
  const removedQuote = removeQuoteMarks(trimmed)

  if (removedQuote.startsWith('@/') || removedQuote.startsWith('~/')){
    return {
      type: 'ABSOLUTE_PATH',
      refined: posixifyPath(path.resolve(PROJ_DIR, removedQuote.slice(2)))
    }
  }else if (removedQuote.startsWith('./')) {
    return {
      type: 'RELATIVE_PATH',
      refined: posixifyPath(path.resolve(currentFilePath, '..' , removedQuote))
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
  const regexResult = scriptStr.matchAll(importVueComponentRegex);
  let imports = []
  Array.from(regexResult).forEach(i => {
    const imported = i[2]
    if (imported.trim().startsWith('{')) {
      // not default import
    }
    const importedFrom = i[4]
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

function filterOutNonVueFiles (p) {
  return p.endsWith('.vue')
}

function datetimeStrForFilename(dateObj) {
  const now = new Date()
  const dateData = [now.getFullYear(),now.getMonth() + 1,now.getDate()]
  const timeData = [now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds()]
  const dateStr = dateData.join('-')
  const timeStr = timeData.join('-')
  return `${dateStr}(${timeStr})`
}

function report() {
  // console.log(vueFiles)
  if (!fs.existsSync("reports/")) fs.mkdirSync("reports/")
  fs.writeFileSync("reports/" + datetimeStrForFilename(new Date()) + ".json", JSON.stringify(vueFiles));
}

glob(path.join(PROJ_DIR, "/**/*.vue"), {}, function (er, files) {
  let promises = []
  // const additionalTestFiles = [
    // 'layouts/chat.vue',
  // ].map(i => path.join(PROJ_DIR,i))
  // files.slice(0,100).concat(additionalTestFiles).forEach(f => {
  files.forEach(f => {
    // console.log(pathFromProjDir(f))
    const pms = fsPromises.readFile(f).then(data => {
      const scriptPart = extractScriptPart(data.toString())
      let imports = extractImports(scriptPart,f)
        .map(restoreIndexFileInPath)
        .map(restoreVueExtensionInPath)
        .filter(filterOutNonVueFiles)
        .map(pathFromProjDir);
      vueFiles[pathFromProjDir(f)] = {imports}
    });
    promises.push(pms)
  })
  Promise.allSettled(promises).then( () => {
    const comps = [...Object.keys(vueFiles)]
    for (let used of comps) {
      vueFiles[used].usedIn = []
      for (let usedInCandidate of comps) {
        if (vueFiles[usedInCandidate].imports.includes(used))
          vueFiles[used].usedIn.push(usedInCandidate)
      }
    }
    report()
    console.log('Analyze Accomplished, total files revised: ', files.length)
  })
})
