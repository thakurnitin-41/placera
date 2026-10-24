"""Bayesian update, certainty factors, Dempster-Shafer and fuzzy primitives."""
from math import isclose

def _prob(x,name):
    if not 0<=x<=1: raise ValueError(f"{name} must be in [0, 1]")
def bayes_update(prior,likelihood_if_true,likelihood_if_false):
    _prob(prior,"prior"); _prob(likelihood_if_true,"likelihood_if_true"); _prob(likelihood_if_false,"likelihood_if_false")
    d=prior*likelihood_if_true+(1-prior)*likelihood_if_false
    if d==0: raise ValueError("Evidence has zero probability under both hypotheses")
    return prior*likelihood_if_true/d
def combine_certainty_factors(a,b):
    if not -1<=a<=1 or not -1<=b<=1: raise ValueError("Certainty factors must be in [-1, 1]")
    if a>=0 and b>=0: return a+b*(1-a)
    if a<=0 and b<=0: return a+b*(1+a)
    d=1-min(abs(a),abs(b))
    if d==0: raise ValueError("Opposing certainty factors undefined at equal unit magnitude")
    return (a+b)/d
def _validate_mass(m):
    if not m or any(v<0 for v in m.values()) or not isclose(sum(m.values()),1,abs_tol=1e-9): raise ValueError("Masses must be non-negative and sum to 1")
def combine_dempster_shafer(m1,m2):
    _validate_mass(m1); _validate_mass(m2); out={}; conflict=0.0
    for a,ma in m1.items():
        for b,mb in m2.items():
            intersection=a&b; mass=ma*mb
            if not intersection: conflict+=mass
            else: out[intersection]=out.get(intersection,0)+mass
    if isclose(conflict,1): raise ValueError("Dempster rule undefined at total conflict 1")
    return {h:v/(1-conflict) for h,v in out.items()},conflict
def belief(mass,hypothesis): return sum(v for s,v in mass.items() if s<=hypothesis)
def plausibility(mass,hypothesis): return sum(v for s,v in mass.items() if s&hypothesis)
def triangular_membership(x,a,b,c):
    if not a<=b<=c: raise ValueError("Triangle parameters must satisfy a <= b <= c")
    if x<a or x>c: return 0.0
    if x==b: return 1.0
    if x<b: return 1.0 if a==b else (x-a)/(b-a)
    return 1.0 if b==c else (c-x)/(c-b)
def centroid_discrete(points):
    points=list(points); d=sum(mu for _,mu in points)
    if d<=0: raise ValueError("Centroid requires positive total membership")
    return sum(x*mu for x,mu in points)/d
def bayesian_network_fit(prior_fit,p_skill_given_fit,p_skill_given_not_fit):
    """Single evidence update only; caller supplies all CPT values."""
    return bayes_update(prior_fit,p_skill_given_fit,p_skill_given_not_fit)