"""Minimal FastAPI boundary for deterministic recommendation execution."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from .models import Opportunity, StudentProfile
from .pipeline import recommend
app=FastAPI(title="Placera AI PBL API",version="0.1.0")
class StudentInput(BaseModel):
    student_id: str
    cgpa: float=Field(ge=0,le=10)
    branch: str=Field(min_length=1)
    active_backlogs: int=Field(default=0,ge=0)
    graduation_year: int|None=None
    skills: list[str]=Field(default_factory=list)
class OpportunityInput(BaseModel):
    opportunity_id: str
    title: str
    minimum_cgpa: float=Field(ge=0,le=10)
    eligible_branches: list[str]
    required_skills: list[str]=Field(default_factory=list)
    max_active_backlogs: int=Field(default=0,ge=0)
    eligible_graduation_years: list[int]|None=None
    seats: int=Field(default=1,ge=0)
class RecommendationRequest(BaseModel):
    student: StudentInput
    opportunities: list[OpportunityInput]
@app.get("/health")
def health(): return {"status":"ok","database":"not_checked","note":"Algorithm API health only; PostgreSQL is not checked."}
@app.post("/api/recommendations")
def recommendations(request: RecommendationRequest):
    student=StudentProfile(request.student.student_id,request.student.cgpa,request.student.branch,request.student.active_backlogs,request.student.graduation_year,frozenset(request.student.skills))
    jobs=[Opportunity(j.opportunity_id,j.title,j.minimum_cgpa,frozenset(j.eligible_branches),frozenset(j.required_skills),j.max_active_backlogs,frozenset(j.eligible_graduation_years) if j.eligible_graduation_years is not None else None,j.seats) for j in request.opportunities]
    try: results=recommend(student,jobs)
    except ValueError as exc: raise HTTPException(status_code=422,detail=str(exc)) from exc
    return {"results":[r.__dict__ for r in results],"validation_status":"not_evaluated_against_labeled_data"}