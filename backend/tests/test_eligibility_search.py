from placera_ai.eligibility import evaluate_eligibility
from placera_ai.models import Opportunity, StudentProfile
from placera_ai.search import a_star,bfs,dfs,greedy_best_first

def test_hard_constraints_block_ineligible_student():
    s=StudentProfile("S-1",7.1,"CSE",1,2027,frozenset({"Python"})); j=Opportunity("J-1","Engineer",7.5,frozenset({"CSE"}),max_active_backlogs=0,eligible_graduation_years=frozenset({2027}))
    r=evaluate_eligibility(s,j)
    assert not r.eligible and r.checks=={"cgpa":False,"branch":True,"backlogs":False,"graduation_year":True}
def test_search_methods_on_small_graph():
    g={"S":[("A",1),("B",2)],"A":[("G",8)],"B":[("G",2)],"G":[]}
    assert bfs(g,"S","G")==["S","A","G"]
    assert dfs(g,"S","G")==["S","A","G"]
    h={"S":3,"A":2,"B":1,"G":0}
    assert greedy_best_first(g,"S","G",h.__getitem__)==["S","B","G"]
    path,cost=a_star(g,"S","G",lambda _:0)
    assert path==["S","B","G"] and cost==4
def test_a_star_rejects_negative_costs():
    try: a_star({"S":[("G",-1)],"G":[]},"S","G",lambda _:0)
    except ValueError as e: assert "non-negative" in str(e)
    else: raise AssertionError("negative edge should be rejected")