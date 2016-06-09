/*!
 * @homepage https://github.com/openlist/openlist-china
 * @license GPL-3.0
 */
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

var Matcher = {
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

var Openlist = {
  match: Matcher.matchesAny.bind(Matcher),
  add: function (text) {
    var filterObj = Filter.fromText(text)
    if (filterObj) Matcher.add(filterObj)
    return this
  },
  clear: function () {
    Matcher.filterByKeyword.clear()
    return this
  }
}
// === @end xiaody/adblock-minus ===

;[
  "! === Google ===",
  "||google.com",
  ".google.com",
  "||gstatic.com",
  ".googleapis.com",
  "||googleusercontent.com",
  ".googleusercontent.com",
  "||ggpht.com",
  "||googlevideo.com",
  "||googlecode.com",
  "||googlesource.com",
  "||gmail.com",
  "||chrome.com",
  "||chromium.org",
  "||chromestatus.com",
  "||android.com",
  "||youtube.com",
  "||ytimg.com",
  "||youtu.be",
  "||youtube-nocookie.com",
  "||appspot.com",
  "||blogspot.",
  "||bp.blogspot.com",
  "||blogger.com",
  "||blogblog.com",
  "||googleblog.com",
  "||withgoogle.com",
  "||feedburner.com",
  "||googlezip.net",
  "||goo.gl",
  "||g.co",
  "! === Social ===",
  "||twitter.com",
  "||twimg.com",
  "||t.co",
  "||facebook.com",
  "||facebook.net",
  "||xx.fbcdn.net",
  "||fb.me",
  "||tumblr.com",
  "||media.tumblr.com",
  "||vimeo.com",
  "||medium.com",
  "||soundcloud.com",
  "||sndcdn.com",
  "||pandora.com",
  "||spotify.com",
  "||instagram.com",
  "||cdninstagram.com",
  "||flickr.com",
  "||myspace.com",
  "||myspacecdn.com",
  "||plurk.com",
  "||deviantart.com",
  "||deviantart.net",
  "||imgur.com",
  "||pixiv.net",
  "||donmai.us",
  "||iqdb.org",
  "||snapchat.com",
  "||telegram.org",
  "||web.telegram.org",
  "||tchannels.me",
  "||line.me",
  "||viber.com",
  "||cdn.viber.com",
  "||wordpress.com",
  "||video.yahoo.com",
  "||fc2.com",
  ".fc2.com",
  "||nicovideo.jp",
  "||trollvids.com",
  "||blog.jp",
  ".blogimg.jp",
  "||dmm.co.jp",
  "||livedoor.jp",
  ".livedoor.jp",
  "||blogsys.jp",
  "||doorblog.jp",
  "||jiandan.net",
  "||gamer.com.tw",
  "||bahamut.com.tw",
  "||disqus.com",
  "||disquscdn.com",
  "||panoramio.com",
  "||snag.gy",
  "||twicsy.com",
  "||tweettunnel.com",
  "||break.com",
  "! === Developer ===",
  "||github.com",
  "||githubusercontent.com",
  "||devdocs.io",
  "||npmjs.com",
  "||dropbox.com",
  "||dropboxstatic.com",
  "||dropboxusercontent.com",
  "||speakerdeck.com",
  "||slideshare.net",
  "||slidesharecdn.com",
  "||wikipedia.org",
  "||m.wikipedia.org",
  "||duckduckgo.com",
  "||openvpn.net",
  "||getcloak.com",
  "||tunnelbear.com",
  "||box.com",
  "||sugarsync.com",
  "||bit.ly",
  "||j.mp",
  "||ift.tt",
  "||archive.org",
  "||peter.sh",
  "||squarespace.com",
  "! === News ===",
  "||wsj.com",
  "||wsj.net",
  "||nytimes.com",
  "||cn.nytimes.com",
  "||nyt.com",
  "||bbc.com",
  "||bbci.co.uk",
  "||cnn.com",
  "||economist.com",
  "||static-economist.com",
  "||reuters.com",
  "||mobile.reuters.com",
  "||chosun.com",
  "||feedly.com",
  "||inoreader.com",
  "||tt-rss.org",
  "||sankakucomplex.com",
  "||beijingspring.com",
  "||jandan.net",
  "||xys.org",
  "||e-hentai.org",
  "||ehgt.org",
  "||minkch.com",
  "||sumomo-ch.com",
  "||erobooks.net",
  "||erogazounosuke.com",
  "||eroterest.net",
  "||erogiga.com",
  "||free-douga-search.com",
  "||t66y.com",
  "||xvideos.com",
  "||hnntube.com",
  "||greatfire.org",
  "||chinagfw.org",
  "||fanqianghou.com",
  "||icij.org",
  "||storm.mg",
  "! === CDN ===",
  ".amazonaws.com",
  "||sstatic.net",
  ".ssl.fastly.net",
  "||akamai.net",
  "||akamaihd.net",
  "||gravatar.com",
  ".cloudfront.net",
  "||cloudflare.com",
  "||edgefonts.net",
  "||typekit.net",
  "||webtype.com",
  "||wistia.com",
  "||cloudup.com",
  "||cldup.com",
  "||w.org^",
  "||wp.com^",
  "||cafe24.com",
  "||qpic.ws",
  "||tinypic.com",
  "||imageab.com",
  "||imgchili.net",
  "||imgspice.com",
  "||imgtwist.com",
  "||uploadhouse.com",
  "||ipoock.com",
  "||imgaa.com",
  "||imgbb.net",
  "||imgwe.com",
  "||u2s.ir",
  "||nyaa.se",
  "||postimg.org",
  "||javynow.com",
  "||mailchimp.com",
  "||cdn.whatsapp.net",
  ".ucdn.com",
  "||xhamster.com",
  "||xhcdn.com",
  "||archive.li",
  "! === Others ===",
  "||shadowsocks.org",
  "||getlantern.org",
  "||helpzhuling.org",
  "||*.ninja^",
  "||*.xxx^",
  "||*.cc^",
  "! vim: set filetype=adblockfilter: (mojako/adblock-filter.vim)",
  ""
].forEach(Openlist.add)

function FindProxyForURL (url) {
  return Openlist.match(url) ? 'SOCKS5 127.0.0.1:1080; PROXY 192.168.1.1:8123; DIRECT;' : 'DIRECT'
}

if (typeof module === 'object') {
  module.exports = Openlist
}

// vim: set filetype=javascript:
