#!/usr/bin/env node
/*!
 * @homepage https://github.com/openlist/openlist-china
 * @license GPL-3.0
 */

/* jshint asi:true */
'use strict'

if (require.main === module) {
  var fs = require('fs')
  var path = require('path')
  var Mustache = require('mustache')
  var program = require('commander')

  var meta = require(path.join(__dirname, 'package.json'))
  var template = fs.readFileSync(path.join(__dirname, 'openlist.mustache'), 'utf8')

  program
    .version(meta.version)
    .option('-y, --match <proxy>', 'proxy for matched url')
    .option('-n, --miss <proxy>', 'proxy for missed url')
    .option('-r, --rule <path>', 'source file path')
    .option('-o, --output <path>', 'output target file path')
    .on('--help', function () {
      console.log('  Default options:')
      console.log('    openlist -r rules/openlist.txt \\')
      console.log('             -o openlist.pac \\')
      console.log("             -y 'SOCKS5 127.0.0.1:1080; PROXY 192.168.1.1:8123; DIRECT;' \\")
      console.log("             -n 'DIRECT'")
      console.log('')
    })
  program.parse(process.argv)

  var rulePath = program.rule || path.join(__dirname, 'rules/openlist.txt')
  var filters = fs.readFileSync(rulePath, 'utf8').split(/[\r\n]+/)
  var output = Mustache.render(template, {
    filters: JSON.stringify(filters, null, 2),
    match: program.match || 'SOCKS5 127.0.0.1:1080; PROXY 192.168.1.1:8123; DIRECT;',
    miss: program.miss || 'DIRECT'
  })

  var outputPath = program.output || path.join(__dirname, 'openlist.pac')
  fs.writeFileSync(outputPath, output)
  console.log('Generate pac file at', outputPath)
} else {
  module.exports = require('./openlist.pac')
}
