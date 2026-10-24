"""Minimax and alpha-beta pruning for finite game trees."""
from dataclasses import dataclass
from math import inf
from typing import TypeAlias
Tree: TypeAlias = int | float | list["Tree"]
@dataclass(frozen=True)
class SearchResult:
    value: float
    visited_leaves: int
    pruned_branches: int

def minimax(tree: Tree, maximizing: bool=True) -> SearchResult:
    visited=0
    def visit(node, turn):
        nonlocal visited
        if not isinstance(node,list): visited+=1; return float(node)
        if not node: raise ValueError("Game tree nodes cannot have no children")
        vals=[visit(child,not turn) for child in node]
        return max(vals) if turn else min(vals)
    return SearchResult(visit(tree,maximizing),visited,0)

def alpha_beta(tree: Tree, maximizing: bool=True) -> SearchResult:
    visited=0; pruned=0
    def visit(node,turn,alpha,beta):
        nonlocal visited,pruned
        if not isinstance(node,list): visited+=1; return float(node)
        if not node: raise ValueError("Game tree nodes cannot have no children")
        value=-inf if turn else inf
        for i,child in enumerate(node):
            cv=visit(child,not turn,alpha,beta); value=max(value,cv) if turn else min(value,cv)
            if turn: alpha=max(alpha,value)
            else: beta=min(beta,value)
            if alpha>=beta: pruned+=len(node)-i-1; break
        return value
    return SearchResult(visit(tree,maximizing,-inf,inf),visited,pruned)