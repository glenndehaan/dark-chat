# Dark Chat

A small telnet chat server

## Structure
- ES6
- Net
- Simple Node Logger

## Install
- Install the app via snapd:

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-white.svg)](https://snapcraft.io/darkchat)

- Open up a terminal and telnet to 127.0.0.1:1337

## Config
The default snap config can be found here:
```
/var/snap/darkchat/common/config.json
```

## Log
The log can be found here:
```
/var/snap/darkchat/common/dark-chat.log
```

Additional snap logs can be accessed by running this command:
```
sudo journalctl -fu snap.darkchat.darkchat
```

## Service
Snap installs a service by default. To get the status of the app run this command:
```
service snap.darkchat.darkchat status
```

To restart the app:
```
service snap.darkchat.darkchat restart
```

## License

MIT
