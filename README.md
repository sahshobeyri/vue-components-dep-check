# vue-components-dep-check

## what it does 
it simply scans all .vue files in a project and finds components that are not used (directly or indirectly) in any page or layout components.

## how to use
set configs in src/config.js and run these commands:

```bash
# install dependencies
$ npm install

# run analyzer
$ node index
```
example :

```
$ node index D:/Projects/my-nuxt-project
``` 

reports will be saved in 'reports' folder.

> NOTE: this project is still in its very first stages of development
