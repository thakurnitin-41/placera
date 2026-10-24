"""Eligibility-first recommendation pipeline; assumptions are returned with each result."""
from .eligibility import evaluate_eligibility
from .models import Opportunity, Recommendation, StudentProfile
from .uncertainty import bayes_update, triangular_membership

def recommend(student: StudentProfile, opportunities: list[Opportunity], *, prior_fit: float=0.30, skill_likelihood_if_fit: float=0.80, skill_likelihood_if_not_fit: float=0.35) -> list[Recommendation]:
    results=[]; student_skills={s.strip().casefold() for s in student.skills}
    for job in opportunities:
        eligibility=evaluate_eligibility(student,job); required={s.strip().casefold() for s in job.required_skills}
        matched=sorted(student_skills&required); missing=sorted(required-student_skills); overlap=len(matched)/len(required) if required else 1.0
        if not eligibility.eligible:
            results.append(Recommendation(student.student_id,job.opportunity_id,False,0.0,tuple(matched),tuple(missing),eligibility.reasons)); continue
        if not 0<=prior_fit<=1: raise ValueError("prior_fit must be in [0, 1]")
        positive=overlap>=0.5
        posterior=bayes_update(prior_fit,skill_likelihood_if_fit if positive else 1-skill_likelihood_if_fit,skill_likelihood_if_not_fit if positive else 1-skill_likelihood_if_not_fit)
        fuzzy={"low":round(triangular_membership(overlap,0,0,0.5),6),"medium":round(triangular_membership(overlap,0.25,0.5,0.75),6),"high":round(triangular_membership(overlap,0.5,1,1),6)}
        score=round(100*(0.65*overlap+0.35*posterior),2)
        explanation=("Hard eligibility: PASS",f"Required skills matched: {len(matched)}/{len(required)}",f"Skill overlap: {overlap:.3f}")
        results.append(Recommendation(student.student_id,job.opportunity_id,True,score,tuple(matched),tuple(missing),explanation,{"prior_fit_assumption":prior_fit,"posterior_fit":round(posterior,6),"skill_overlap":round(overlap,6),"fuzzy_membership":fuzzy}))
    return sorted(results,key=lambda r:(not r.eligible,-r.score,r.opportunity_id))