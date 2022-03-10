const glob = require('glob')
const path = require('path')
const PROJ_DIR = "D:/Projects/Basalam/basalam-nuxt"

glob(path.join(PROJ_DIR,"/**/*.vue"), {}, function (er, files) {
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.
    let count = 0
    files.forEach(f => {
        console.log(path.relative(PROJ_DIR,f))
        count ++
    })
    console.log('total count: ',count)
})
