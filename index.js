const glob = require('glob')
const path = require('path')
const { parseComponent } = require('vue-sfc-parser')
const vueFiles = []
const fs = require('fs')

const PROJ_DIR = "D:/Projects/Basalam/basalam-nuxt"
const importVueComponentRegex = /(import|require).*/gm

glob(path.join(PROJ_DIR,"/**/*.vue"), {}, function (er, files) {
    files.slice(0,1).forEach(f => {
        console.log(path.relative(PROJ_DIR,f))
        fs.readFile(f, function(err, data) {
            const scriptPart = parseComponent(data.toString()).script.content;
            const regexResult = scriptPart.matchAll(importVueComponentRegex);
            Array.from(regexResult).forEach(i => console.log(i[0]));
        });
    })
    console.log('total count: ',files.length)
})
