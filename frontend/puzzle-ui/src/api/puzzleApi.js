import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';

export const solvePuzzle = async (start, goal, algorithm, heuristic) => {
  const response = await axios.post(`${API_BASE}/solve`, {
    start,
    goal,
    algorithm,
    heuristic,
  });
  return response.data;
};
