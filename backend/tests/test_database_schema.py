from placera_ai.db import Base
from placera_ai import orm_models  # register all tables

def test_required_postgres_tables_and_integrity_constraints_are_declared():
    expected={"student_profiles","skills","student_skills","skill_aliases","opportunities","opportunity_skills","manual_shortlists","recommendation_runs","recommendation_results","rule_firings","calibration_runs","audit_events"}
    assert expected <= set(Base.metadata.tables)
    assert any(c.name=="ck_student_cgpa_range" for c in Base.metadata.tables["student_profiles"].constraints)
    assert any(c.name=="uq_manual_shortlist_pair" for c in Base.metadata.tables["manual_shortlists"].constraints)
    assert "skills" in Base.metadata.tables["student_profiles"].columns
    assert "required_skills" in Base.metadata.tables["opportunities"].columns