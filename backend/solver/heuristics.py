# backend/solver/heuristics.py
goal_pos = {val: (i // 3, i % 3) for i, val in enumerate(range(1, 9))}

def manhattan(state):
    dist = 0
    for i, val in enumerate(state):
        if val == 0:
            continue
        r, c = divmod(i, 3)
        gr, gc = goal_pos[val]
        dist += abs(r - gr) + abs(c - gc)
    return dist

def misplaced(state):
    return sum(1 for i, val in enumerate(state) if val != 0 and val != i + 1)
