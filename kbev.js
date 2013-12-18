#!/usr/bin/env node
/**
 * Send keypress events to XBMC over the Event Sever API (UDP)
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 12/18/13
 * License: MIT
 */

var fs = require('fs');
var path = require('path');
var util = require('util');

var getopt = require('posix-getopt');
var xec = require('xbmc-event-client');

var package = require('./package.json');
var appname = util.format('%s@%s', package.name, package.version);

function usage() {
  return [
    'usage: kbev [host]',
    '',
    'Send keypress events to XBMC over the Event Sever API (UDP)',
    '',
    '  -h, --help                    print this message and exit',
    '  -H, --host <host>             [env XBMC_HOST] host on which to listen, defaults to ' + xec.DEFAULT_HOST,
    '  -p, --port <port>             [env XBMC_PORT] port on which to listen, defaults to ' + xec.DEFAULT_PORT,
    '  -u, --updates                 check for available updates',
    '  -v, --verbose                 increase verbosity',
    '  -V, --version                 print the version number and exit'
  ].join('\n');
}

function debug() {
  if (opts.verbosity >= 1)
    return console.log.apply(console, arguments);
}

// command line arguments
var options = [
  'h(help)',
  'H:(host)',
  'p:(port)',
  'u(updates)',
  'v(verbose)',
  'V(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);

var opts = {
  host: process.env.XBMC_HOST,
  port: process.env.XBMC_PORT,
  verbosity: 0
};
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'h': console.log(usage()); process.exit(0);
    case 'H': opts.host = option.optarg; break;
    case 'p': opts.port = option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': opts.verbosity++; break;
    case 'V': console.log(package.version); process.exit(0);
    default: console.error(usage()); process.exit(1); break;
  }
}
var args = process.argv.slice(parser.optind());

var xbmcopts = {
  host: opts.host || args[0] || xec.DEFAULT_HOST,
  port: opts.port || args[1] || xec.DEFAULT_PORT,
  iconbuffer: fs.readFileSync(path.join(__dirname, 'node.png')),
  icontype: xec.ICON_PNG
};

var xbmc = new xec.XBMCEventClient(appname, xbmcopts);

// send HELO to xbmc
xbmc.connect(function(errors, bytes) {
  if (errors.length)
    throw errors[0];

  console.log('connected to XBMC on %s, ctrl-c to exit', xbmcopts.host);

  process.stdin.on('data', ondata);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

// data received by keyboard
function ondata(data) {
  // ctrl-c
  if (data[0] === 3)
    process.exit(0);

  var d;
  var code;
  if (d = data[2]) {
    // arrow keys
    switch (d) {
      case 0x41: code = 270; break;
      case 0x42: code = 271; break;
      case 0x43: code = 273; break;
      case 0x44: code = 272; break;
      default: code = d; break;
    }
  } else if (d = data[0]) {
    // regular keys
    switch (d) {
      case 10: code = 13; break;
      case 127: code = 8; break;
      default: code = d; break;
    }
    code |= 0xf100;
    //code += 0xf000;
  }

  debug('%d received => sending %d', d, code);
  if (code)
    xbmc.buttonState({down: true, repeat: false, code: code});
}
