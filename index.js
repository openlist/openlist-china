#!/usr/bin/env node
/*!
 * openlist -r 'openlist' -y 'SOCKS5 127.0.0.1:1080' -n 'DIRECT' -o openlist.pac
 */
'use strict'

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
  .option('-r, --rule <path>', 'source files')
  .option('-o, --output <path>', 'output target file name')
  .parse(process.argv)

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

module.exports = require(outputPath)
