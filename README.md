[![npm version](https://badge.fury.io/js/openlist.svg)](http://badge.fury.io/js/openlist)

An autoproxy pac for mainland China.

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
base64 -d <( curl https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt ) > /tmp/gfwlist && openlist -r /tmp/gfwlist && scp openlist.pac 192.168.1.1:/www
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