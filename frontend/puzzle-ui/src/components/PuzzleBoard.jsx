// import React from 'react';
// import '../styles/border.css';

// const PuzzleBoard = ({ puzzle }) => {
//   return (
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gap: '10px' }}>
//       {puzzle.map((num, i) => (
//         <div key={i} className="puzzle-tile">
//           {num !== 0 ? num : ''}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PuzzleBoard;

import React, { useState, useEffect } from 'react';
import '../styles/border.css';

const PuzzleBoard = ({ 
  puzzle, 
  onTileClick, 
  isSolving = false, 
  isAnimating = false,
  solutionPath = [],
  currentStep = 0 
}) => {
  const [tileEffects, setTileEffects] = useState({});
  const [lastMove, setLastMove] = useState(null);

  // Calculate tile colors based on value
  const getTileColor = (value) => {
    if (value === 0) return 'transparent';
    const hue = (value * 40) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Calculate tile position in goal state
  const getGoalPosition = (value) => {
    if (value === 0) return { row: 2, col: 2 };
    const index = value - 1;
    return { row: Math.floor(index / 3), col: index % 3 };
  };

  // Check if tile is in correct position
  const isInCorrectPosition = (value, index) => {
    if (value === 0) return index === 8;
    return value === index + 1;
  };

  // Add animation effect when tile is moved
  useEffect(() => {
    if (solutionPath.length > 0 && currentStep > 0) {
      const currentState = solutionPath[currentStep];
      const previousState = solutionPath[currentStep - 1];
      
      // Find which tile moved
      let movedTile = null;
      let direction = null;
      
      for (let i = 0; i < currentState.length; i++) {
        if (currentState[i] !== previousState[i] && currentState[i] !== 0) {
          movedTile = currentState[i];
          
          // Determine direction
          const zeroIndexPrev = previousState.indexOf(0);
          const zeroIndexCurr = currentState.indexOf(0);
          
          if (zeroIndexCurr === zeroIndexPrev - 1) direction = 'right';
          else if (zeroIndexCurr === zeroIndexPrev + 1) direction = 'left';
          else if (zeroIndexCurr === zeroIndexPrev - 3) direction = 'down';
          else if (zeroIndexCurr === zeroIndexPrev + 3) direction = 'up';
          
          break;
        }
      }
      
      if (movedTile) {
        setLastMove({ tile: movedTile, direction });
        
        // Clear the move highlight after animation
        setTimeout(() => {
          setLastMove(null);
        }, 600);
      }
    }
  }, [currentStep, solutionPath]);

  const handleTileClick = (index) => {
    if (onTileClick) {
      onTileClick(index);
      
      // Add click effect
      setTileEffects(prev => ({
        ...prev,
        [index]: 'click'
      }));
      
      setTimeout(() => {
        setTileEffects(prev => {
          const newEffects = { ...prev };
          delete newEffects[index];
          return newEffects;
        });
      }, 300);
    }
  };

  return (
    <div className="puzzle-board-container">
      <div className="puzzle-board-wrapper">
        <div className={`puzzle-board ${isSolving ? 'solving' : ''} ${isAnimating ? 'animating' : ''}`}>
          {puzzle.map((num, index) => {
            const goalPos = getGoalPosition(num);
            const currentRow = Math.floor(index / 3);
            const currentCol = index % 3;
            const isCorrect = isInCorrectPosition(num, index);
            const isRecentlyMoved = lastMove && lastMove.tile === num;
            const hasEffect = tileEffects[index];
            
            return (
              <div
                key={index}
                className={`puzzle-tile ${num === 0 ? 'empty' : ''} ${
                  isCorrect ? 'correct' : 'incorrect'
                } ${hasEffect ? `effect-${hasEffect}` : ''} ${
                  isRecentlyMoved ? `moved-${lastMove.direction}` : ''
                }`}
                style={{ 
                  backgroundColor: getTileColor(num),
                  '--goal-row': goalPos.row,
                  '--goal-col': goalPos.col,
                  '--current-row': currentRow,
                  '--current-col': currentCol,
                }}
                onClick={() => handleTileClick(index)}
                data-tile-value={num}
              >
                {num !== 0 && (
                  <>
                    <span className="tile-number">{num}</span>
                    <div className="tile-glow"></div>
                    {!isCorrect && (
                      <div className="position-indicator">
                        <div className="target-position"></div>
                      </div>
                    )}
                  </>
                )}
                {isRecentlyMoved && (
                  <div className="move-arrow">
                    {lastMove.direction === 'up' && '↑'}
                    {lastMove.direction === 'down' && '↓'}
                    {lastMove.direction === 'left' && '←'}
                    {lastMove.direction === 'right' && '→'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Board Overlay Effects */}
        {isSolving && (
          <div className="solving-overlay">
            <div className="pulse-ring"></div>
            <div className="loading-text">Finding Solution...</div>
          </div>
        )}
        
        {isAnimating && (
          <div className="animating-overlay">
            <div className="wave-effect"></div>
          </div>
        )}
      </div>
      
      {/* Board Status */}
      <div className="board-status">
        <div className="status-item">
          <span className="status-label">Tiles in Place:</span>
          <span className="status-value">
            {puzzle.filter((num, index) => isInCorrectPosition(num, index)).length - 1}/8
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Board State:</span>
          <span className={`status-value ${
            puzzle.every((num, index) => isInCorrectPosition(num, index)) ? 'solved' : 'unsolved'
          }`}>
            {puzzle.every((num, index) => isInCorrectPosition(num, index)) ? 'Solved!' : 'Unsolved'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PuzzleBoard;