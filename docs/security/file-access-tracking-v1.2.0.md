# File Access Findings Tracking (v1.2.0)

Scope: Critical "Security / File Access" findings provided on 2026-02-12.
Branch: `codex/security-file-access-v120`

## Status Legend
- `Mitigated`: Code hardened with path validation/normalization before file access.
- `Accepted Risk`: Behavior is intentional and input is not user-controlled request data.
- `Pending`: Not addressed yet.

## Findings

| # | File | Line | Finding | Status | Notes |
|---|------|------|---------|--------|-------|
| 1 | `app/triggers/providers/mqtt/Mqtt.ts` | 104 | `fs.readFile(this.configuration.tls.clientkey)` | Mitigated | Path now validated via `resolveConfiguredPath` before read. |
| 2 | `app/triggers/providers/mqtt/Mqtt.ts` | 107 | `fs.readFile(this.configuration.tls.clientcert)` | Mitigated | Path now validated via `resolveConfiguredPath` before read. |
| 3 | `app/triggers/providers/mqtt/Mqtt.ts` | 110 | `fs.readFile(this.configuration.tls.cachain)` | Mitigated | Path now validated via `resolveConfiguredPath` before read. |
| 4 | `app/store/index.ts` | 77 | `fs.existsSync(storePath) && fs.existsSync(legacyPath)` | Mitigated | Store paths are now normalized and derived from validated config inputs. |
| 5 | `app/store/index.ts` | 79 | `fs.renameSync(legacyPath, storePath)` | Mitigated | Migration source/target now resolved under validated store directory. |
| 6 | `app/store/index.ts` | 83 | `fs.existsSync(configuration.path)` | Mitigated | Uses normalized `storeDirectory` instead of raw config path. |
| 7 | `app/store/index.ts` | 85 | `fs.mkdirSync(configuration.path)` | Mitigated | Uses normalized `storeDirectory` instead of raw config path. |
| 8 | `app/watchers/providers/docker/Docker.ts` | 1104 | `fs.readFileSync(this.configuration.cafile)` | Mitigated | TLS file path now validated via `resolveConfiguredPath`. |
| 9 | `app/watchers/providers/docker/Docker.ts` | 1107 | `fs.readFileSync(this.configuration.certfile)` | Mitigated | TLS file path now validated via `resolveConfiguredPath`. |
| 10 | `app/watchers/providers/docker/Docker.ts` | 1110 | `fs.readFileSync(this.configuration.keyfile)` | Mitigated | TLS file path now validated via `resolveConfiguredPath`. |
| 11 | `app/runtime/paths.ts` | 27 | `fs.statSync(candidate).isDirectory()` | Accepted Risk | Candidate paths are internally generated runtime-location probes, not request/user payloads. |

## Implemented Hardening

- Added path-safety utilities in `app/runtime/paths.ts`:
  - `resolveConfiguredPath(...)`
  - `resolveConfiguredPathWithinBase(...)`
- Applied these checks in:
  - `app/store/index.ts`
  - `app/triggers/providers/mqtt/Mqtt.ts`
  - `app/watchers/providers/docker/Docker.ts`
- Added unit coverage for new path helpers in:
  - `app/runtime/paths.test.ts`

## Next Verification Step

- Re-run code scanning on this branch and confirm whether File Access findings are cleared or reduced to accepted-risk items.
