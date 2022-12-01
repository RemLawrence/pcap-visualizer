# Pcap File Visualization

## Description
A project rushed within 2 days - consist of trash code with bad practices but did the work! AYAYA  
Frontend - React.js  
Backend - Python + Flask

## Requirements
#### Back-End
* Python 3 - mine is 3.10.2
* Flask v2
  * `pip install flask`
* Werkzeug v2
  * `pip install werkzeug`
* [Termshark-cli](https://termshark.io/) (tshark) v4
  * `brew install termshark`
* .pcap/.pcapng file
  * You can generate one from [Wireshark](https://www.wireshark.org/download.html)

#### Front-End
* node v19
* React.js v18
* npm v8

## Run
* To start hosting /tshark endpoint:
  * `cd backend`
  * `python3 pcap-shark.py`
* To start the web application on port 3000:
  * `cd frontend`
  * `npm install`
  * `npm run start`

## Screenshots
![screenshot](example/drag.png?raw=true 'Initial State')
![screenshot](example/showall.png?raw=true 'Show Packets in All Protocols')
![screenshot](example/showone.png?raw=true 'Show Only Packets in One Protocol')
