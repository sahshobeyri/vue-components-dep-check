const path = require('path')
const { PROJ_DIR, EXCLUDED_FOLDERS } = require('./config')
const { isDir,fileExists } = require('./fs-util')

function posixifyPath(p) {
  return p.split(path.sep).join(path.posix.sep)
}

function refineImportPath(p,importerFilePath) {
  if (p.startsWith('@/') || p.startsWith('~/')){
    return {
      type: 'ABSOLUTE_PATH',
      refined: posixifyPath(path.resolve(PROJ_DIR, p.slice(2)))
    }
  }else if (p.startsWith('./') || p.startsWith('../')) {
    return {
      type: 'RELATIVE_PATH',
      refined: posixifyPath(path.resolve(importerFilePath, '..' , p))
    }
  }else {
    return {
      type: 'PACKAGE',
      refined: null,
    }
  }
}

function pathFromProjDir(p) {
  return posixifyPath(path.relative(PROJ_DIR, p))
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

function excludedFoldersFilter(p) {
  for (const excludedFolder of EXCLUDED_FOLDERS) {
    if (pathFromProjDir(p).startsWith(excludedFolder)) return false
  }
  return true
}

module.exports = {
  excludedFoldersFilter,
  nonVueFilesFilter,
  refineImportPath,
  restoreVueExtensionInPath,
  restoreIndexFileInPath,
  pathFromProjDir,
  posixifyPath,
}