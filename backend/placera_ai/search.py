"""Deterministic BFS, DFS, Greedy Best-First and A* graph search."""
from collections import deque
from heapq import heappop, heappush
from math import inf
from typing import Callable, Hashable, Mapping, Sequence, TypeVar
N = TypeVar("N", bound=Hashable)
Graph = Mapping[N, Sequence[tuple[N, float]]]

def _path(parent, goal):
    out=[]; node=goal
    while node is not None: out.append(node); node=parent[node]
    return list(reversed(out))

def bfs(graph: Graph, start: N, goal: N) -> list[N] | None:
    queue=deque([start]); parent={start:None}
    while queue:
        node=queue.popleft()
        if node==goal: return _path(parent,goal)
        for nxt,_ in graph.get(node,()):
            if nxt not in parent: parent[nxt]=node; queue.append(nxt)
    return None

def dfs(graph: Graph, start: N, goal: N) -> list[N] | None:
    stack=[start]; parent={start:None}
    while stack:
        node=stack.pop()
        if node==goal: return _path(parent,goal)
        for nxt,_ in reversed(graph.get(node,())):
            if nxt not in parent: parent[nxt]=node; stack.append(nxt)
    return None

def greedy_best_first(graph: Graph, start: N, goal: N, heuristic: Callable[[N],float]) -> list[N] | None:
    heap=[]; seq=0; heappush(heap,(heuristic(start),seq,start)); parent={start:None}; seen=set()
    while heap:
        _,_,node=heappop(heap)
        if node in seen: continue
        seen.add(node)
        if node==goal: return _path(parent,goal)
        for nxt,_ in graph.get(node,()):
            if nxt not in parent: parent[nxt]=node; seq+=1; heappush(heap,(heuristic(nxt),seq,nxt))
    return None

def a_star(graph: Graph, start: N, goal: N, heuristic: Callable[[N],float]) -> tuple[list[N] | None,float]:
    heap=[]; seq=0; heappush(heap,(heuristic(start),seq,start)); g={start:0.0}; parent={start:None}; closed=set()
    while heap:
        _,_,node=heappop(heap)
        if node in closed: continue
        if node==goal: return _path(parent,goal),g[goal]
        closed.add(node)
        for nxt,cost in graph.get(node,()):
            if cost<0: raise ValueError("A* requires non-negative edge costs")
            tentative=g[node]+cost
            if tentative<g.get(nxt,inf):
                g[nxt]=tentative; parent[nxt]=node; seq+=1; heappush(heap,(tentative+heuristic(nxt),seq,nxt)); closed.discard(nxt)
    return None,inf