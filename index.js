const glob = require('glob')
const path = require('path')
const {parseComponent} = require('vue-sfc-parser')
const fs = require('fs')
const fsPromises = fs.promises;

const PROJ_DIR = "D:/Projects/Basalam/basalam-nuxt"
const importVueComponentRegex = /(import)(.*)(from)(.*)(;*)?/gm

const vueFiles = []

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
      refined: posixifyPath(path.resolve(PROJ_DIR, removedQuote.slice(1)))
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

glob(path.join(PROJ_DIR, "/**/*.vue"), {}, function (er, files) {
  let promises = []
  files.slice(0, 4).forEach(f => {
    console.log(path.relative(PROJ_DIR, f))
    const pms = fsPromises.readFile(f).then(data => {
      const scriptPart = parseComponent(data.toString()).script.content;
      const regexResult = scriptPart.matchAll(importVueComponentRegex);
      let imports = []
      Array.from(regexResult).forEach(i => {
        const imported = i[2]
        if (imported.trim().startsWith('{')) {
          // not default import
        }else {
          const importedFrom = i[4]
          const refinedPath = parsePath(importedFrom,f).refined
          if (refinedPath) imports.push(refinedPath)
        }
      });
      vueFiles.push({importer: f, imports})
    });
    promises.push(pms)
  })
  Promise.allSettled(promises).then(() => console.log(vueFiles))
  console.log('total count: ', files.length)
})
