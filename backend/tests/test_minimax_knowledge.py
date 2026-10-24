from placera_ai.minimax import alpha_beta,minimax
from placera_ai.knowledge import Frame,SemanticNetwork,evaluate_proposition,forward_chain,unify

def test_alpha_beta_matches_minimax_and_prunes():
    tree=[[3,5,6],[9,1,2],[0,-1,4]]; plain=minimax(tree); pruned=alpha_beta(tree)
    assert pruned.value==plain.value==3.0
    assert pruned.visited_leaves<plain.visited_leaves and pruned.pruned_branches>0
def test_propositional_precedence_and_implication():
    assert evaluate_proposition("A & !B -> C",{"A":True,"B":False,"C":True}) is True
    assert evaluate_proposition("A <-> B",{"A":True,"B":False}) is False
def test_unification_rules_network_and_frames():
    assert unify("eligible(X,cs)","eligible(Ana,cs)")=={"X":"Ana"}
    assert unify("eligible(X,cs)","eligible(Ana,ee)") is None
    assert forward_chain({"cgpa_pass","branch_pass"},[({"cgpa_pass","branch_pass"},"eligible")])=={"cgpa_pass","branch_pass","eligible"}
    n=SemanticNetwork([("React","is_a","FrontendSkill"),("FrontendSkill","is_a","TechnicalSkill")]); assert n.inherits("React","TechnicalSkill")
    base=Frame({"category":"role","minimum_cgpa":7.0}); child=Frame({"title":"Frontend Engineer"},parent=base)
    assert child.get("title")=="Frontend Engineer" and child.get("minimum_cgpa")==7.0