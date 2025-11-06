import React from 'react';

const ControlsPanel = ({ algorithm, heuristic, onChange, onSolve }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <select name="algorithm" value={algorithm} onChange={onChange}>
        <option value="astar">A*</option>
        <option value="best_first">Best First Search</option>
      </select>

      <select name="heuristic" value={heuristic} onChange={onChange} style={{ marginLeft: '10px' }}>
        <option value="manhattan">Manhattan Distance</option>
        <option value="misplaced">Misplaced Tiles</option>
      </select>

      <button onClick={onSolve} style={{ marginLeft: '10px' }}>Solve</button>
    </div>
  );
};

export default ControlsPanel;
