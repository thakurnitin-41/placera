import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from placera_ai.api import app, get_db
from placera_ai.db import Base
from placera_ai import orm_models

engine=create_engine("sqlite+pysqlite:///:memory:",connect_args={"check_same_thread":False},poolclass=StaticPool)
TestingSessionLocal=sessionmaker(bind=engine,autoflush=False,expire_on_commit=False)
Base.metadata.create_all(bind=engine)
def override_get_db():
    db=TestingSessionLocal()
    try: yield db
    finally: db.close()
app.dependency_overrides[get_db]=override_get_db
client=TestClient(app)
@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)
    yield

def test_profile_and_opportunity_are_persisted():
    s=client.post("/api/students",json={"student_id":"S-1","name":"Test Student","cgpa":8.1,"branch":"CSE","skills":["Python"]})
    assert s.status_code==201 and s.json()["skills"]==["Python"]
    j=client.post("/api/opportunities",json={"opportunity_id":"J-1","title":"Python Engineer","minimum_cgpa":7.0,"eligible_branches":["CSE"],"required_skills":["Python"]})
    assert j.status_code==201
    assert client.get("/api/students").json()["items"][0]["student_id"]=="S-1"
    assert client.get("/api/opportunities").json()["items"][0]["opportunity_id"]=="J-1"

def test_recommendation_run_can_be_read_back_and_has_no_fabricated_metrics():
    payload={"student":{"student_id":"S-2","name":"Candidate","cgpa":8.2,"branch":"CSE","skills":["Python","SQL"]},"opportunities":[{"opportunity_id":"J-good","title":"Good fit","minimum_cgpa":7.5,"eligible_branches":["CSE"],"required_skills":["Python","SQL"]},{"opportunity_id":"J-bad","title":"Blocked","minimum_cgpa":9.5,"eligible_branches":["CSE"],"required_skills":["Python"]}]}
    response=client.post("/api/recommendations",json=payload)
    assert response.status_code==200,response.text
    run_id=response.json()["run_id"]
    saved=client.get(f"/api/recommendation-runs/{run_id}")
    assert saved.status_code==200 and len(saved.json()["results"])==2
    assert saved.json()["results"][0]["opportunity_id"]=="J-good"
    metrics=client.get("/api/validation/metrics",params={"run_id":run_id})
    assert metrics.status_code==200 and metrics.json()["status"]=="unavailable"

def test_shortlist_label_requires_existing_records():
    response=client.post("/api/validation/labels",json={"student_id":"missing","opportunity_id":"missing","label":True})
    assert response.status_code==404
