#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from datetime import datetime
import json
import subprocess
import time

from flask import Flask, render_template, request, abort
from flask_cors import CORS, cross_origin
from socket import getservbyport
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, support_credentials=True)
app.config['UPLOAD_FOLDER'] = '.'

@app.route('/', methods=['GET'])
@cross_origin(supports_credentials=True)
def index():
    # Dummy html
    return render_template('index.html')

class Packet():
    '''Represents an IP network packet.
    '''
    
    protocols = {}

    def __init__(self, src_ip, src_port, dst_ip, dst_port, time):
        self.src_ip = src_ip
        self.src_port = int(src_port)
        self.dst_ip = dst_ip
        self.dst_port = int(dst_port)
        self.time = time
        try:
            self.proto = getservbyport(self.dst_port)
            significant_port = self.dst_port
        except OSError:
            try:
                self.proto = getservbyport(self.src_port)
                significant_port = self.src_port
            except OSError:
                self.proto = 'unknown'
                significant_port = min([self.src_port, self.dst_port])
        self.protocols.update({significant_port: self.proto})

    def __repr__(self):
        return '<Packet {}:{} -> {}:{}>'.format(self.src_ip, self.src_port, self.dst_ip, self.dst_port)

class Conversation():
    '''Represents a conversation between two IP addresses on a network with a given application protocol.
    '''
    def __init__(self, src_ip, dst_ip, proto):
        self.src_ip = src_ip
        self.dst_ip = dst_ip
        self.proto = proto
        self.packets = []

    def __repr__(self):
        return '<Conversation {} -> {} ({})>'.format(self.src_ip, self.dst_ip, self.proto)

@app.route('/tshark', methods=['POST'])
@cross_origin(supports_credentials=True)
def tshark():
    '''Handler for ajax call that accepts pacp/.pcapng file uploaded and returns
       data in JSON format with all conversations and packets in pcap file.
    '''
    # handle uploaded file
    file = request.files['file']
    if file:
        # add timestamp to escaped file name
        pcap_file = str(int(time.time())) + secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], pcap_file))
    # error handling
    else:
        abort(500)
    # process file with tshark command and parse output into a list of packets
    tshark_output = subprocess.getoutput('tshark -o gui.column.format:"AbsTime","%Yt","Source IP Address","%us","Source Port","%uS","Destination IP Address","%ud","Destination Port","%uD" -r {}'.format(pcap_file))
    tshark_cut = [l.strip() for l in tshark_output.split('\n')]

    packets = []
    for line in tshark_cut:
        p = line.split()
        try:
            dt = datetime.strptime(p[0] + p[1], '%Y-%m-%d%H:%M:%S')
        except (ValueError):
            try:
                dt = datetime.strptime(p[0] + p[1], '%Y-%m-%d%H:%M:%S.%f')
            except (ValueError, IndexError) as e:
                try:
                    seconds, microseconds = p[1].split('.')
                    if len(microseconds) > 6: # more precise than %f can handle, so round up
                        new_microseconds = microseconds[:6]
                        p[1] = f'{seconds}.{new_microseconds}'
                        dt = datetime.strptime(p[0] + p[1], '%Y-%m-%d%H:%M:%S.%f')
                    else:
                        continue
                except Exception as e:
                    continue
        del p[:2]
        p.append(dt)
        # if there's a line in tshark_cut an odd amount of data, ignore it
        # this takes care of packets with no source or destination port (e.g. ARP)
        if len(p) != 5:
            continue
        packets.append(Packet(*p))

    # get a list of conversations
    conversations = []

    packets.sort(key=lambda x: x.time)
    for p in packets:
        print(p.proto)
        # going through time
        c = get_conversation(p, conversations)
        if not c:
            c = Conversation(src_ip=p.src_ip, dst_ip=p.dst_ip, proto=p.proto)
            conversations.append(c)
        c.packets.append(p)

    data_list = []
    conv_dict = {}
    conv_ctr = len(conversations)

    for c in conversations:
        c.conv_id = str(conv_ctr)
        conv_ctr -= 1
        for p in c.packets:
            data_list.append((str(p.time), c.conv_id))
        conv_dict.update({c.conv_id: {'src_ip': c.src_ip,
                                      'dst_ip': c.dst_ip,
                                      'proto': c.proto,
                                      'first_point': (str(c.packets[0].time), c.conv_id),
                                      'last_point': (str(c.packets[-1].time), c.conv_id)}})
    return json.dumps([conv_dict, data_list])

def get_conversation(p, conversations):
    '''Helper function that takes a packet and a list of conversations
       and returns the conversation to which the packet belongs.
    '''
    for c in conversations:
        # if packet ip pair matches conversation ip pair
        if (sorted([p.src_ip, p.dst_ip]) == sorted([c.src_ip, c.dst_ip])
        # and packet protocol matches conversation protocol
        and p.proto == c.proto):
            return c
    return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4396, debug=True)
    
