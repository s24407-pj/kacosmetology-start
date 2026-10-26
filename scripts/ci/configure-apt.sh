#!/usr/bin/env bash
set -euo pipefail

# GitHub's Azure mirror has stalled browser dependency downloads for 15+ minutes.
# Accept a fixture root so the source rewrite can be verified without sudo.
apt_root="${1:-/etc/apt}"
for source in "$apt_root/sources.list" "$apt_root/sources.list.d/"*.list "$apt_root/sources.list.d/"*.sources; do
  [[ -f "$source" ]] || continue
  # Current runners use mirror+file; older images reference Azure directly.
  sed -E -i \
    -e 's#mirror\+file:/etc/apt/apt-mirrors\.txt#https://archive.ubuntu.com/ubuntu/#g' \
    -e 's#https?://azure\.archive\.ubuntu\.com/#https://archive.ubuntu.com/#g' \
    "$source"
done

mkdir -p "$apt_root/apt.conf.d"
cat > "$apt_root/apt.conf.d/99-ci-network" <<'EOF'
Acquire::Retries "2";
Acquire::http::Timeout "20";
Acquire::https::Timeout "20";
EOF
