import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function App() {
  const [board, setBoard] = useState([1, 2, 3, 4, 0, 6, 7, 5, 8]);
  const [algorithm, setAlgorithm] = useState("astar");
  const [heuristic, setHeuristic] = useState("manhattan");
  const [result, setResult] = useState(null);
  const [isSolving, setIsSolving] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [solutionPath, setSolutionPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [customPuzzle, setCustomPuzzle] = useState("");
  const [history, setHistory] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);

  // Initialize with a solvable puzzle
  useEffect(() => {
    generateSolvablePuzzle();
  }, []);

  const generateSolvablePuzzle = useCallback(() => {
    let shuffled;
    let attempts = 0;
    do {
      shuffled = [...GOAL_STATE];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      attempts++;
    } while (!isSolvable(shuffled) && attempts < 1000);
    
    setBoard(shuffled);
    setResult(null);
    setSolutionPath([]);
    setCurrentStep(0);
    addToHistory(shuffled, "Generated new puzzle");
  }, []);

  const isSolvable = (puzzle) => {
    let inversions = 0;
    for (let i = 0; i < puzzle.length; i++) {
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] !== 0 && puzzle[j] !== 0 && puzzle[i] > puzzle[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const addToHistory = (state, action) => {
    setHistory(prev => [...prev.slice(-9), { state: [...state], action, timestamp: new Date() }]);
  };

  const handleSolve = async () => {
    if (isSolving) return;
    
    setIsSolving(true);
    setResult(null);
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/solve", {
        start: board,
        goal: GOAL_STATE,
        algorithm,
        heuristic,
      });
      
      const data = response.data;
      setResult(data);
      
      if (data.status === "solved" && data.path) {
        setSolutionPath(data.path);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error("Error solving puzzle:", error);
      setResult({ 
        status: "error", 
        message: "Failed to solve puzzle. Please check your connection." 
      });
    } finally {
      setIsSolving(false);
    }
  };

  const animateSolution = async () => {
    if (!solutionPath.length || isAnimating) return;
    
    setIsAnimating(true);
    for (let i = 0; i < solutionPath.length; i++) {
      setCurrentStep(i);
      setBoard(solutionPath[i]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    setIsAnimating(false);
    addToHistory(board, "Completed solution animation");
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const handleStepForward = () => {
    if (currentStep < solutionPath.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setBoard(solutionPath[nextStep]);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setBoard(solutionPath[prevStep]);
    }
  };

  const handleResetToInitial = () => {
    if (solutionPath.length > 0) {
      setBoard(solutionPath[0]);
      setCurrentStep(0);
    }
  };

  const handleCustomPuzzle = () => {
    const customArray = customPuzzle
      .split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num));
    
    if (customArray.length === 9 && customArray.includes(0)) {
      if (isSolvable(customArray)) {
        setBoard(customArray);
        setResult(null);
        setSolutionPath([]);
        setCurrentStep(0);
        addToHistory(customArray, "Custom puzzle loaded");
      } else {
        alert("This puzzle configuration is not solvable. Please try another.");
      }
    } else {
      alert("Please enter 9 numbers separated by commas, including one zero (0) for the empty space.");
    }
  };

  const handleTileClick = (index) => {
    if (isSolving || isAnimating || solutionPath.length > 0) return;
    
    const zeroIndex = board.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const zeroRow = Math.floor(zeroIndex / 3);
    const zeroCol = zeroIndex % 3;
    
    // Check if clicked tile is adjacent to empty space
    if ((Math.abs(row - zeroRow) === 1 && col === zeroCol) || 
        (Math.abs(col - zeroCol) === 1 && row === zeroRow)) {
      const newBoard = [...board];
      [newBoard[zeroIndex], newBoard[index]] = [newBoard[index], newBoard[zeroIndex]];
      setBoard(newBoard);
      addToHistory(newBoard, `Moved tile ${board[index]}`);
    }
  };

  const getTileColor = (value) => {
    if (value === 0) return "transparent";
    const hue = (value * 40) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">8-Puzzle Solver</h1>
        <p className="app-subtitle">AI-Powered Puzzle Solution</p>
      </header>

      <div className="app-container">
        {/* Left Panel - Puzzle Board and Custom Puzzle */}
        <div className="puzzle-section">
          <div className="puzzle-container">
            <div className="puzzle-board">
              {board.map((num, index) => (
                <div
                  key={index}
                  className={`puzzle-tile ${num === 0 ? 'empty' : ''} ${
                    isSolving ? 'solving' : ''
                  }`}
                  style={{ 
                    backgroundColor: getTileColor(num),
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => handleTileClick(index)}
                >
                  {num !== 0 && (
                    <>
                      <span className="tile-number">{num}</span>
                      <div className="tile-glow"></div>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Step Indicator */}
            {solutionPath.length > 0 && (
              <div className="step-indicator">
                Step {currentStep + 1} of {solutionPath.length}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentStep + 1) / solutionPath.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Puzzle Section - MOVED HERE */}
          <div className="control-card custom-puzzle-card">
            <h3>Custom Puzzle</h3>
            <div className="control-group">
              <label>Enter numbers (comma separated):</label>
              <input
                type="text"
                value={customPuzzle}
                onChange={(e) => setCustomPuzzle(e.target.value)}
                placeholder="e.g., 1,2,3,4,5,6,7,0,8"
                className="custom-input"
              />
            </div>
            <button 
              onClick={handleCustomPuzzle}
              disabled={isSolving || isAnimating}
              className="secondary-btn custom-puzzle-btn"
            >
              Load Custom Puzzle
            </button>
          </div>
        </div>

        {/* Right Panel - Controls and Information */}
        <div className="control-section">
          {/* Algorithm Settings */}
          <div className="control-card">
            <h3>Algorithm Settings</h3>
            <div className="control-group">
              <label>Algorithm:</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isSolving || isAnimating}
              >
                <option value="astar">A* Search</option>
                <option value="bestfirst">Best-First Search</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Heuristic:</label>
              <select 
                value={heuristic} 
                onChange={(e) => setHeuristic(e.target.value)}
                disabled={isSolving || isAnimating}
              >
                <option value="manhattan">Manhattan Distance</option>
                <option value="misplaced">Misplaced Tiles</option>
              </select>
            </div>

            <div className="control-group">
              <label>Animation Speed:</label>
              <select 
                value={animationSpeed} 
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                disabled={isAnimating}
              >
                <option value={1000}>Slow</option>
                <option value={500}>Medium</option>
                <option value={200}>Fast</option>
                <option value={50}>Very Fast</option>
              </select>
            </div>
          </div>

          {/* Puzzle Actions */}
          <div className="control-card">
            <h3>Puzzle Actions</h3>
            <div className="button-group">
              <button 
                onClick={handleSolve}
                disabled={isSolving || isAnimating}
                className={`solve-btn ${isSolving ? 'loading' : ''}`}
              >
                {isSolving ? (
                  <>
                    <div className="spinner"></div>
                    Solving...
                  </>
                ) : (
                  'Solve Puzzle'
                )}
              </button>
              
              <button 
                onClick={generateSolvablePuzzle}
                disabled={isSolving || isAnimating}
                className="secondary-btn"
              >
                Scramble
              </button>
            </div>

            {/* Solution Controls */}
            {solutionPath.length > 0 && (
              <div className="solution-controls">
                <h4>Solution Controls</h4>
                <div className="button-group">
                  <button 
                    onClick={animateSolution}
                    disabled={isAnimating}
                    className="secondary-btn"
                  >
                    {isAnimating ? 'Animating...' : 'Play Animation'}
                  </button>
                  <button 
                    onClick={stopAnimation}
                    disabled={!isAnimating}
                    className="secondary-btn"
                  >
                    Stop
                  </button>
                </div>
                <div className="button-group">
                  <button 
                    onClick={handleStepBackward}
                    disabled={currentStep === 0 || isAnimating}
                    className="secondary-btn"
                  >
                    Previous Step
                  </button>
                  <button 
                    onClick={handleStepForward}
                    disabled={currentStep === solutionPath.length - 1 || isAnimating}
                    className="secondary-btn"
                  >
                    Next Step
                  </button>
                </div>
                <button 
                  onClick={handleResetToInitial}
                  className="secondary-btn"
                >
                  Reset to Start
                </button>
              </div>
            )}
          </div>

          {/* Results Display */}
          {result && (
            <div className={`results-card ${result.status}`}>
              <h3>Solution Results</h3>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Status:</span>
                  <span className={`result-value status-${result.status}`}>
                    {result.status === 'solved' ? '✓ Solved' : 
                     result.status === 'error' ? '✗ Error' : 'Unsolved'}
                  </span>
                </div>
                {result.steps && (
                  <div className="result-item">
                    <span className="result-label">Steps:</span>
                    <span className="result-value">{result.steps}</span>
                  </div>
                )}
                {result.expanded_nodes && (
                  <div className="result-item">
                    <span className="result-label">Nodes Expanded:</span>
                    <span className="result-value">{result.expanded_nodes}</span>
                  </div>
                )}
                {result.time && (
                  <div className="result-item">
                    <span className="result-label">Time Taken:</span>
                    <span className="result-value">{result.time} seconds</span>
                  </div>
                )}
                {result.message && (
                  <div className="result-item">
                    <span className="result-label">Message:</span>
                    <span className="result-value">{result.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>How to Use the 8-Puzzle Solver</h2>
            <div className="tutorial-content">
              <p>1. Use the scramble button to generate a random puzzle</p>
              <p>2. Click on tiles adjacent to the empty space to move them</p>
              <p>3. Choose your preferred algorithm and heuristic</p>
              <p>4. Click "Solve Puzzle" to find the solution</p>
              <p>5. Watch the animation or step through the solution</p>
              <p>6. Load custom puzzles using the custom puzzle section</p>
            </div>
            <button 
              onClick={() => setShowTutorial(false)}
              className="primary-btn"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <button 
          onClick={() => setShowTutorial(true)}
          className="help-btn"
        >
          Need Help?
        </button>
        <div className="footer-info">
          Built with React & Flask | 8-Puzzle AI Solver
        </div>
      </footer>
    </div>
  );
}

export default App;