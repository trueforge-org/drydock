# Update Guard (Security)

Update Guard runs security scanning in a safe-pull flow:

1. Candidate image is scanned before update
2. Update is blocked when CVEs match configured blocking severities
3. Scan result is stored in `container.security.scan` and exposed in API/UI

## Enablement

Security scanning is disabled by default.
To enable it, set:

```bash
DD_SECURITY_SCANNER=trivy
```

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_SECURITY_SCANNER` | :white_check_mark: | Enable scanner provider | `trivy` | disabled |
| `DD_SECURITY_BLOCK_SEVERITY` | :white_circle: | Blocking severities (comma-separated) | Any of `UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL` | `CRITICAL,HIGH` |
| `DD_SECURITY_TRIVY_SERVER` | :white_circle: | Trivy server URL (enables client/server mode) | URL | empty (local CLI mode) |
| `DD_SECURITY_TRIVY_COMMAND` | :white_circle: | Trivy command path for local CLI mode | executable path | `trivy` |
| `DD_SECURITY_TRIVY_TIMEOUT` | :white_circle: | Trivy command timeout in milliseconds | integer (`>=1000`) | `120000` |

## Trivy modes

### Client mode (local CLI)

Use this mode when the `trivy` binary is available inside the drydock runtime.

?> **Tip:** Local CLI mode requires the `trivy` binary inside the container. Build a custom image or use server mode with a standalone Trivy instance.

```yaml
services:
  drydock:
    image: your-org/drydock-with-trivy:latest
    environment:
      - DD_SECURITY_SCANNER=trivy
      - DD_SECURITY_BLOCK_SEVERITY=CRITICAL,HIGH
      - DD_SECURITY_TRIVY_COMMAND=trivy
      - DD_SECURITY_TRIVY_TIMEOUT=120000
```

### Server mode (Trivy server)

Use this mode when running a separate Trivy server and letting drydock call it.

```yaml
services:
  trivy:
    image: aquasec/trivy:latest
    command: server --listen 0.0.0.0:4954

  drydock:
    image: codeswhat/drydock:latest
    depends_on:
      - trivy
    environment:
      - DD_SECURITY_SCANNER=trivy
      - DD_SECURITY_BLOCK_SEVERITY=CRITICAL,HIGH
      - DD_SECURITY_TRIVY_SERVER=http://trivy:4954
      - DD_SECURITY_TRIVY_TIMEOUT=120000
```

## Signature Verification (cosign)

When enabled, candidate images are verified with [cosign](https://docs.sigstore.dev/cosign/overview/) before the update proceeds. Updates are blocked if signatures are missing, invalid, or verification fails.

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_SECURITY_VERIFY_SIGNATURES` | :white_circle: | Enable signature verification gate | `true` / `false` | `false` |
| `DD_SECURITY_COSIGN_KEY` | :white_circle: | Path to cosign public key file | file path | empty (keyless / Sigstore) |
| `DD_SECURITY_COSIGN_COMMAND` | :white_circle: | Cosign command path | executable path | `cosign` |
| `DD_SECURITY_COSIGN_TIMEOUT` | :white_circle: | Cosign command timeout in milliseconds | integer (`>=1000`) | `60000` |
| `DD_SECURITY_COSIGN_IDENTITY` | :white_circle: | Certificate identity for keyless verification | string | empty |
| `DD_SECURITY_COSIGN_ISSUER` | :white_circle: | OIDC issuer for keyless verification | string | empty |

?> **Tip:** When `DD_SECURITY_COSIGN_KEY` is empty, cosign runs in keyless mode using Sigstore's public transparency log. Set `DD_SECURITY_COSIGN_IDENTITY` and `DD_SECURITY_COSIGN_ISSUER` to constrain keyless verification to a specific signer.

### Key-based verification

```yaml
services:
  drydock:
    image: codeswhat/drydock:latest
    environment:
      - DD_SECURITY_SCANNER=trivy
      - DD_SECURITY_VERIFY_SIGNATURES=true
      - DD_SECURITY_COSIGN_KEY=/keys/cosign.pub
    volumes:
      - ./cosign.pub:/keys/cosign.pub:ro
      - /var/run/docker.sock:/var/run/docker.sock
```

### Keyless verification (Sigstore)

```yaml
services:
  drydock:
    image: codeswhat/drydock:latest
    environment:
      - DD_SECURITY_SCANNER=trivy
      - DD_SECURITY_VERIFY_SIGNATURES=true
      - DD_SECURITY_COSIGN_IDENTITY=https://github.com/CodesWhat/drydock/.github/workflows/release.yml@refs/tags/*
      - DD_SECURITY_COSIGN_ISSUER=https://token.actions.githubusercontent.com
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## SBOM Generation

When enabled, Trivy generates Software Bill of Materials (SBOM) documents for candidate images during the Update Guard flow. SBOMs are persisted in `container.security.sbom` and available via the API.

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_SECURITY_SBOM_ENABLED` | :white_circle: | Enable SBOM generation | `true` / `false` | `false` |
| `DD_SECURITY_SBOM_FORMATS` | :white_circle: | Comma-separated list of SBOM formats | `spdx-json`, `cyclonedx-json` | `spdx-json` |

```yaml
services:
  drydock:
    image: codeswhat/drydock:latest
    environment:
      - DD_SECURITY_SCANNER=trivy
      - DD_SECURITY_SBOM_ENABLED=true
      - DD_SECURITY_SBOM_FORMATS=spdx-json,cyclonedx-json
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

?> **Tip:** SBOM documents are retrievable per-container via `GET /api/containers/:id/sbom?format={format}` where `format` is one of `spdx-json` or `cyclonedx-json`.

## Full example (scanning + signatures + SBOM)

```yaml
services:
  trivy:
    image: aquasec/trivy:latest
    command: server --listen 0.0.0.0:4954

  drydock:
    image: codeswhat/drydock:latest
    depends_on:
      - trivy
    environment:
      - DD_SECURITY_SCANNER=trivy
      - DD_SECURITY_BLOCK_SEVERITY=CRITICAL,HIGH
      - DD_SECURITY_TRIVY_SERVER=http://trivy:4954
      - DD_SECURITY_VERIFY_SIGNATURES=true
      - DD_SECURITY_COSIGN_IDENTITY=https://github.com/CodesWhat/drydock/.github/workflows/release.yml@refs/tags/*
      - DD_SECURITY_COSIGN_ISSUER=https://token.actions.githubusercontent.com
      - DD_SECURITY_SBOM_ENABLED=true
      - DD_SECURITY_SBOM_FORMATS=spdx-json,cyclonedx-json
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```
