# vue-components-dep-check (W.I.P.)

## what it does 
it simply scans all .vue files in a project
and finds components that are not used (directly or indirectly) in any page or layout component 

## how to use
just run these commands 
    
```bash
# install dependencies
$ npm install

# run analyzer
$ node index PROJECT_ABSOLUTE_ROOT_PATH
``` 

reports will be saved as .json files in 'reports' folder

#### NOTE: this project is still under construction, this is just a minimal working version
