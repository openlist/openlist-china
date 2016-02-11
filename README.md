[![version](https://img.shields.io/npm/v/openlist.svg?style=flat-square)](https://www.npmjs.com/package/openlist)
[![license](https://img.shields.io/npm/l/openlist.svg?style=flat-square)](https://www.npmjs.com/package/openlist)
[![downloads](https://img.shields.io/npm/dt/express.svg?style=flat-square)](https://www.npmjs.com/package/openlist)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)](https://github.com/openlist/openlist-china)

An autoproxy pac builder for mainland China.

**Install globally:**

```
npm install -g openlist
openlist --help
```

**Common use cases:**

use the built-in list which covers most common websites:
```
openlist # will generate a openlist.pac file
```

or use the [gfwlist] which is more extensive:
```
base64 -d <( curl https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt ) > /tmp/gfwlist && openlist -r /tmp/gfwlist
```

**Or use as a nodejs module:**
```js
var openlist = require('openlist') // built-in list is installed by default
openlist.match('https://www.google.com/ncr') // true

openlist.clear() // unset all preset rules
openlist.match('https://twitter.com/') // false

openlist.add('||twitter.com')
openlist.match('https://twitter.com/') // true
```

[gfwlist]: https://github.com/gfwlist/gfwlist
