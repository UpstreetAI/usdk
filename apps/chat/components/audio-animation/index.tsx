import React, { useState } from 'react';

import "./styles.css";

const Bar = ({index}: {index?: number}) => {
  const [animationDuration,] = useState(`${Math.random() * (0.7 - 0.2) + 0.2}s`)
  return (
<div key={index} className="bar" style={{
  animationDuration
}}></div>
  )
}

const AudioAnimation: React.FC = () => {
  return (
    <div className="sound-wave">
      {Array.from({ length: 20 }).map((_, i) => (
        <Bar key={i} index={i} />
      ))}
    </div>
  );
};

export default AudioAnimation;