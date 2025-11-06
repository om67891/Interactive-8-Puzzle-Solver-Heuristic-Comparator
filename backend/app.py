from flask import Flask, request, jsonify
from flask_cors import CORS
from solver.search import astar, best_first
from solver.heuristics import manhattan, misplaced
from solver.utils import is_solvable, goal_state

app = Flask(__name__)
CORS(app)

heuristics_map = {"manhattan": manhattan, "misplaced": misplaced}
algorithms_map = {"astar": astar, "bestfirst": best_first}

@app.route("/api/solve", methods=["POST"])
def solve_puzzle():
    data = request.get_json()
    start = tuple(data["start"])
    goal = tuple(data.get("goal", goal_state))
    algorithm = data["algorithm"]
    heuristic = heuristics_map[data["heuristic"]]

    if not is_solvable(start):
        return jsonify({"status": "unsolvable"})

    solver_fn = algorithms_map[algorithm]
    result = solver_fn(start, goal, heuristic)
    return jsonify(result)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "8-Puzzle Solver API is running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)