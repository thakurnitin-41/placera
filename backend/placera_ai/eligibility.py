"""Hard constraints must run before soft ranking."""
from .models import EligibilityResult, Opportunity, StudentProfile

def evaluate_eligibility(student: StudentProfile, opportunity: Opportunity) -> EligibilityResult:
    checks = {
        "cgpa": student.cgpa >= opportunity.minimum_cgpa,
        "branch": student.branch.strip().casefold() in {b.strip().casefold() for b in opportunity.eligible_branches},
        "backlogs": student.active_backlogs <= opportunity.max_active_backlogs,
        "graduation_year": opportunity.eligible_graduation_years is None or (student.graduation_year is not None and student.graduation_year in opportunity.eligible_graduation_years),
    }
    reasons = []
    if not checks["cgpa"]: reasons.append(f"CGPA {student.cgpa:.2f} is below the {opportunity.minimum_cgpa:.2f} cutoff")
    if not checks["branch"]: reasons.append(f"Branch {student.branch!r} is not eligible")
    if not checks["backlogs"]: reasons.append(f"{student.active_backlogs} active backlog(s) exceed the allowed {opportunity.max_active_backlogs}")
    if not checks["graduation_year"]: reasons.append("Graduation year is not in the configured intake years")
    if not reasons: reasons.append("All configured hard eligibility constraints passed")
    return EligibilityResult(all(checks.values()), checks, tuple(reasons))