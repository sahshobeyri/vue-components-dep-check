const glob = require('glob')
const path = require('path')
const {parseComponent} = require('vue-sfc-parser')
const fs = require('fs')
const fsPromises = fs.promises;

const PROJ_DIR = "D:/Projects/Basalam/basalam-nuxt"
const importVueComponentRegex = /(import|require)(.*)(from)(.*)/gm

const vueFiles = []

glob(path.join(PROJ_DIR, "/**/*.vue"), {}, function (er, files) {
  let promises = []
  files.slice(0, 4).forEach(f => {
    console.log(path.relative(PROJ_DIR, f))
    const pms = fsPromises.readFile(f).then(data => {
      const scriptPart = parseComponent(data.toString()).script.content;
      const regexResult = scriptPart.matchAll(importVueComponentRegex);
      let imports = []
      Array.from(regexResult).forEach(i => {
        imports.push(i[4])
      });
      vueFiles.push({importer: f, imports})
    });
    promises.push(pms)
  })
  Promise.allSettled(promises).then(() => console.log(vueFiles))
  console.log('total count: ', files.length)
})
