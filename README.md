[![version](https://img.shields.io/npm/v/openlist.svg?style=flat-square)](https://www.npmjs.com/package/openlist)
[![license](https://img.shields.io/npm/l/openlist.svg?style=flat-square)](https://www.npmjs.com/package/openlist)
[![downloads](https://img.shields.io/npm/dt/openlist.svg?style=flat-square)](https://www.npmjs.com/package/openlist)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)](https://github.com/openlist/openlist-china)

An autoproxy pac builder for mainland China.

**Install globally:**

```
npm install -g openlist
openlist --help
# Usage: openlist [options]
#
# Options:
#
#   -h, --help           output usage information
#   -V, --version        output the version number
#   -y, --match <proxy>  proxy for matched url
#   -n, --miss <proxy>   proxy for missed url
#   -r, --rule <path>    source file path
#   -o, --output <path>  output target file path
#
# Default options:
#   openlist -r rules/openlist.txt \
#            -o openlist.pac \
#            -y 'SOCKS5 127.0.0.1:1080; PROXY 192.168.1.1:8123; DIRECT;' \
#            -n 'DIRECT'
```

**Common use cases:**

use the built-in list which covers most common websites:
```
openlist # will generate a openlist.pac file
```

or use the [gfwlist] which is more extensive:
```
openlist -r <(curl https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt | base64 -d) # convert gfwlist to autoproxy pac file
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
