const {PAGES_FOLDER, LAYOUTS_FOLDER} = require('./config')

function isComponentEntry(componentRelativePath) {
  return componentRelativePath.startsWith(PAGES_FOLDER) || componentRelativePath.startsWith(LAYOUTS_FOLDER)
}

export function findUnusedFiles(vueFilesObj) {
  // let result = []
  // for (let comp in vueFilesObj) {
  //   if (vueFilesObj[comp].usedIn.length === 0) result.push(comp)
  // }
  // return result
}

export function findFilesWithNoWayToEntries(vueFilesObj) {
  // let result = []
  // for (let comp in vueFilesObj) {
  //   if (!vueFilesObj[comp].hasWayToEntry) result.push(comp)
  // }
  // return result
}

export function calcUsedIn() {
  // const comps = [...Object.keys(vueFiles)]
  // for (let used of comps) {
  //   vueFiles[used].usedIn = []
  //   for (let usedInCandidate of comps) {
  //     if (vueFiles[usedInCandidate].imports.includes(used))
  //       vueFiles[used].usedIn.push(usedInCandidate)
  //   }
  // }
}

export function hasWayToEntry(comp) {
  // const compData = vueFiles[comp]
  // if (compData.isEntry) return true
  // for (const usedInComp of compData.usedIn) {
  //   if (hasWayToEntry(usedInComp)) return true
  // }
  // return false
}

export function calcHasWayToEntries() {
  // [...Object.keys(vueFiles)].forEach(comp => {
  //   vueFiles[comp].hasWayToEntry = hasWayToEntry(comp)
  // })
}