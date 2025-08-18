# Free Exercise DB (vendored)

This directory is for a local, vendored copy of the Free Exercise DB dataset to ensure our app works even if the upstream link is unavailable.

- Source repository: https://github.com/yuhonas/free-exercise-db
- Dataset file to vendor: `dist/exercises.json`
- License: Unlicense (public domain). See: https://github.com/yuhonas/free-exercise-db/blob/main/UNLICENSE

We do NOT use git submodules or external pointers. We keep a static JSON file so the app and importer work offline.

## How to fetch and vendor the dataset

Option A — automatic (recommended):

```bash
# from backend/magical-girl-gym-tracker-backend/
python -m src.scripts.import_free_exercise_db --download
```

- Downloads the dataset once from the official repo.
- Saves it to: `src/data/free-exercise-db/exercises.json`.
- Commit that file to the repository to make the app resilient if the upstream link breaks.

Option B — manual:

1. Download `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json`.
2. Save it here as `exercises.json`.
3. Commit the file to the repository.

## How to import into our database

Once the file is present locally:

```bash
# from backend/magical-girl-gym-tracker-backend/
python -m src.scripts.import_free_exercise_db
```

This will insert non-duplicate exercises into our `Exercise` table.

## Mapping notes

- `name` -> `Exercise.name`
- `primaryMuscles[0]` -> `Exercise.muscle_group` (normalized)
- `equipment` -> `Exercise.equipment`
- `level` -> `Exercise.difficulty` ('beginner', 'intermediate', 'advanced')
- `instructions` (list or string) -> `Exercise.description` (string)
- `instructions` (meta) -> `Exercise.instructions` (JSON, includes `source` and `allowed_fields`)
