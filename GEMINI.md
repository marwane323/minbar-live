## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Token Optimization Rules

These rules MUST be followed by all agents and orchestrators to minimize token consumption:

### Code Exploration
- **ALWAYS use graphify first** before reading source files. `graphify query`, `graphify path`, and `graphify explain` cost far fewer tokens than reading full files.
- **Use grep_search** for targeted lookups instead of reading entire files. Search for specific function names, class names, or patterns.
- **Never read entire large files** unless necessary. Use StartLine/EndLine parameters to read only the relevant section.
- **Use list_dir** to check file existence and structure instead of reading files to discover what exists.

### Sub-agent Communication
- **Give sub-agents precise, self-contained prompts** — include all context they need so they don't waste tokens re-reading files.
- **Use flash/flash_lite models** for simple research tasks (file reading, searching). Reserve pro for complex implementation.
- **Kill sub-agents immediately** when done — don't let them idle.

### Testing
- Run tests with `--tb=line` or `--tb=short` to minimize output tokens.
- Use `Select-Object -Last N` in PowerShell to trim verbose output.
- Run per-service tests with targeted PYTHONPATH instead of monolithic runs.

### Documentation
- **Update PROGRESS.md after every agent completes** — future agents read this to know current state.
- **Log ADRs in ISSUES.md** for non-obvious decisions — prevents future agents from re-debating.

## Test Execution

All Python tests require per-service PYTHONPATH setup:
```powershell
# Sprint 1 tests
$env:PYTHONPATH = "C:\Projects\Khutba\minbar-live\src\backend\shared"
python -m pytest tests/ src/backend/shared/tests/ -v --tb=short

# Per-service ML tests (Sprint 2+)
$env:PYTHONPATH = "C:\Projects\Khutba\minbar-live\src\backend\shared;C:\Projects\Khutba\minbar-live\src\backend\<service_name>"
python -m pytest src/backend/<service_name>/tests/ -v --tb=short
```

## Credentials (Dev)
| Service | User | Password |
|---|---|---|
| PostgreSQL | minbar | minbar_dev |
| MinIO | minbar_minio | minbar_minio_secret |
| Seed Admin | admin@al-noor.test | minbar_dev_123 |
| Seed Imam | imam@al-noor.test | minbar_dev_123 |
| JWT Secret | supersecret_default_key_change_in_prod | — |
