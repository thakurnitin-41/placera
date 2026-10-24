"""Propositional logic, simple predicate unification, rules, networks and frames."""
import re
from collections import deque
from typing import Iterable, Mapping
_TOKEN=re.compile(r"\s*(<->|->|[()!&|]|[A-Za-z_][A-Za-z0-9_]*)")

def evaluate_proposition(expression: str, values: Mapping[str,bool]) -> bool:
    tokens=_TOKEN.findall(expression)
    if "".join(tokens).replace(" ","") != re.sub(r"\s+","",expression): raise ValueError("Unsupported token in expression")
    pos=0
    def atom():
        nonlocal pos
        if pos>=len(tokens): raise ValueError("Unexpected end of expression")
        t=tokens[pos]; pos+=1
        if t=="!": return not atom()
        if t=="(":
            v=iff()
            if pos>=len(tokens) or tokens[pos]!=")": raise ValueError("Missing closing parenthesis")
            pos+=1; return v
        if t in ("&","|","->","<->",")"): raise ValueError(f"Unexpected token: {t}")
        if t not in values: raise KeyError(f"No truth value supplied for {t}")
        return bool(values[t])
    def conjunction():
        nonlocal pos
        v=atom()
        while pos<len(tokens) and tokens[pos]=="&": pos+=1; rhs=atom(); v=v and rhs
        return v
    def disjunction():
        nonlocal pos
        v=conjunction()
        while pos<len(tokens) and tokens[pos]=="|": pos+=1; rhs=conjunction(); v=v or rhs
        return v
    def implication():
        nonlocal pos
        lhs=disjunction()
        if pos<len(tokens) and tokens[pos]=="->": pos+=1; return (not lhs) or implication()
        return lhs
    def iff():
        nonlocal pos
        lhs=implication()
        while pos<len(tokens) and tokens[pos]=="<->": pos+=1; rhs=implication(); lhs=lhs==rhs
        return lhs
    result=iff()
    if pos!=len(tokens): raise ValueError(f"Unexpected token: {tokens[pos]}")
    return result

def _pred(text):
    m=re.fullmatch(r"\s*([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)\s*",text)
    if not m: raise ValueError(f"Invalid predicate: {text}")
    return m.group(1),[x.strip() for x in m.group(2).split(",") if x.strip()]
def _var(term): return bool(re.fullmatch(r"[A-Z][A-Za-z0-9_]*",term))
def unify(pattern: str, fact: str) -> dict[str,str] | None:
    pn,pa=_pred(pattern); fn,fa=_pred(fact)
    if pn!=fn or len(pa)!=len(fa): return None
    bindings={}
    for p,f in zip(pa,fa):
        if p==f: continue
        if _var(p):
            if p in bindings and bindings[p]!=f: return None
            bindings[p]=f
        elif p!=f: return None
    return bindings

def forward_chain(facts: Iterable[str], rules: Iterable[tuple[set[str],str]]) -> set[str]:
    known=set(facts); rules=list(rules); changed=True
    while changed:
        changed=False
        for premises,conclusion in rules:
            if premises<=known and conclusion not in known: known.add(conclusion); changed=True
    return known

class SemanticNetwork:
    def __init__(self,edges: Iterable[tuple[str,str,str]]=()): self.edges=set(edges)
    def add(self,subject,relation,obj): self.edges.add((subject,relation,obj))
    def query(self,subject,relation,obj=None): return {t for s,r,t in self.edges if s==subject and r==relation and (obj is None or obj==t)}
    def inherits(self,child,parent):
        queue=deque([child]); seen={child}
        while queue:
            node=queue.popleft()
            if node==parent: return True
            for target in self.query(node,"is_a"):
                if target not in seen: seen.add(target); queue.append(target)
        return False

class Frame:
    def __init__(self,slots: Mapping[str,object] | None=None,parent: "Frame | None"=None): self.slots=dict(slots or {}); self.parent=parent
    def get(self,slot,default=None):
        if slot in self.slots: return self.slots[slot]
        return self.parent.get(slot,default) if self.parent else default