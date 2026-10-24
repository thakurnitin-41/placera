"""Dependency-free domain models shared by algorithms."""
from dataclasses import dataclass, field
from typing import Any

@dataclass(frozen=True)
class StudentProfile:
    student_id: str
    cgpa: float
    branch: str
    active_backlogs: int = 0
    graduation_year: int | None = None
    skills: frozenset[str] = frozenset()
    projects: tuple[str, ...] = ()

@dataclass(frozen=True)
class Opportunity:
    opportunity_id: str
    title: str
    minimum_cgpa: float
    eligible_branches: frozenset[str]
    required_skills: frozenset[str] = frozenset()
    max_active_backlogs: int = 0
    eligible_graduation_years: frozenset[int] | None = None
    seats: int = 1

@dataclass(frozen=True)
class EligibilityResult:
    eligible: bool
    checks: dict[str, bool]
    reasons: tuple[str, ...]

@dataclass(frozen=True)
class Recommendation:
    student_id: str
    opportunity_id: str
    eligible: bool
    score: float
    matched_skills: tuple[str, ...] = ()
    missing_skills: tuple[str, ...] = ()
    explanation: tuple[str, ...] = ()
    uncertainty: dict[str, Any] = field(default_factory=dict)