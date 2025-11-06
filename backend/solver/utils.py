# backend/solver/utils.py
goal_state = (1, 2, 3, 4, 5, 6, 7, 8, 0)

def is_solvable(state):
    arr = [x for x in state if x != 0]
    inv_count = sum(
        1 for i in range(len(arr)) for j in range(i + 1, len(arr)) if arr[i] > arr[j]
    )
    return inv_count % 2 == 0

# backend/solver/utils.py

def get_neighbors(state):
    """
    Given a puzzle state (as a list or tuple), return all possible next states
    and the move ('up', 'down', 'left', 'right') that generated them.
    """
    neighbors = []
    size = int(len(state) ** 0.5)
    zero_index = state.index(0)
    row, col = divmod(zero_index, size)

    moves = {
        'up': (row - 1, col),
        'down': (row + 1, col),
        'left': (row, col - 1),
        'right': (row, col + 1)
    }

    for move, (r, c) in moves.items():
        if 0 <= r < size and 0 <= c < size:
            new_state = list(state)  # ensure mutable
            swap_index = r * size + c
            # swap 0 with adjacent tile
            new_state[zero_index], new_state[swap_index] = new_state[swap_index], new_state[zero_index]
            neighbors.append((tuple(new_state), move))  # ✅ return (state, move)

    return neighbors

def manhattan_distance(state, goal):
    """
    Calculate the Manhattan distance heuristic for A*.
    """
    size = int(len(state) ** 0.5)
    distance = 0
    for num in range(1, len(state)):
        curr_index = state.index(num)
        goal_index = goal.index(num)
        curr_row, curr_col = divmod(curr_index, size)
        goal_row, goal_col = divmod(goal_index, size)
        distance += abs(curr_row - goal_row) + abs(curr_col - goal_col)
    return distance
