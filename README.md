<div align="center">

# 🐟 DeepSeek Harness

**A plugin-native coding-agent harness: everything is a plugin.**

_Run locally in one command, compose every capability, and keep the tested distribution together._

[![CI](https://img.shields.io/github/actions/workflow/status/ryan-brosas/deepseek-harness/ci-fork.yml?branch=master&style=for-the-badge&label=checks)](https://github.com/ryan-brosas/deepseek-harness/actions/workflows/ci-fork.yml) [![npm](https://img.shields.io/npm/v/@monotykamary/dsh?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@monotykamary/dsh) [![Node.js](https://img.shields.io/badge/Node.js-%5E22.19%20%7C%7C%20%3E%3D24-339933?style=for-the-badge&logo=node.js&logoColor=white)](package.json) [![license](https://img.shields.io/badge/license-MIT-f4c430?style=for-the-badge)](LICENSE)

English | [中文](README.zh.md)

</div>

<a id="run"></a>

## Run

```sh
npx @monotykamary/dsh@latest web
```

DeepSeek Harness (DSH) is a plugin-native coding-agent harness built on vendored Cordis: models, tools, persistence, policy, UI, and orchestration are all plugins, so you can replace any layer without touching the agent loop. The npm package carries the complete tested closure: [dsh-tool-repair](https://github.com/monotykamary/dsh-tool-repair), [dsh-multiprovider](https://github.com/monotykamary/dsh-multiprovider), [dsh-fabric](https://github.com/monotykamary/dsh-fabric), and [dsh-fovea](https://github.com/monotykamary/dsh-fovea) join every shipped profile, while the long-lived `web` profile also includes [dsh-factory](https://github.com/monotykamary/dsh-factory); profiles never pin separate copies.

DSH prefers `http://127.0.0.1:3080` for the Web UI. If that default is occupied, the Web profile retries once with an OS-assigned loopback port and prints the actual URL; an explicit `--port` remains exact. Local launches also open the default browser; SSH launches print the host URL, and `--no-open` runs only the server. See the [Web UI guide](docs/user/guide/index.md).

## Why DSH?

| | Capability | What it unlocks |
| :-: | --- | --- |
| 🧩 | **Everything is a plugin** | Replace models, tools, persistence, policy, UI, and orchestration through Cordis composition. |
| 🩹 | **Tool repair included** | Revalidate unambiguous provider-format repairs before logging or execution; reject truncated work. |
| 🔀 | **Multi-account providers included** | Share provider identity while routing complete operations through health-aware account leases. |
| 🧠 | **Fabric included** | Deterministic compaction, checked code execution, durable coordination, and live topology. |
| 🔭 | **Fovea included** | Progressive repository navigation and impact analysis without bulk-reading the tree. |
| 🛡️ | **Policy at execution** | Filesystem, subprocess, approval, timeout, and sandbox decisions remain enforceable capabilities. |
| 🔄 | **Cohesive updates** | Settings and the CLI report DSH and every companion together and keep the install channel. |
| 🧱 | **Profile layers** | Shipped templates stay current while user patches and out-of-tree bundles stay owned. |

## How it fits

```mermaid
flowchart LR
  User[CLI or Web] --> Profile[Managed profile template]
  Profile --> Core[DSH plugin spine]
  Profile --> Repair[Tool Repair]
  Profile --> Accounts[Multiprovider]
  Profile --> Fabric[Fabric]
  Profile --> Fovea[Fovea]
  Accounts --> Model[Model providers]
  Core --> Model
  Core --> Tools[Policy-guarded tools]
  Core --> Sessions[(Durable sessions)]
  Fabric --> Mesh[(Durable mesh)]
  Fovea --> Repo[Repository graph]
```

Cordis owns plugin lifecycle and reversible effects. The project log owns durable model-visible facts, so every decision is reconstructable. Profiles layer installation-owned templates, user patches, home patches, and CLI overlays in that order, keeping each source independently owned. See the [architecture](docs/architecture.md).

## Install

### Run without installing

```sh
npx @monotykamary/dsh@latest web
```

### Install the command

```sh
npm install --global @monotykamary/dsh@latest
dsh web
```

### Nix

```sh
nix run github:deepseek-ai/deepseek-harness
```

The flake pins the npm release named by this checkout. Set `DSH_INSTALL_CHANNEL=nix` in a packaged deployment so that Settings reports the Nix-owned update channel.

<a id="run-from-source"></a>

### Run from source

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

## CLI and updates

```sh
dsh --version
dsh version --json
dsh update --check
dsh update
dsh doctor --json
```

The Web Settings panel ships an **Updates** page and flags Settings when a managed package has a newer release. npm-global installs can hand off the update to a detached worker; npx, Nix, source, and unknown installs receive their owning update command instead. DSH never silently replaces itself or restarts a running session.

## Profiles and plugins

The shipped `web` and `headless` profiles resolve their template from the running DSH install, so an app update also updates the tested Tool Repair, Multiprovider, Fabric, and Fovea layers. `$DSH_HOME/profiles/<name>/package.json` stores only the template identity and the user-managed bundles; `cordis.patch.yml` remains the user's overlay layer.

```sh
dsh --profile web --dump-config
dsh plugin --profile web add <package>
```

Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to plugin repositories. The [extension cookbook](docs/cookbook/extension-cookbook.md) covers packages, tools, model providers, settings cards, and browser surfaces.

## Documentation

- [Web UI guide](docs/user/guide/index.md)
- [Architecture](docs/architecture.md)
- [Development guide](docs/development.md)
- [Contributing](CONTRIBUTING.md)
- [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions)
- [Discord](https://discord.gg/Ycq5dCaS4)

> [!WARNING]
>
> DSH is in developer preview. Compatibility-breaking changes are expected before the first stable release.

## License

MIT © DeepSeek contributors. Third-party licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).