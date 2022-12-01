import './style/App.css';
import { Spinner } from './Spinner'
import { Timeline } from './Timeline'
import { PacketTimeline } from './PacketTimeline'
import { ProtocolLegend } from './ProtocolLegend';
import React, { useState } from "react";
import Dropzone from 'react-dropzone'
import axios from 'axios';

let fd = new FormData(); 
let minTime;
let maxTime;
let convDict;
// eslint-disable-next-line no-unused-vars
let minTimeISO, maxTimeISO, time_elapse, remPerTime;
const colorMap = {};

const postBody = {
  url: "http://localhost:4396/tshark",
  method: 'post',
  data: fd,
  processData: false,
  contentType: false 
}

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function App() {
  const [loading, setLoading] = useState(false); 
  const [showTimeline, setShowTimeline] = useState(false);
  const [curProtocol, setCurProtocol] = useState('All');

  const renderVisualization = (raw_data) => {
    const data = JSON.parse(JSON.stringify(raw_data))
    convDict = data[0];
    const dataPoints = data[1];

    // Get analyzer start and end time
    minTime = dataPoints[0][0];
    maxTime = dataPoints[0][0];

    // Add dummy dataPoints array to convDict as placeholder.
    for(const [key, value] of Object.entries(convDict)) {
      convDict[key]['dataPoints'] = [];
    }
    
    // Assign random color to each unique protocol
    for(const [key, value] of Object.entries(convDict)) {
      colorMap[convDict[key]['proto']] = getRandomColor();
    }

    dataPoints.forEach((dataPoint) => {
      if(dataPoint[0] < minTime) {
        minTime = dataPoint[0]
      }
      if(dataPoint[0] > maxTime) {
        maxTime = dataPoint[0];
      }
      // Adding the dataPoints to convDict
      convDict[dataPoint[1]]['dataPoints'].push(dataPoint[0]);
    })

    minTimeISO = Date.parse(minTime.toString());
    maxTimeISO = Date.parse(maxTime.toString());
    time_elapse = maxTimeISO - minTimeISO;
    //console.log(timelineWidth);

    setShowTimeline(true);
  }
  
  const processPcapFile = async (files) => {
    fd.append("file", files[0]);
    setLoading(true);
    await axios(postBody).then(res => renderVisualization(res.data));
    setLoading(false);
  }

  const showProtocol = (protocol) => {
    setCurProtocol(protocol);
  }

  return (
    <div style={{textAlign: 'center' }}>
      {!showTimeline && <Dropzone onDrop={processPcapFile}>
      {({getRootProps, getInputProps}) => (
        <section>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {loading ? <Spinner /> : (<p id="box" class="gradient-border">Drop a .pcap/.pcapng file here!</p>)}
          </div>
        </section>
      )}
      </Dropzone>}
      {showTimeline && <Timeline /> }
      {showTimeline && Object.entries(convDict).reverse().map((t,k) => {
        if (curProtocol !== 'All') {
          if(curProtocol === t[1]['proto']) {
            return <PacketTimeline 
              remPerTime={remPerTime} 
              minTimeISO={minTimeISO} 
              maxTimeISO={maxTimeISO} 
              item={t} 
              index={k} 
              colorMap={colorMap} 
              />
          }
        }
        else {
          return <PacketTimeline 
              remPerTime={remPerTime} 
              minTimeISO={minTimeISO} 
              maxTimeISO={maxTimeISO} 
              item={t} 
              index={k} 
              colorMap={colorMap} 
              />
          }
        return <></>
        })}
        
      {showTimeline && 
        <ProtocolLegend 
          colorMap={colorMap} 
          showProtocol={showProtocol} 
          curProtocol={curProtocol}
        />}
  </div>
  );
}

export default App;
