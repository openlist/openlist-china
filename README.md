An autoproxy pac for mainland China.

Install globally:

```
npm install -g openlist
openlist --help
```

Or use as a module:
```js
var openlist = require('openlist')
openlist.match('https://www.google.com/ncr') // true

openlist.clear() // unset all preset rules
openlist.match('https://twitter.com/') // false

openlist.add('||twitter.com')
openlist.match('https://twitter.com/') // true
```
