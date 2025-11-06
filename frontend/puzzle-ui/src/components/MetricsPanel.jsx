import React from 'react';

const MetricsPanel = ({ result }) => {
  if (!result) return null;
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Results:</h3>
      <p>Status: {result.status}</p>
      <p>Steps: {result.steps}</p>
      <p>Expanded Nodes: {result.expanded}</p>
      <p>Time Taken: {result.time} sec</p>
    </div>
  );
};

export default MetricsPanel;
