var fs       = require('fs')
  , accounts = JSON.parse(fs.readFileSync('github.json', 'utf8'))
;

console.log(accounts);