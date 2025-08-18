import os
import sys
import json
import argparse
from typing import List, Dict, Any

# Ensure project root is on sys.path when executed directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

try:
    import requests  # type: ignore
except Exception as e:
    requests = None  # Download mode will error if requests is unavailable

from src.main import app  # creates app and initializes DB on import
from src.models.user import db
from src.models.exercise import Exercise

REMOTE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
DEFAULT_LOCAL_PATH = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "data", "free-exercise-db", "exercises.json")
)

MUSCLE_MAP = {
    # Upper body
    "biceps": "Biceps",
    "triceps": "Triceps",
    "forearms": "Forearms",
    "chest": "Chest",
    "pectoralis": "Chest",
    "lats": "Lats",
    "latissimus dorsi": "Lats",
    "trapezius": "Traps",
    "traps": "Traps",
    "delts": "Shoulders",
    "deltoids": "Shoulders",
    "deltoid": "Shoulders",
    "shoulders": "Shoulders",
    # Core / back
    "core": "Core",
    "abdominals": "Core",
    "abs": "Core",
    "obliques": "Obliques",
    "lower back": "Lower Back",
    "back": "Back",
    # Lower body
    "quadriceps": "Quadriceps",
    "quads": "Quadriceps",
    "hamstrings": "Hamstrings",
    "glutes": "Glutes",
    "calves": "Calves",
    "hip adductors": "Hip Adductors",
    "adductors": "Hip Adductors",
    "hip abductors": "Hip Abductors",
    "abductors": "Hip Abductors",
    # Misc
    "neck": "Neck",
    "full body": "Full Body",
    "cardio": "Cardio",
}


def norm_muscle(name: str | None) -> str:
    if not name:
        return "Other"
    key = name.strip().lower()
    return MUSCLE_MAP.get(key, name.strip().title())


def guess_allowed_fields(entry: Dict[str, Any]) -> List[str]:
    category = (entry.get("category") or "").strip().lower()
    # Heuristic: cardio => duration+distance; otherwise reps+weight
    if category in {"cardio"}:
        return ["duration", "distance"]
    return ["reps", "weight"]


def stringify_instructions(entry: Dict[str, Any]) -> str | None:
    instr = entry.get("instructions")
    if isinstance(instr, list):
        return "\n".join([str(x).strip() for x in instr if str(x).strip()]) or None
    if isinstance(instr, str):
        return instr.strip() or None
    return None


def load_dataset(local_path: str | None, download: bool) -> List[Dict[str, Any]]:
    # Prefer explicit local path
    if local_path and os.path.exists(local_path):
        with open(local_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Fallback to default vendored location
    if os.path.exists(DEFAULT_LOCAL_PATH):
        with open(DEFAULT_LOCAL_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    # Optionally download if allowed
    if download:
        if requests is None:
            raise RuntimeError("'requests' not installed. Add it to requirements and try again.")
        print(f"Downloading dataset from {REMOTE_URL} ...")
        resp = requests.get(REMOTE_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # Persist to default location for offline reuse
        os.makedirs(os.path.dirname(DEFAULT_LOCAL_PATH), exist_ok=True)
        with open(DEFAULT_LOCAL_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f)
        print(f"Saved dataset to {DEFAULT_LOCAL_PATH}")
        return data

    raise FileNotFoundError(
        "Free Exercise DB not found locally. Provide --local path or use --download to fetch once."
    )


def import_exercises(data: List[Dict[str, Any]], commit_every: int = 200) -> dict:
    inserted_count = 0
    skipped_dupe = 0
    updated_difficulty = 0
    for i, entry in enumerate(data, start=1):
        name = (entry.get("name") or "").strip()
        if not name:
            continue

        # Update difficulty for existing by exact name match, then skip insert
        existing = Exercise.query.filter_by(name=name).first()
        if existing:
            _lvl = (entry.get("level") or "").strip().lower()
            if _lvl in {"beginner", "intermediate", "advanced"} and not (existing.difficulty and existing.difficulty.strip()):
                existing.difficulty = _lvl
                updated_difficulty += 1
            skipped_dupe += 1
            continue

        primary = None
        prim_list = entry.get("primaryMuscles")
        if isinstance(prim_list, list) and prim_list:
            primary = prim_list[0]

        exercise = Exercise(
            name=name,
            description=stringify_instructions(entry),
            muscle_group=norm_muscle(primary),
            equipment=(entry.get("equipment") or None),
            difficulty=((entry.get("level") or "").strip().lower() if (entry.get("level") or "").strip().lower() in {"beginner","intermediate","advanced"} else None),
            instructions=json.dumps({
                "source": "free-exercise-db",
                "allowed_fields": guess_allowed_fields(entry),
            }),
            is_custom=False,
            created_by=None,
        )
        db.session.add(exercise)
        inserted_count += 1

        if i % commit_every == 0:
            db.session.flush()
            db.session.commit()
            print(f"Committed batch at {i} records...")

    db.session.commit()
    return {"inserted": inserted_count, "skipped_dupe": skipped_dupe, "updated_difficulty": updated_difficulty}


def main():
    parser = argparse.ArgumentParser(description="Import Free Exercise DB into local database.")
    parser.add_argument("--local", dest="local", default=None, help="Path to vendored exercises.json (optional)")
    parser.add_argument(
        "--download",
        action="store_true",
        help="Download dataset from upstream (saved locally for future runs)",
    )
    args = parser.parse_args()

    with app.app_context():
        data = load_dataset(args.local, args.download)
        print(f"Loaded {len(data)} entries from dataset.")
        summary = import_exercises(data)
        print("Import finished:")
        print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
