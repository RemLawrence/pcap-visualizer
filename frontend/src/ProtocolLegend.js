import React, { useState } from "react";
import './style/ProtocolLegend.css';

export const ProtocolLegend = (props) => {
    const {colorMap, showProtocol, curProtocol } = props;

    return (
        <div className="legend">
            <span className="label" onClick={() => showProtocol('All')} style={{opacity: curProtocol === 'All' ? '100%' : '50%'}}>Show All</span>
            <br />
            {
                Object.entries(colorMap).map((t) => {
                    return <div className="line" style={{opacity: curProtocol === t[0].toString() ? '100%' : curProtocol === 'All' ? '100%' : '50%'}} onClick={() => showProtocol(t[0].toString())}> 
                        <span className="label">{t[0]}</span>
                        :
                        <span className="circle" style={{backgroundColor: t[1]}} />
                        <br />
                    </div>
                })
            }
        </div>
    )
}