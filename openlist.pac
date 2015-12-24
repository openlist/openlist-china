'use strict';

// === @start xiaody/adblock-minus ===
var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Filter = {
  fromText: function fromText(text) {
    text = text.trim();
    if (!text || text[0] === '!') return;
    return RegExpFilter.fromText(text.replace(/\s/g, ''));
  },
  isRegExpFilter: function isRegExpFilter(filter) {
    return filter instanceof RegExpFilter;
  },
  isWhitelistFilter: function isWhitelistFilter(filter) {
    return filter instanceof WhitelistFilter;
  },
  isBlockingFilter: function isBlockingFilter(filter) {
    return filter instanceof BlockingFilter;
  }
};

var RegExpFilter = (function () {

  function RegExpFilter(regexpSrc) {

    _get(Object.getPrototypeOf(RegExpFilter.prototype), 'constructor', this).call(this);
    this.regexpSrc = regexpSrc;
    this.regexp = null; // lazy generate from @regexpSrc
  }

  _createClass(RegExpFilter, [{
    key: 'genRegexp',
    value: function genRegexp() {
      var regexpSrc = this.regexpSrc;
      if (!regexpSrc) return;
      if (regexpSrc.length > 2 && regexpSrc[regexpSrc.length - 1] === '/' && regexpSrc[0] === '/') {
        // The filter is a regular expression - convert it immediately.
        this.regexp = new RegExp(regexpSrc.substr(1, regexpSrc.length - 2));
      } else {
        this.regexp = new RegExp(RegExpFilter.convert(regexpSrc));
      }
      this.regexpSrc = void 0;
    }
  }, {
    key: 'matches',
    value: function matches(location) {
      if (!this.regexp) this.genRegexp();
      return this.regexp.test(location);
    }

    /* convert abpexp to regexp */
  }], [{
    key: 'convert',
    value: function convert(abpexp) {
      return abpexp.replace(/\*+/g, '*').replace(/^\*|\*$/g, '').replace(/\^\|$/, '^').replace(/\W/g, '\\$&').replace(/\\\*/g, '.*').replace(/\\\^/g, '(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x7F]|$)').replace(/^\\\|\\\|/, '^[\\w\\-]+:\\/+(?!\\/)(?:[^.\\/]+\\.)?').replace(/^\\\|/, '^').replace(/\\\|$/, '$');
    }
  }, {
    key: 'fromText',
    value: function fromText(text) {
      var blocking = true;

      if (text.indexOf('@@') === 0) {
        blocking = false;
        text = text.substr(2);
      }

      var Constructor = blocking ? BlockingFilter : WhitelistFilter;
      return new Constructor(text);
    }
  }]);

  return RegExpFilter;
})();


var BlockingFilter = (function (_RegExpFilter) {
  _inherits(BlockingFilter, _RegExpFilter);

  function BlockingFilter() {

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(BlockingFilter.prototype), 'constructor', this).apply(this, args);
  }

  return BlockingFilter;
})(RegExpFilter);

var WhitelistFilter = (function (_RegExpFilter2) {
  _inherits(WhitelistFilter, _RegExpFilter2);

  function WhitelistFilter() {

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _get(Object.getPrototypeOf(WhitelistFilter.prototype), 'constructor', this).apply(this, args);
  }

  return WhitelistFilter;
})(RegExpFilter);

var HIDE_DISC = '{display:none!important}';
var isWhitelistFilter = Filter.isWhitelistFilter;

var _Matcher = {
  filterByKeyword: new Map(),

  add: function (filter) {
    var keyword = this.findKeyword(filter);
    var map = this.filterByKeyword;
    if (map.has(keyword)) {
      // Make sure the white-lists are always at first
      if (isWhitelistFilter(filter)) {
        map.get(keyword).unshift(filter);
      } else {
        map.get(keyword).push(filter);
      }
    } else {
      map.set(keyword, [filter]);
    }
  },

  findKeyword: function (filter) {
    var text = filter.regexpSrc;
    var defaultResult = '';

    if (text.length > 2 && text[text.length - 1] === '/' && text[0] === '/') {
      return defaultResult;
    }

    var candidates = text.toLowerCase().match(/[^a-z0-9%*][a-z0-9%]{3,}(?=[^a-z0-9%*])/g);
    if (!candidates) {
      return defaultResult;
    }

    var map = this.filterByKeyword;
    var result = defaultResult;
    var resultCount = 0xFFFFFF;
    var resultLength = 0;

    candidates.forEach(function (candidate) {
      candidate = candidate.substr(1);
      var count = 0;
      if (map.has(candidate)) {
        count = map.get(candidate).length;
      }
      if (count < resultCount || count === resultCount && candidate.length > resultLength) {
        result = candidate;
        resultCount = count;
        resultLength = candidate.length;
      }
    });

    return result;
  },

  checkEntryMatch: function (word, location) {
    var array = this.filterByKeyword.get(word);
    for (var i = 0, l = array.length, filter = undefined; i < l; i++) {
      filter = array[i];
      if (filter.matches(location)) {
        return filter;
      }
    }
    return null;
  },

  matchesAny: function (location) {
    var keywords = location.toLowerCase().match(/[a-z0-9%]{3,}/g) || [];
    keywords.unshift('');

    var map = this.filterByKeyword;
    var afterall = false;
    for (var substr = undefined, result = undefined, i = keywords.length; i--;) {
      substr = keywords[i];
      if (map.has(substr)) {
        result = this.checkEntryMatch(substr, location);
        if (!result) continue;
        if (isWhitelistFilter(result)) return false;else afterall = true;
      }
    }
    return afterall;
  }

};
var Matcher = {
  matchesAny: _Matcher.matchesAny.bind(_Matcher),
  addFilter: function (text) {
    var filterObj = Filter.fromText(text);
    filterObj && _Matcher.add(filterObj);
  }
};
// === @end xiaody/adblock-minus ===

["! === Google ===","||google.com","||google.com.hk","||gstatic.com","||googleapis.com","||googleusercontent.com","||googlevideo.com","||googlecode.com","||chrome.com","||appspot.com","||blogspot.com","||youtube.com","||ytimg.com","||youtu.be","||blogger.com","||googlezip.net","||goo.gl","! === Social ===","||twitter.com","||twimg.com","||t.co","||facebook.com","||xx.fbcdn.net","||tumblr.com","||vimeo.com","||soundcloud.com","||instagram.com","||flickr.com","||imgur.com","||pixiv.net","||telegram.org","||web.telegram.org","||wordpress.com","||fc2.com","! === Developer ===","||gist.com","||devdocs.io","||dropbox.com","||speakerdeck.com","||slideshare.net","||slidesharecdn.com","||wikipedia.org","||duckduckgo.com","||openvpn.net","||tunnelbear.com","||bit.ly","! === News ===","||nytimes.com","||nyt.com","||feedly.com","||chinagfw.org","||fanqianghou.com","||sankakucomplex.com","! === CDN ===","||sstatic.com","||global.ssl.fastly.net","||akamai.net","||gravatar.com","||cloudfront.net","||w.org^","||wp.com^","||cafe24.com","! === Others ===","/ooxx^","||jp","||tw","! vim: set filetype=adblockfilter: (mojako/adblock-filter.vim)",""].forEach(Matcher.addFilter);

function FindProxyForURL (url) {
  if (Matcher.matchesAny(url)) {
    return "SOCKS5 127.0.0.1:1080; PROXY 192.168.1.1:8123; DIRECT;";
  } else {
    return "DIRECT";
  }
}

// vim: set filetype=javascript:
