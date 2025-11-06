import heapq
import time
from itertools import count
from solver.utils import get_neighbors, manhattan_distance


def reconstruct_path(node):
    """Reconstruct path of moves leading to solution"""
    path = []
    while node["parent"]:
        path.append(node["move"])
        node = node["parent"]
    return path[::-1]


def astar(start, goal, heuristic_fn=None):
    """A* Search algorithm for 8-puzzle"""
    if heuristic_fn is None:
        heuristic_fn = lambda s: manhattan_distance(s, goal)

    open_list = []
    counter = count()  # tie-breaker counter
    start_node = {
        "state": start,
        "g": 0,
        "h": heuristic_fn(start),
        "parent": None,
        "move": None,
    }
    f = start_node["g"] + start_node["h"]
    heapq.heappush(open_list, (f, next(counter), start_node))
    visited = set()
    expanded = 0
    start_time = time.time()

    while open_list:
        _, _, current = heapq.heappop(open_list)

        if current["state"] == goal:
            path = reconstruct_path(current)
            return {
                "status": "solved",
                "moves": path,
                "steps": len(path),
                "expanded": expanded,
                "time": round(time.time() - start_time, 4),
            }

        visited.add(current["state"])
        expanded += 1

        for new_state, move in get_neighbors(current["state"]):
            if new_state in visited:
                continue
            g = current["g"] + 1
            h = heuristic_fn(new_state)
            f = g + h
            new_node = {
                "state": new_state,
                "g": g,
                "h": h,
                "parent": current,
                "move": move,
            }
            heapq.heappush(open_list, (f, next(counter), new_node))

    return {"status": "failed"}


def best_first(start, goal, heuristic_fn=None):
    """Greedy Best-First Search for 8-puzzle"""
    if heuristic_fn is None:
        heuristic_fn = lambda s: manhattan_distance(s, goal)

    open_list = []
    counter = count()  # tie-breaker counter
    start_node = {"state": start, "parent": None, "move": None}
    h = heuristic_fn(start)
    heapq.heappush(open_list, (h, next(counter), start_node))
    visited = set()
    expanded = 0
    start_time = time.time()

    while open_list:
        _, _, current = heapq.heappop(open_list)

        if current["state"] == goal:
            path = reconstruct_path(current)
            return {
                "status": "solved",
                "moves": path,
                "steps": len(path),
                "expanded": expanded,
                "time": round(time.time() - start_time, 4),
            }

        visited.add(current["state"])
        expanded += 1

        for new_state, move in get_neighbors(current["state"]):
            if new_state in visited:
                continue
            h = heuristic_fn(new_state)
            new_node = {"state": new_state, "parent": current, "move": move}
            heapq.heappush(open_list, (h, next(counter), new_node))

    return {"status": "failed"}
