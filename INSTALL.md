# Installation is very manual at the moment.

Use a Pi3B+, max98357 amp, button and a rotary encoder with built-in button.

## set up Pi

    touch /Volumes/boot/ssh
    nano /Volumes/boot/wpa_supplicant.conf

contents

    country=GB
    ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
    update_config=1

    network={
       ssid="foo"
       psk="bar"
    }

Plug everything in (like this)[https://learn.adafruit.com/adafruit-max98357-i2s-class-d-mono-amp/raspberry-pi-wiring]

Change the name (in /etc/hosts and /etc/hostname)

## Install code

Install radiodan via provision but fixing node

    curl https://raw.githubusercontent.com/andrewn/neue-radio/master/deployment/provision | sudo bash

reboot

install i2s AMP

    curl -sS https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/i2samp.sh | bash

(sometimes you need to run this twice)

reboot

disable spi (just in case; sometimes there seems to be a race condision if enabled)

copy over `rando` into `/opt/radiodan/rde/apps` -  `mv rando /opt/radiodan/rde/apps/`

Enable just the rando app, no services using the web interface.

reboot again

## Add in watcher and service

Watcher listens to `rando/assets/audio`  for mp3 files and updates a file for the app to use (`rando/assets/songs_list/songs.js`)

    sudo apt install python3-pip
    pip3 install watchdog 
    pip3 install eyed3

    sudo cp watcher.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable watcher
    sudo systemctl start watcher

## Add in python physical interface and service

(I was getting node using 100% of CPU and 70% of memory with the node version, so this is a super-quick rewrite).

    pip3 install websocket_client
    pip3 install RPi-GPIO-Rotary

    cp start-physical-environment.sh /opt/radiodan/rde/services/manager/start-physical-environment.sh
    chmod a+x /opt/radiodan/rde/services/manager/start-physical-environment.sh 

    sudo cp physical-py.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable physical-py
    sudo systemctl start physical-py


# Tests

 1. startup plays a startup noise
 2. click rotary encoder plays random file, jumping in at a random point if it's > 1 min
 3. click stop stops all
 4. turn rotary encoder clockwise increases vol, anticlockwise decreases it
 5. audio files (mp3 only) can be dropped into (or deleted from) apps/rando/assets/audio using samba - once on your network, connect like:
finder -> go-> connect to server -> smb://pi:pi@raspberrypi.local password 'raspberry'

There's no wifi management - use a `wpa_supplicant.conf` file in `/boot` containing

```
country=GB
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
   ssid="foo"
   psk="bar"
}
```

