#!/usr/bin/env bash
# guard-bash.sh — hook PreToolUse (Bash), variante linux / mac / WSL2 / CI.
# Bloque les commandes destructrices via JSON `permissionDecision: deny` sur stdout
# (exit 0 systématique : compatible avec le dispatch polyglotte de settings.json).
# Dépendance : jq.

set -u
payload=$(cat)

# sans jq : garde-fous inactifs — le signaler visiblement plutôt que se taire
if ! command -v jq >/dev/null 2>&1; then
    printf '{"systemMessage":"guard-bash : jq manquant, garde-fous INACTIFS sur ce poste (installer jq)"}\n'
    exit 0
fi

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
[ "$tool" = "Bash" ] || exit 0
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')
[ -n "$cmd" ] || exit 0

block() {
    msg="BLOQUE par guard-bash : $1. Commande refusee : $cmd. Si l'operation est legitime, demande a l'utilisateur de l'executer lui-meme."
    jq -cn --arg r "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
    exit 0
}

lc=$(printf '%s' "$cmd" | tr '[:upper:]' '[:lower:]')

# --- rm -rf (autorisé uniquement sur les chemins temporaires) ---
if printf '%s' "$lc" | grep -Eq '(^|[;&|][[:space:]]*)rm[[:space:]]+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*|--recursive[[:space:]]+--force|--force[[:space:]]+--recursive)\b'; then
    targets=$(printf '%s' "$cmd" | sed -E 's/.*rm[[:space:]]+//' | tr ' ' '\n' | grep -v '^-' || true)
    [ -n "$targets" ] || block "rm -rf sans cible identifiable"
    while IFS= read -r t; do
        case "$t" in
            /tmp/*|\$TMPDIR*|\${TMPDIR}*) ;;
            *) block "rm -rf hors chemins temporaires" ;;
        esac
    done <<EOF
$targets
EOF
fi

# --- git push --force sur main/master (ou sans branche explicite) ---
if printf '%s' "$lc" | grep -Eq 'git[[:space:]]+push' && printf '%s' "$lc" | grep -Eq '(--force(-with-lease)?\b|[[:space:]]-f\b)'; then
    if printf '%s' "$lc" | grep -Eq '\b(main|master)\b' || ! printf '%s' "$lc" | grep -Eq 'git[[:space:]]+push[[:space:]]+[^-][^[:space:]]*[[:space:]]+[^-]'; then
        block "git push --force sur main/master (ou sans branche explicite)"
    fi
fi

# --- git reset --hard ---
printf '%s' "$lc" | grep -Eq 'git[[:space:]]+reset([[:space:]]+[^[:space:]]+)*[[:space:]]+--hard' && block "git reset --hard"

# --- SQL destructif ---
printf '%s' "$lc" | grep -Eq '\bdrop[[:space:]]+(database|table)\b' && block "DROP DATABASE / DROP TABLE"
printf '%s' "$lc" | grep -Eq '\btruncate[[:space:]]+table\b' && block "TRUNCATE TABLE"

# --- del /s /q (cmd.exe) ---
printf '%s' "$lc" | grep -Eq '\bdel\b.*[[:space:]]/s\b' && printf '%s' "$lc" | grep -Eq '[[:space:]]/q\b' && block "del /s /q"

# --- Remove-Item -Recurse -Force sur une racine ---
if printf '%s' "$lc" | grep -q 'remove-item' && printf '%s' "$lc" | grep -q '\-recurse' && printf '%s' "$lc" | grep -q '\-force'; then
    printf '%s' "$lc" | grep -Eq 'remove-item[[:space:]]+(-[a-z]+[[:space:]]+)*["'"'"']?([a-z]:[\\/]?|[\\/]|\.|\*)["'"'"']?([[:space:]]|$)' && block "Remove-Item -Recurse -Force sur une racine"
fi

exit 0
