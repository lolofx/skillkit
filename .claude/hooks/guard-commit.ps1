# guard-commit.ps1 — hook PreToolUse (Bash, pattern `git commit`)
# Refuse le commit si aucune suite de tests verte récente (dotnet test, node --test,
# ng test, npm test, vitest — marqueur écrit par track-tests).
# Ne s'applique que si le repo contient un projet .NET, des tests node, ou un projet frontend.
# Compatible PS 5.1 et pwsh 7+.

$ErrorActionPreference = 'Stop'
$maxAgeMinutes = 30

try {
    $raw = [Console]::In.ReadToEnd()
    # PS 5.1 décode stdin en codepage OEM → re-décoder les octets d'origine en UTF-8
    try { $raw = [Text.Encoding]::UTF8.GetString([Console]::InputEncoding.GetBytes($raw)) } catch {}
    $payload = $raw.TrimStart([char]0xFEFF).Trim() | ConvertFrom-Json
} catch { exit 0 }

if ($payload.tool_name -ne 'Bash') { exit 0 }
$cmd = [string]$payload.tool_input.command
if ($cmd -notmatch '(?i)git\s+commit\b') { exit 0 }

# Repo sans projet reconnu → gate non applicable (template nu, doc pure, etc.)
$dotnetFiles  = git ls-files '*.sln' '*.csproj' 2>$null
$nodeTests    = git ls-files '*.test.js' '*.test.mjs' 2>$null
$frontendFiles = git ls-files 'angular.json' 'package.json' 2>$null
if (-not $dotnetFiles -and -not $nodeTests -and -not $frontendFiles) { exit 0 }

$suite = if ($dotnetFiles) { 'dotnet test' }
         elseif ($nodeTests) { 'node --test' }
         elseif (git ls-files 'angular.json' 2>$null) { 'ng test' }
         else { 'npm test' }

function Block([string]$reason) {
    # Blocage via JSON deny (exit 0) — compatible avec le dispatch polyglotte de settings.json
    $msg = "COMMIT REFUSE par guard-commit : $reason. Lance '$suite' (suite complete) et committe seulement si tout est vert."
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

$marker = Join-Path '.claude' '.last-test-run'
if (-not (Test-Path $marker)) {
    Block "aucun '$suite' trace — les tests n'ont pas ete executes"
}

$parts = (Get-Content $marker -Raw).Trim() -split '\|'
if ($parts.Count -lt 2) { Block 'marqueur de tests illisible' }

$ts = [datetime]::Parse($parts[0], [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind)
$result = $parts[1]

if ($result -ne 'PASS') {
    Block "le dernier '$suite' a echoue ($($ts.ToLocalTime().ToString('HH:mm:ss')))"
}
if (((Get-Date).ToUniversalTime() - $ts.ToUniversalTime()).TotalMinutes -gt $maxAgeMinutes) {
    Block "le dernier '$suite' vert date de plus de $maxAgeMinutes minutes — relance la suite"
}

exit 0
