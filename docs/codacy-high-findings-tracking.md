# Codacy High Findings Tracking

Status: completed
Branch: `codex/tracking-dock`
Worktree: `/Users/sbenson/code/drydock-tracking-dock`
Mode: file-by-file manual fixes (no bulk rewrite scripts)

## Workflow
- [x] Create dedicated worktree/branch for isolation
- [x] Create tracking document
- [x] Install Codacy CLI (`codacy-cli`) in local environment
- [x] Work through files one-by-one from the provided HIGH findings
- [x] Re-run app/ui lint+test slices to validate touched areas

## File Queue
- [x] `ui/src/components/ContainerRollback.ts`
- [x] `app/watchers/providers/docker/maintenance.test.ts`
- [x] `app/prometheus/container-actions.test.ts`
- [x] `ui/src/services/sse.ts`
- [x] `app/store/audit.test.ts`
- [x] `app/prometheus/container-actions.ts`
- [x] `app/api/container-actions.ts`
- [x] `app/api/group.ts`
- [x] `app/triggers/providers/docker/HealthMonitor.test.ts`
- [x] `app/api/sse.ts`
- [x] `app/api/preview.test.ts`
- [x] `app/api/webhook.ts`
- [x] `app/store/audit.ts`
- [x] `ui/src/views/MonitoringHistoryView.ts`
- [x] `app/log/buffer-stream-unit.test.ts`
- [x] `app/triggers/hooks/HookRunner.test.ts`
- [x] `app/event/index.audit.test.ts`
- [x] `app/api/preview.ts`
- [x] `app/store/backup.ts`
- [x] `app/api/backup.test.ts`
- [x] `app/api/docker-trigger.ts`
- [x] `ui/src/services/backup.ts`
- [x] `ui/src/services/audit.ts`
- [x] `app/watchers/providers/docker/maintenance.ts`
- [x] `app/prometheus/audit.ts`
- [x] `app/prometheus/webhook.ts`
- [x] `app/api/audit-events.test.ts`
- [x] `ui/src/components/ContainerPreview.ts`
- [x] `ui/src/services/image-icon.ts`
- [x] `app/registries/providers/shared/tokenAuthConfigurationSchema.ts`
- [x] `app/log/buffer-stream.test.ts`
- [x] `app/api/audit.test.ts`
- [x] `app/api/group.test.ts`
- [x] `app/api/webhook.test.ts`
- [x] `ui/src/components/ContainerGroup.ts`
- [x] `app/prometheus/webhook.test.ts`
- [x] `app/api/backup.ts`
- [x] `app/api/audit-events.ts`
- [x] `app/triggers/providers/docker/HealthMonitor.ts`

## Progress Log
- [x] 2026-02-12: tracking doc initialized from user-provided HIGH findings list
- [x] 2026-02-12: installed and initialized Codacy CLI in worktree (`codacy-cli init`)
- [x] 2026-02-12: fixed `ui/src/components/ContainerRollback.ts` and verified with `npm --prefix ui exec biome lint src/components/ContainerRollback.ts`
- [x] 2026-02-12: installed app/ui dependencies and Codacy analyzers (`npm ci`, `codacy-cli install`) to resolve real findings vs missing-module noise
- [x] 2026-02-12: re-verified `app/watchers/providers/docker/maintenance.test.ts` has no active Codacy ESLint findings after dependency/tool installation
- [x] 2026-02-12: fixed `app/prometheus/container-actions.test.ts` by importing `vitest` symbols and removing `@ts-nocheck`; re-verified with Codacy ESLint scan
- [x] 2026-02-12: fixed `ui/src/services/sse.ts` typing (`eventBus`, nullable fields, explicit returns) and verified with `ui/tests/services/sse.spec.ts` + Codacy ESLint scan
- [x] 2026-02-12: fixed `app/store/audit.test.ts` by importing `vitest` globals and re-verified with Codacy ESLint scan
- [x] 2026-02-12: re-verified clean (no active findings) for `app/prometheus/container-actions.ts`, `app/api/container-actions.ts`, and `app/api/group.ts`
- [x] 2026-02-12: fixed remaining app test files by importing explicit `vitest` globals (and removed `@ts-nocheck` where applicable); fixed `app/api/sse.ts` typing and `app/api/webhook.ts` `Buffer` import
- [x] 2026-02-12: updated `ui/tests/components/ContainerRollback.spec.ts` to match non-null `selectedBackupId` behavior
- [x] 2026-02-12: verification complete: `codacy-cli analyze --tool eslint` reports `0` findings for every file in this queue; targeted vitest slices passed (`app`: 121 tests, `ui`: 21 tests)
