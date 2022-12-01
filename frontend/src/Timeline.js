import React from "react";

export const Timeline = () => {
    return (
    <div
        style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
      >
        <div id='timeline-bar-left' style={{flex: 1, height: '10px', backgroundColor: 'black', 'marginLeft': '10rem'}} />

        <div id='timeline-bar-middle'>
          <p style={{width: '70px', textAlign: 'center'}}>Timeline</p>
        </div>

        <div id='timeline-bar-right' style={{flex: 1, height: '10px', backgroundColor: 'black', 'marginRight': '10rem'}} />

    </div>
    )
}