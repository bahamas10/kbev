kbev - XBMC Keyboard Event
==========================

Send keypress events to XBMC over the Event Sever API (UDP)

Installation
------------

First, install [Node.js][0].  Then run:

    [sudo] npm install -g kbev

How To
------

Run `kbev` to send keypresses to a local or remote instance of XBMC from
the terminal

    $ kbev localhost
    connected to XBMC on localhost, ctrl-c to exit

Usage
-----

    $ kbev -h
    usage: kbev [host]

    Send keypress events to XBMC over the Event Sever API (UDP)

      -h, --help                    print this message and exit
      -H, --host <host>             [env XBMC_HOST] host on which to listen, defaults to localhost
      -p, --port <port>             [env XBMC_PORT] port on which to listen, defaults to 9777
      -u, --updates                 check for available updates
      -v, --verbose                 increase verbosity
      -V, --version                 print the version number and exit

License
-------

MIT License

[0]: http://nodejs.org
