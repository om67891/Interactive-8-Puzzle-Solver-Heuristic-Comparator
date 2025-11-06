import axios from 'axios';

// Use Render backend in production, local in development
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://interactive-8-puzzle-solver-heuristic.onrender.com/api' 
  : 'https://interactive-8-puzzle-solver-heuristic.onrender.com/api';

export const solvePuzzle = async (start, goal, algorithm, heuristic) => {
  try {
    const response = await axios.post(`${API_BASE}/solve`, {
      start,
      goal,
      algorithm,
      heuristic,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};