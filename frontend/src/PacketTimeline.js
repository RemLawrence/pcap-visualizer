import React, { useState, useEffect } from "react";
import './style/PacketTimeline.css';
import "bootstrap/dist/css/bootstrap.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export const PacketTimeline = (props) => {
    const { index, item, maxTimeISO, minTimeISO, colorMap } = props;
    const [timelineWidth, setTimelineWidth] = useState(0);

    useEffect(() => {
        function timeline() {
            setTimelineWidth(document.getElementById('timeline-bar-left').offsetWidth +
            document.getElementById('timeline-bar-middle').offsetWidth + 
            document.getElementById('timeline-bar-right').offsetWidth );
        }
        // Only calculate timeline width if it's present.
        //if (showTimeline) {
          timeline();
          //console.log(timelineWidth)
        //}
      }
    )
    const time_elapse = maxTimeISO - minTimeISO;
    const remPerTime = parseFloat((timelineWidth*0.0625 / time_elapse).toString()).toFixed(10);
    const first_point_ISO = Date.parse((item[1]['first_point'][0].toString()));
    const last_point_ISO = Date.parse((item[1]['last_point'][0].toString()));
    const lineWidth = parseFloat(last_point_ISO - first_point_ISO)*remPerTime;

    const renderTooltip = time => (
        <Tooltip className="mytooltip">
           {<b>src:</b>}  {<u>{item[1].src_ip}</u>} {<br></br>}
           {<b>dest:</b>} {<u>{item[1].dst_ip}</u>} {<br></br>}
            {<b>protocol:</b>} {<u>{item[1].proto}</u>} {<br></br>}
            {<b>time:</b>} {<u>{time}</u>} {<br></br>}
        </Tooltip>
      );

    return(
        <>
        <div style={{display: 'block', marginTop: index*3 + 'rem', marginLeft: '10rem', marginRight: '10rem', textAlign: 'right', position: "relative" }}
        onMouseEnter={() => {console.log(item[1].proto)}}
        title={item[1].proto}>
            <hr style={{marginTop: '0.15rem', position: 'absolute', width: lineWidth + 'rem', right: (maxTimeISO - last_point_ISO)*remPerTime + 'rem', borderColor: colorMap[item[1].proto]}} />
            {item[1].dataPoints.map((dataPoint) => {
                return (
                    <OverlayTrigger placement="top" overlay={renderTooltip(dataPoint)}>
                        <span className="dot"
                            style={{right: remPerTime*(maxTimeISO-Date.parse(dataPoint.toString()))+'rem', position: "absolute", backgroundColor: colorMap[item[1].proto]}}
                            title={item[1].proto}
                            data-tip data-for="registerTip"
                        />
                    </OverlayTrigger>)
                })
            }
        </div>
      </>
    )
}