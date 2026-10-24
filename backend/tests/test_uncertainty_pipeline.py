import math
from placera_ai.models import Opportunity,StudentProfile
from placera_ai.pipeline import recommend
from placera_ai.uncertainty import bayes_update,belief,combine_certainty_factors,combine_dempster_shafer,centroid_discrete,plausibility,triangular_membership

def test_bayes_cf_and_fuzzy_reference_values():
    assert math.isclose(bayes_update(.3,.8,.35),.4948453608,rel_tol=1e-8)
    assert math.isclose(combine_certainty_factors(.6,.5),.8)
    assert math.isclose(triangular_membership(.5,0,1,1),.5)
    assert math.isclose(centroid_discrete([(0,0),(50,1),(100,0)]),50)
def test_dempster_shafer_combination():
    a=frozenset({"fit"}); frame=frozenset({"fit","not_fit"})
    combined,conflict=combine_dempster_shafer({a:.6,frame:.4},{a:.7,frame:.3})
    assert math.isclose(conflict,0) and math.isclose(sum(combined.values()),1)
    assert math.isclose(belief(combined,a),combined[a])
    assert math.isclose(plausibility(combined,a),combined[a]+combined[frame])
def test_pipeline_never_ranks_ineligible_job_above_eligible_job():
    s=StudentProfile("S-101",8.2,"CSE",0,2027,frozenset({"Python","SQL"}))
    jobs=[Opportunity("bad","Ineligible role",9.0,frozenset({"CSE"}),frozenset({"Python"})),Opportunity("good","Eligible role",7.5,frozenset({"CSE"}),frozenset({"Python","SQL"}))]
    results=recommend(s,jobs)
    assert results[0].opportunity_id=="good" and results[0].eligible
    assert results[1].opportunity_id=="bad" and not results[1].eligible and results[1].score==0