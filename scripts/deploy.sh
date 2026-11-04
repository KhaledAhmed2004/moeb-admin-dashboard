#!/usr/bin/env bash
# Server-side deploy steps. Called by .github/workflows/deploy.yml after the
# repo has been reset to origin/main. Usage: bash scripts/deploy.sh <previous-commit>
#
# Wrapped in main() so bash parses the whole file before running it — the
# rollback below rewrites this file on disk while it is executing.

main() {
  local prev_commit="${1:-}"
  local min_node_major=20
  local pm2_name="${PM2_NAME:-dashboard-app-v2}"
  local health_url="${HEALTH_URL:-http://127.0.0.1:3001/}"

  # Non-interactive SSH does not load ~/.bashrc, so nvm is not active and the
  # system Node (v18) would be used. Load nvm before strict mode: nvm.sh
  # trips over `set -u`.
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    nvm use --silent default >/dev/null 2>&1 || nvm use --silent "$min_node_major" >/dev/null 2>&1 || true
  fi

  set -euo pipefail

  local node_major
  node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  echo "==> Using node $(node -v 2>/dev/null || echo 'not found') ($(command -v node || echo '-')), npm $(npm -v 2>/dev/null || echo '-')"
  if [ "$node_major" -lt "$min_node_major" ]; then
    echo "!!! Node >= $min_node_major is required. Aborting deploy before touching the running app."
    if [ -n "$prev_commit" ]; then
      git reset --hard "$prev_commit"
    fi
    return 1
  fi

  # Explicit `|| return 1` on every step: this function runs inside an `if`,
  # where bash ignores `set -e`, so a failed build would otherwise go unnoticed.
  build_and_reload() {
    echo "==> Installing dependencies"
    # Next.js build needs devDependencies (typescript, tailwind, ...).
    npm ci --include=dev --no-audit --no-fund || return 1
    echo "==> Building (NEXT_PUBLIC_* values are read from .env now)"
    npm run build || return 1
    echo "==> Reloading PM2 process '$pm2_name'"
    pm2 reload "$pm2_name" --update-env || return 1
  }

  health_check() {
    echo "==> Health check: $health_url"
    for _ in $(seq 1 30); do
      # curl -f only fails on HTTP >= 400, so a redirect to /auth/login counts as healthy.
      if curl -fsS -o /dev/null "$health_url"; then
        echo "==> Healthy"
        return 0
      fi
      sleep 2
    done
    return 1
  }

  echo "==> Deploying $(git log --oneline -1)"

  if build_and_reload && health_check; then
    echo "==> Deploy succeeded"
    return 0
  fi

  echo "!!! Deploy failed. Recent logs:"
  pm2 logs "$pm2_name" --lines 40 --nostream || true

  if [ -n "$prev_commit" ]; then
    echo "==> Rolling back to $prev_commit"
    git reset --hard "$prev_commit"
    build_and_reload || true
    health_check || echo "!!! Rollback is unhealthy too. Check the server manually."
  fi

  return 1
}

main "$@"
exit $?
