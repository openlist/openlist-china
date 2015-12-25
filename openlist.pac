/* jshint asi:true, node:true, esnext:true */
'use strict'

// === @start xiaody/adblock-minus ===
var Filter = {
  fromText: function (text) {
    text = text.trim()
    if (!text || text[0] === '!') return
    return RegExpFilter.fromText(text.replace(/\s/g, ''))
  },
  isWhitelistFilter: function (filter) {
    return filter instanceof WhitelistFilter
  }
}

function RegExpFilter (regexpSrc) {
  this.regexpSrc = regexpSrc
  this.regexp = null // lazy generate from @regexpSrc
}
function F () {}
RegExpFilter.prototype = F.prototype = {
  constructor: RegExpFilter,
  genRegexp: function () {
    var regexpSrc = this.regexpSrc
    if (!regexpSrc) return
    if (regexpSrc.length > 2 && regexpSrc[regexpSrc.length - 1] === '/' && regexpSrc[0] === '/') {
      // The filter is a regular expression - convert it immediately.
      this.regexp = new RegExp(regexpSrc.substr(1, regexpSrc.length - 2))
    } else {
      this.regexp = new RegExp(RegExpFilter.convert(regexpSrc))
    }
    this.regexpSrc = void 0
  },
  matches: function (location) {
    if (!this.regexp) this.genRegexp()
    return this.regexp.test(location)
  }
}
RegExpFilter.convert = function (abpexp) {
  return abpexp
    .replace(/\*+/g, '*').replace(/^\*|\*$/g, '').replace(/\^\|$/, '^')
    .replace(/\W/g, '\\$&')
    .replace(/\\\*/g, '.*')
    .replace(/\\\^/g, '(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x7F]|$)')
    .replace(/^\\\|\\\|/, '^[\\w\\-]+:\\/+(?!\\/)(?:[^.\\/]+\\.)?')
    .replace(/^\\\|/, '^').replace(/\\\|$/, '$')
}
RegExpFilter.fromText = function (text) {
  var blocking = true
  if (text.indexOf('@@') === 0) {
    blocking = false
    text = text.substr(2)
  }
  var Constructor = blocking ? BlockingFilter : WhitelistFilter
  return new Constructor(text)
}

function BlockingFilter (regexpSrc) { RegExpFilter.call(this, regexpSrc) }
BlockingFilter.prototype = new F()
BlockingFilter.prototype.constructor = BlockingFilter

function WhitelistFilter (regexpSrc) { RegExpFilter.call(this, regexpSrc) }
WhitelistFilter.prototype = new F()
WhitelistFilter.prototype.constructor = WhitelistFilter

var isWhitelistFilter = Filter.isWhitelistFilter

var _Matcher = {
  filterByKeyword: new Map(),

  add: function (filter) {
    var keyword = this.findKeyword(filter)
    var map = this.filterByKeyword
    if (map.has(keyword)) {
      // Make sure the white-lists are always at first
      if (isWhitelistFilter(filter)) {
        map.get(keyword).unshift(filter)
      } else {
        map.get(keyword).push(filter)
      }
    } else {
      map.set(keyword, [filter])
    }
  },

  findKeyword: function (filter) {
    var text = filter.regexpSrc
    var defaultResult = ''

    if (text.length > 2 && text[text.length - 1] === '/' && text[0] === '/') {
      return defaultResult
    }

    var candidates = text.toLowerCase().match(/[^a-z0-9%*][a-z0-9%]{3,}(?=[^a-z0-9%*])/g)
    if (!candidates) {
      return defaultResult
    }

    var map = this.filterByKeyword
    var result = defaultResult
    var resultCount = 0xFFFFFF
    var resultLength = 0

    candidates.forEach(function (candidate) {
      candidate = candidate.substr(1)
      var count = 0
      if (map.has(candidate)) {
        count = map.get(candidate).length
      }
      if (count < resultCount || count === resultCount && candidate.length > resultLength) {
        result = candidate
        resultCount = count
        resultLength = candidate.length
      }
    })

    return result
  },

  checkEntryMatch: function (word, location) {
    var array = this.filterByKeyword.get(word)
    for (var i = 0, l = array.length, filter; i < l; i++) {
      filter = array[i]
      if (filter.matches(location)) {
        return filter
      }
    }
    return null
  },

  matchesAny: function (location) {
    var keywords = location.toLowerCase().match(/[a-z0-9%]{3,}/g) || []
    keywords.unshift('')

    var map = this.filterByKeyword
    var afterall = false
    for (var substr, result, i = keywords.length; i--;) {
      substr = keywords[i]
      if (map.has(substr)) {
        result = this.checkEntryMatch(substr, location)
        if (!result) continue
        if (isWhitelistFilter(result)) return false
        else afterall = true
      }
    }
    return afterall
  }
}

var Matcher = {
  matchesAny: _Matcher.matchesAny.bind(_Matcher),
  addFilter: function (text) {
    var filterObj = Filter.fromText(text)
    if (filterObj) _Matcher.add(filterObj)
  }
}
// === @end xiaody/adblock-minus ===

;[
  "! === Google ===",
  "||google.com",
  "||google.com.hk",
  "||gstatic.com",
  "||googleapis.com",
  "||googleusercontent.com",
  "||googlevideo.com",
  "||googlecode.com",
  "||chrome.com",
  "||appspot.com",
  "||blogspot.com",
  "||youtube.com",
  "||ytimg.com",
  "||youtu.be",
  "||blogger.com",
  "||googlezip.net",
  "||goo.gl",
  "! === Social ===",
  "||twitter.com",
  "||twimg.com",
  "||t.co",
  "||facebook.com",
  "||xx.fbcdn.net",
  "||tumblr.com",
  "||vimeo.com",
  "||soundcloud.com",
  "||instagram.com",
  "||flickr.com",
  "||imgur.com",
  "||pixiv.net",
  "||telegram.org",
  "||web.telegram.org",
  "||wordpress.com",
  "||fc2.com",
  "! === Developer ===",
  "||gist.github.com",
  "||devdocs.io",
  "||dropbox.com",
  "||speakerdeck.com",
  "||slideshare.net",
  "||slidesharecdn.com",
  "||wikipedia.org",
  "||duckduckgo.com",
  "||openvpn.net",
  "||tunnelbear.com",
  "||bit.ly",
  "! === News ===",
  "||nytimes.com",
  "||nyt.com",
  "||feedly.com",
  "||chinagfw.org",
  "||fanqianghou.com",
  "||sankakucomplex.com",
  "! === CDN ===",
  "||sstatic.net",
  "||global.ssl.fastly.net",
  "||akamai.net",
  "||gravatar.com",
  "||cloudfront.net",
  "||edgefonts.net",
  "||w.org^",
  "||wp.com^",
  "||cafe24.com",
  "! === Others ===",
  "/ooxx^",
  "! vim: set filetype=adblockfilter: (mojako/adblock-filter.vim)",
  ""
].forEach(Matcher.addFilter)

function FindProxyForURL (url) {
  if (Matcher.matchesAny(url)) {
    return 'SOCKS5 127.0.0.1:1080; PROXY 192.168.1.1:8123; DIRECT;'
  } else {
    return 'DIRECT'
  }
}

if (typeof module === 'object') {
  module.exports = FindProxyForURL
}

// vim: set filetype=javascript:
