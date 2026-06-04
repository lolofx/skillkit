# guard-bash.ps1 — hook PreToolUse (Bash)
# Bloque les commandes destructrices via JSON `permissionDecision: deny` sur stdout
# (exit 0 systématique : permet le dispatch polyglotte `powershell ... || bash ...`
# de settings.json sans perdre le signal de blocage).
# Compatible Windows PowerShell 5.1 et pwsh 7+.

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    # PS 5.1 décode stdin en codepage OEM → re-décoder les octets d'origine en UTF-8
    try { $raw = [Text.Encoding]::UTF8.GetString([Console]::InputEncoding.GetBytes($raw)) } catch {}
    $payload = $raw.TrimStart([char]0xFEFF).Trim() | ConvertFrom-Json
} catch {
    exit 0  # payload illisible : ne pas bloquer le travail normal
}

if ($payload.tool_name -ne 'Bash') { exit 0 }
$cmd = [string]$payload.tool_input.command
if ([string]::IsNullOrWhiteSpace($cmd)) { exit 0 }

function Block([string]$reason) {
    $msg = "BLOQUE par guard-bash : $reason. Commande refusee : $cmd. Si l'operation est legitime, demande a l'utilisateur de l'executer lui-meme."
    $json = @{
        hookSpecificOutput = @{
            hookEventName            = 'PreToolUse'
            permissionDecision       = 'deny'
            permissionDecisionReason = $msg
        }
    } | ConvertTo-Json -Compress -Depth 5
    [Console]::Out.WriteLine($json)
    exit 0
}

# --- rm -rf (autorisé uniquement sur les chemins temporaires) ---
if ($cmd -match '(?i)(^|[;&|]\s*)rm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*|--recursive\s+--force|--force\s+--recursive)\b') {
    # extraire les cibles (tokens ne commençant pas par -)
    $after = ($cmd -split '(?i)rm\s+', 2)[1]
    $targets = @($after -split '\s+' | Where-Object { $_ -and $_ -notmatch '^-' })
    $allTemp = $targets.Count -gt 0
    foreach ($t in $targets) {
        if ($t -notmatch '^(/tmp/|\$TMPDIR|\$\{TMPDIR\}|%TEMP%|\$env:TE?MP)') { $allTemp = $false }
    }
    if (-not $allTemp) { Block 'rm -rf hors chemins temporaires' }
}

# --- git push --force sur main/master (ou sans branche explicite) ---
if ($cmd -match '(?i)git\s+push\b' -and $cmd -match '(?i)(--force(-with-lease)?\b|\s-f\b)') {
    if ($cmd -match '(?i)\b(main|master)\b' -or $cmd -notmatch '(?i)git\s+push\s+\S+\s+\S+') {
        Block 'git push --force sur main/master (ou sans branche explicite)'
    }
}

# --- git reset --hard ---
if ($cmd -match '(?i)git\s+reset\s+(\S+\s+)*--hard') { Block 'git reset --hard' }

# --- SQL destructif ---
if ($cmd -match '(?i)\bdrop\s+(database|table)\b') { Block 'DROP DATABASE / DROP TABLE' }
if ($cmd -match '(?i)\btruncate\s+table\b') { Block 'TRUNCATE TABLE' }

# --- del /s /q (cmd.exe) ---
if ($cmd -match '(?i)\bdel\b.*\s/s\b' -and $cmd -match '(?i)\s/q\b') { Block 'del /s /q' }

# --- Remove-Item -Recurse -Force sur une racine ---
if ($cmd -match '(?i)Remove-Item\b' -and $cmd -match '(?i)-Recurse\b' -and $cmd -match '(?i)-Force\b') {
    if ($cmd -match '(?i)Remove-Item\s+(-\w+\s+)*["'']?([a-z]:[\\/]?|[\\/]|\.|\.[\\/]\*?|\*)["'']?(\s|$)') {
        Block 'Remove-Item -Recurse -Force sur une racine'
    }
}

exit 0
