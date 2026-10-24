"""FastAPI endpoints with PostgreSQL-backed profile, opportunity and run persistence.

No authentication is implemented in this milestone. Do not expose write endpoints publicly
until authentication, authorization, rate limits and privacy controls are added.
"""
from functools import lru_cache
from uuid import uuid4
from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from .db import make_session_factory
from .models import Opportunity, StudentProfile
from .orm_models import ManualShortlistRecord, OpportunityRecord, RecommendationResultRecord, RecommendationRunRecord, StudentRecord
from .pipeline import recommend

app=FastAPI(title="Placera AI PBL API",version="0.2.0")

class StudentInput(BaseModel):
    student_id: str=Field(min_length=1,max_length=64)
    name: str=Field(default="Student",min_length=1,max_length=160)
    cgpa: float=Field(ge=0,le=10)
    branch: str=Field(min_length=1,max_length=64)
    active_backlogs: int=Field(default=0,ge=0)
    graduation_year: int|None=None
    skills: list[str]=Field(default_factory=list)
    projects: list[str]=Field(default_factory=list)

class OpportunityInput(BaseModel):
    opportunity_id: str=Field(min_length=1,max_length=64)
    title: str=Field(min_length=1,max_length=200)
    company: str|None=None
    minimum_cgpa: float=Field(ge=0,le=10)
    eligible_branches: list[str]
    required_skills: list[str]=Field(default_factory=list)
    max_active_backlogs: int=Field(default=0,ge=0)
    eligible_graduation_years: list[int]|None=None
    seats: int=Field(default=1,ge=0)
    source: str=Field(default="synthetic",pattern="^(synthetic|manual|imported)$")

class RecommendationRequest(BaseModel):
    student: StudentInput
    opportunities: list[OpportunityInput]=Field(min_length=1,max_length=500)
    dataset_version: str=Field(default="demo-v1",min_length=1,max_length=80)

class ShortlistLabelInput(BaseModel):
    student_id: str
    opportunity_id: str
    label: bool
    reviewer: str|None=None
    dataset_split: str=Field(default="unassigned",pattern="^(unassigned|train|calibration|test)$")
    source_note: str|None=None

def get_db():
    try:
        factory,_engine=_factory()
    except RuntimeError as exc:
        raise HTTPException(status_code=503,detail="PostgreSQL is not configured. Set DATABASE_URL and apply the migration.") from exc
    db=factory()
    try:
        yield db
    finally:
        db.close()

@lru_cache(maxsize=4)
def _factory():
    return make_session_factory()

@app.get("/health")
def health():
    try:
        factory,engine=_factory()
        with engine.connect() as connection: connection.execute(text("SELECT 1"))
        return {"status":"ok","database":"connected"}
    except Exception:
        return {"status":"degraded","database":"unavailable","note":"Configure DATABASE_URL and apply Alembic migrations."}

def _student_record(payload: StudentInput, db: Session):
    record=db.get(StudentRecord,payload.student_id)
    if record is None:
        record=StudentRecord(student_id=payload.student_id,name=payload.name,cgpa=payload.cgpa,branch=payload.branch)
        db.add(record)
    record.name=payload.name; record.cgpa=payload.cgpa; record.branch=payload.branch
    record.active_backlogs=payload.active_backlogs; record.graduation_year=payload.graduation_year
    record.skills=list(dict.fromkeys(payload.skills)); record.projects=list(payload.projects)
    return record

def _opportunity_record(payload: OpportunityInput, db: Session):
    record=db.get(OpportunityRecord,payload.opportunity_id)
    if record is None:
        record=OpportunityRecord(opportunity_id=payload.opportunity_id,title=payload.title,minimum_cgpa=payload.minimum_cgpa,eligible_branches=payload.eligible_branches)
        db.add(record)
    record.title=payload.title; record.company=payload.company; record.minimum_cgpa=payload.minimum_cgpa
    record.eligible_branches=list(dict.fromkeys(payload.eligible_branches)); record.required_skills=list(dict.fromkeys(payload.required_skills))
    record.max_active_backlogs=payload.max_active_backlogs; record.eligible_graduation_years=payload.eligible_graduation_years
    record.seats=payload.seats; record.source=payload.source
    return record

@app.post("/api/students",status_code=201)
def save_student(payload: StudentInput, db: Session=Depends(get_db)):
    record=_student_record(payload,db)
    try:
        db.commit(); db.refresh(record)
    except SQLAlchemyError as exc:
        db.rollback(); raise HTTPException(status_code=409,detail="Could not save student profile; verify unique identifiers and database schema.") from exc
    return {"student_id":record.student_id,"name":record.name,"cgpa":record.cgpa,"branch":record.branch,"active_backlogs":record.active_backlogs,"graduation_year":record.graduation_year,"skills":record.skills,"projects":record.projects}

@app.get("/api/students")
def list_students(limit: int=Query(default=100,ge=1,le=500), db: Session=Depends(get_db)):
    rows=db.scalars(select(StudentRecord).order_by(StudentRecord.student_id).limit(limit)).all()
    return {"items":[{"student_id":r.student_id,"name":r.name,"cgpa":r.cgpa,"branch":r.branch,"active_backlogs":r.active_backlogs,"graduation_year":r.graduation_year,"skills":r.skills,"projects":r.projects} for r in rows]}

@app.post("/api/opportunities",status_code=201)
def save_opportunity(payload: OpportunityInput, db: Session=Depends(get_db)):
    record=_opportunity_record(payload,db)
    try:
        db.commit(); db.refresh(record)
    except SQLAlchemyError as exc:
        db.rollback(); raise HTTPException(status_code=409,detail="Could not save opportunity; verify database schema and constraints.") from exc
    return {"opportunity_id":record.opportunity_id,"title":record.title,"company":record.company,"minimum_cgpa":record.minimum_cgpa,"eligible_branches":record.eligible_branches,"required_skills":record.required_skills,"source":record.source}

@app.get("/api/opportunities")
def list_opportunities(limit: int=Query(default=100,ge=1,le=500), db: Session=Depends(get_db)):
    rows=db.scalars(select(OpportunityRecord).order_by(OpportunityRecord.opportunity_id).limit(limit)).all()
    return {"items":[{"opportunity_id":r.opportunity_id,"title":r.title,"company":r.company,"minimum_cgpa":r.minimum_cgpa,"eligible_branches":r.eligible_branches,"required_skills":r.required_skills,"max_active_backlogs":r.max_active_backlogs,"eligible_graduation_years":r.eligible_graduation_years,"seats":r.seats,"source":r.source} for r in rows]}

@app.post("/api/recommendations")
def create_recommendations(request: RecommendationRequest, db: Session=Depends(get_db)):
    try:
        _student_record(request.student,db)
        job_records=[_opportunity_record(job,db) for job in request.opportunities]
        student=StudentProfile(request.student.student_id,request.student.cgpa,request.student.branch,request.student.active_backlogs,request.student.graduation_year,frozenset(request.student.skills),tuple(request.student.projects))
        jobs=[Opportunity(j.opportunity_id,j.title,j.minimum_cgpa,frozenset(j.eligible_branches),frozenset(j.required_skills),j.max_active_backlogs,frozenset(j.eligible_graduation_years) if j.eligible_graduation_years is not None else None,j.seats) for j in request.opportunities]
        results=recommend(student,jobs)
        run_id=str(uuid4())
        db.add(RecommendationRunRecord(run_id=run_id,algorithm_version="0.2.0",parameters={"prior_fit":0.30,"skill_likelihood_if_fit":0.80,"skill_likelihood_if_not_fit":0.35},dataset_version=request.dataset_version,validation_status="not_evaluated_against_labeled_data"))
        db.flush()
        for result in results:
            db.add(RecommendationResultRecord(run_id=run_id,student_id=result.student_id,opportunity_id=result.opportunity_id,eligible=result.eligible,score=result.score,matched_skills=list(result.matched_skills),missing_skills=list(result.missing_skills),explanation=list(result.explanation),uncertainty=dict(result.uncertainty)))
        db.commit()
        return {"run_id":run_id,"algorithm_version":"0.2.0","dataset_version":request.dataset_version,"validation_status":"not_evaluated_against_labeled_data","results":[r.__dict__ for r in results]}
    except SQLAlchemyError as exc:
        db.rollback(); raise HTTPException(status_code=409,detail="Could not persist recommendation run; check migrations and referential integrity.") from exc
    except ValueError as exc:
        db.rollback(); raise HTTPException(status_code=422,detail=str(exc)) from exc

@app.get("/api/recommendation-runs/{run_id}")
def get_recommendation_run(run_id: str, db: Session=Depends(get_db)):
    run=db.get(RecommendationRunRecord,run_id)
    if run is None: raise HTTPException(status_code=404,detail="Recommendation run not found")
    rows=db.scalars(select(RecommendationResultRecord).where(RecommendationResultRecord.run_id==run_id).order_by(RecommendationResultRecord.score.desc())).all()
    return {"run_id":run.run_id,"algorithm_version":run.algorithm_version,"dataset_version":run.dataset_version,"parameters":run.parameters,"validation_status":run.validation_status,"results":[{"student_id":r.student_id,"opportunity_id":r.opportunity_id,"eligible":r.eligible,"score":r.score,"matched_skills":r.matched_skills,"missing_skills":r.missing_skills,"explanation":r.explanation,"uncertainty":r.uncertainty} for r in rows]}

@app.post("/api/validation/labels",status_code=201)
def save_shortlist_label(payload: ShortlistLabelInput, db: Session=Depends(get_db)):
    if db.get(StudentRecord,payload.student_id) is None: raise HTTPException(status_code=404,detail="Student profile not found")
    if db.get(OpportunityRecord,payload.opportunity_id) is None: raise HTTPException(status_code=404,detail="Opportunity not found")
    row=db.scalar(select(ManualShortlistRecord).where(ManualShortlistRecord.student_id==payload.student_id,ManualShortlistRecord.opportunity_id==payload.opportunity_id))
    if row is None:
        row=ManualShortlistRecord(student_id=payload.student_id,opportunity_id=payload.opportunity_id,label=payload.label)
        db.add(row)
    row.label=payload.label; row.reviewer=payload.reviewer; row.dataset_split=payload.dataset_split; row.source_note=payload.source_note
    try: db.commit()
    except SQLAlchemyError as exc:
        db.rollback(); raise HTTPException(status_code=409,detail="Could not save shortlist label.") from exc
    return {"student_id":row.student_id,"opportunity_id":row.opportunity_id,"label":row.label,"dataset_split":row.dataset_split}

@app.get("/api/validation/metrics")
def validation_metrics(run_id: str, db: Session=Depends(get_db)):
    run=db.get(RecommendationRunRecord,run_id)
    if run is None: raise HTTPException(status_code=404,detail="Recommendation run not found")
    labels=db.scalars(select(ManualShortlistRecord).where(ManualShortlistRecord.dataset_split=="test")).all()
    if not labels:
        return {"run_id":run_id,"status":"unavailable","reason":"No coordinator-labelled test-set shortlist pairs exist yet.","label_count":0,"precision":None,"recall":None}
    predictions={ (r.student_id,r.opportunity_id):bool(r.eligible and r.score>=50) for r in db.scalars(select(RecommendationResultRecord).where(RecommendationResultRecord.run_id==run_id)).all() }
    pairs=[(bool(label.label),predictions.get((label.student_id,label.opportunity_id),False)) for label in labels]
    tp=sum(y and p for y,p in pairs); fp=sum((not y) and p for y,p in pairs); fn=sum(y and (not p) for y,p in pairs)
    return {"run_id":run_id,"status":"measured_on_labelled_test_split","label_count":len(pairs),"threshold":50,"true_positive":tp,"false_positive":fp,"false_negative":fn,"precision":tp/(tp+fp) if tp+fp else None,"recall":tp/(tp+fn) if tp+fn else None,"note":"Metrics are meaningful only when labels are independent of this run and the threshold was selected before examining the test split."}
