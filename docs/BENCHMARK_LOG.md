# Benchmark Log

This file records concrete validation runs that are useful for future routing,
tracking, and metacognitive changes. Keep entries public-safe: do not include
secrets, private keys, private URLs beyond already public-safe project patterns,
or unreleased commercial strategy.

## 2026-07-10 -- Windows PyCharm Supabase tracking smoke test

- **Environment:** Windows PowerShell in PyCharm
- **Branch state:** `main` up to date with `origin/main`
- **Node:** `v24.13.1`
- **pnpm:** `9.0.0`
- **Install:** `pnpm install` completed with lockfile already up to date
- **Build:** `pnpm build` completed with 3 successful Turborepo tasks
- **Runtime command:** `pnpm example`
- **Supabase tracking:** enabled through `.env`

### Observed route progression

| Run | Total routes | Routes with feedback | Route ID present | Correctness | Avg rating | Trend |
|-----|--------------|----------------------|------------------|-------------|------------|-------|
| 1 | 2 | 2 | yes | 100% | 5.0 | no-data |
| 2 | 3 | 3 | yes | 100% | 5.0 | no-data |
| 3 | 4 | 4 | yes | 100% | 5.0 | no-data |
| 4 | 5 | 5 | yes | 100% | 5.0 | no-data |
| 5 | 6 | 6 | yes | 100% | 5.0 | stable |

### Latest observed aggregate

- **Loadout:** `software-engineering`
- **Samples:** 6
- **Average confidence:** 100%
- **Average latency:** 1666ms
- **Correctness:** 100%
- **Average rating:** 5.0
- **Trend:** stable
- **Recommendation:** collect more feedback (6/10 minimum) before trusting
recommendations

### Interpretation

The local PyCharm instance is synchronized with the remote repository, the build
is healthy, Supabase writes are working, feedback is persisted, and the analyzer
starts producing a stable trend once enough splitable samples exist.

The next useful validation milestone is **10 feedback entries**, because the
analyzer recommendation currently treats fewer than 10 feedback entries as too
early for trusted recommendations.

### Follow-up

After reaching 10+ feedback entries, the next implementation priority remains
connecting dynamic routing weights to `LoadoutRouter`, as documented in
`docs/NEXT_STEPS.md`.
