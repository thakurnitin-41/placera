"""PostgreSQL persistence schema. JSON fields preserve versioned algorithm traces."""
from datetime import datetime, timezone
from sqlalchemy import Boolean, CheckConstraint, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

def utcnow(): return datetime.now(timezone.utc)

class StudentRecord(Base):
    __tablename__="student_profiles"
    student_id: Mapped[str]=mapped_column(String(64),primary_key=True)
    name: Mapped[str]=mapped_column(String(160),nullable=False,default="Student")
    cgpa: Mapped[float]=mapped_column(Float,nullable=False)
    branch: Mapped[str]=mapped_column(String(64),nullable=False,index=True)
    active_backlogs: Mapped[int]=mapped_column(Integer,nullable=False,default=0)
    graduation_year: Mapped[int|None]=mapped_column(Integer)
    skills: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    projects: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,onupdate=utcnow,nullable=False)
    __table_args__=(CheckConstraint("cgpa >= 0 AND cgpa <= 10",name="ck_student_cgpa_range"),CheckConstraint("active_backlogs >= 0",name="ck_student_backlogs_nonnegative"))

class SkillRecord(Base):
    __tablename__="skills"
    skill_id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    canonical_name: Mapped[str]=mapped_column(String(120),unique=True,nullable=False)
    description: Mapped[str|None]=mapped_column(Text)

class StudentSkillRecord(Base):
    __tablename__="student_skills"
    student_id: Mapped[str]=mapped_column(ForeignKey("student_profiles.student_id",ondelete="CASCADE"),primary_key=True)
    skill_id: Mapped[int]=mapped_column(ForeignKey("skills.skill_id",ondelete="CASCADE"),primary_key=True)
    proficiency: Mapped[float|None]=mapped_column(Float)
    evidence: Mapped[str|None]=mapped_column(Text)
    __table_args__=(CheckConstraint("proficiency IS NULL OR (proficiency >= 0 AND proficiency <= 1)",name="ck_student_skill_proficiency"),)

class SkillAliasRecord(Base):
    __tablename__="skill_aliases"
    alias: Mapped[str]=mapped_column(String(120),primary_key=True)
    skill_id: Mapped[int]=mapped_column(ForeignKey("skills.skill_id",ondelete="CASCADE"),nullable=False,index=True)

class OpportunityRecord(Base):
    __tablename__="opportunities"
    opportunity_id: Mapped[str]=mapped_column(String(64),primary_key=True)
    title: Mapped[str]=mapped_column(String(200),nullable=False)
    company: Mapped[str|None]=mapped_column(String(200))
    minimum_cgpa: Mapped[float]=mapped_column(Float,nullable=False,default=0)
    eligible_branches: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    max_active_backlogs: Mapped[int]=mapped_column(Integer,nullable=False,default=0)
    eligible_graduation_years: Mapped[list|None]=mapped_column(JSON)
    required_skills: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    seats: Mapped[int]=mapped_column(Integer,nullable=False,default=1)
    source: Mapped[str]=mapped_column(String(40),nullable=False,default="synthetic")
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)
    __table_args__=(CheckConstraint("minimum_cgpa >= 0 AND minimum_cgpa <= 10",name="ck_opportunity_cgpa_range"),CheckConstraint("max_active_backlogs >= 0",name="ck_opportunity_backlogs_nonnegative"),CheckConstraint("seats >= 0",name="ck_opportunity_seats_nonnegative"))

class OpportunitySkillRecord(Base):
    __tablename__="opportunity_skills"
    opportunity_id: Mapped[str]=mapped_column(ForeignKey("opportunities.opportunity_id",ondelete="CASCADE"),primary_key=True)
    skill_id: Mapped[int]=mapped_column(ForeignKey("skills.skill_id",ondelete="CASCADE"),primary_key=True)
    weight: Mapped[float]=mapped_column(Float,nullable=False,default=1.0)
    required: Mapped[bool]=mapped_column(Boolean,nullable=False,default=True)
    __table_args__=(CheckConstraint("weight >= 0",name="ck_opportunity_skill_weight"),)

class ManualShortlistRecord(Base):
    __tablename__="manual_shortlists"
    shortlist_id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    student_id: Mapped[str]=mapped_column(ForeignKey("student_profiles.student_id",ondelete="CASCADE"),nullable=False)
    opportunity_id: Mapped[str]=mapped_column(ForeignKey("opportunities.opportunity_id",ondelete="CASCADE"),nullable=False)
    label: Mapped[bool]=mapped_column(Boolean,nullable=False)
    reviewer: Mapped[str|None]=mapped_column(String(120))
    dataset_split: Mapped[str]=mapped_column(String(20),nullable=False,default="unassigned")
    source_note: Mapped[str|None]=mapped_column(Text)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)
    __table_args__=(UniqueConstraint("student_id","opportunity_id",name="uq_manual_shortlist_pair"),CheckConstraint("dataset_split IN ('unassigned','train','calibration','test')",name="ck_shortlist_split"))

class RecommendationRunRecord(Base):
    __tablename__="recommendation_runs"
    run_id: Mapped[str]=mapped_column(String(64),primary_key=True)
    algorithm_version: Mapped[str]=mapped_column(String(40),nullable=False)
    parameters: Mapped[dict]=mapped_column(JSON,nullable=False,default=dict)
    dataset_version: Mapped[str]=mapped_column(String(80),nullable=False)
    validation_status: Mapped[str]=mapped_column(String(50),nullable=False,default="not_evaluated")
    started_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)

class RecommendationResultRecord(Base):
    __tablename__="recommendation_results"
    result_id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    run_id: Mapped[str]=mapped_column(ForeignKey("recommendation_runs.run_id",ondelete="CASCADE"),nullable=False)
    student_id: Mapped[str]=mapped_column(ForeignKey("student_profiles.student_id",ondelete="CASCADE"),nullable=False)
    opportunity_id: Mapped[str]=mapped_column(ForeignKey("opportunities.opportunity_id",ondelete="CASCADE"),nullable=False)
    eligible: Mapped[bool]=mapped_column(Boolean,nullable=False)
    score: Mapped[float]=mapped_column(Float,nullable=False)
    matched_skills: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    missing_skills: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    explanation: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    uncertainty: Mapped[dict]=mapped_column(JSON,nullable=False,default=dict)
    __table_args__=(UniqueConstraint("run_id","student_id","opportunity_id",name="uq_recommendation_pair_per_run"),CheckConstraint("score >= 0 AND score <= 100",name="ck_recommendation_score_range"))

class RuleFiringRecord(Base):
    __tablename__="rule_firings"
    firing_id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    result_id: Mapped[int]=mapped_column(ForeignKey("recommendation_results.result_id",ondelete="CASCADE"),nullable=False,index=True)
    rule_id: Mapped[str]=mapped_column(String(80),nullable=False)
    matched_facts: Mapped[list]=mapped_column(JSON,nullable=False,default=list)
    conclusion: Mapped[str]=mapped_column(Text,nullable=False)

class CalibrationRunRecord(Base):
    __tablename__="calibration_runs"
    calibration_id: Mapped[str]=mapped_column(String(64),primary_key=True)
    dataset_version: Mapped[str]=mapped_column(String(80),nullable=False)
    split_definition: Mapped[dict]=mapped_column(JSON,nullable=False)
    parameters_before: Mapped[dict]=mapped_column(JSON,nullable=False)
    parameters_after: Mapped[dict]=mapped_column(JSON,nullable=False)
    metrics: Mapped[dict]=mapped_column(JSON,nullable=False)
    label_count: Mapped[int]=mapped_column(Integer,nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)
    __table_args__=(CheckConstraint("label_count >= 0",name="ck_calibration_label_count"),)

class AuditEventRecord(Base):
    __tablename__="audit_events"
    event_id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    actor: Mapped[str|None]=mapped_column(String(120))
    action: Mapped[str]=mapped_column(String(100),nullable=False)
    entity_type: Mapped[str]=mapped_column(String(100),nullable=False)
    entity_id: Mapped[str|None]=mapped_column(String(100))
    details: Mapped[dict]=mapped_column(JSON,nullable=False,default=dict)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)