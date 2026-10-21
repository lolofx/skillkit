# track-tests.ps1 - PostToolUse hook (Bash; dotnet test, node --test, ng test, npm test, vitest)
# Writes a marker (UTC ISO 8601 timestamp + PASS/FAIL) read by guard-commit.
# Works on Windows PowerShell 5.1 and pwsh 7+. Keep this file ASCII-only (no BOM needed).

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    # PS 5.1 decodes stdin with the OEM codepage: re-decode the original bytes as UTF-8
    try { $raw = [Text.Encoding]::UTF8.GetString([Console]::InputEncoding.GetBytes($raw)) } catch {}
    $payload = $raw.TrimStart([char]0xFEFF).Trim() | ConvertFrom-Json
} catch { exit 0 }

if ($payload.tool_name -ne 'Bash') { exit 0 }
$cmd = [string]$payload.tool_input.command
$isTestCmd = $cmd -match '(?i)dotnet\s+test\b' -or
             $cmd -match '(?i)node\s+--test\b' -or
             $cmd -match '(?i)ng\s+test\b' -or
             $cmd -match '(?i)npm\s+(run\s+)?test\b' -or
             $cmd -match '(?i)npx?\s+vitest\b' -or
             $cmd -match '(?i)\bvitest\b'
if (-not $isTestCmd) { exit 0 }

# Concatenate what the tool returned (stdout/stderr or output, depending on the version)
$out = ''
if ($payload.tool_response) {
    foreach ($p in 'stdout', 'stderr', 'output') {
        $v = $payload.tool_response.PSObject.Properties[$p]
        if ($v -and $v.Value) { $out += [string]$v.Value + "`n" }
    }
}

# Failure patterns: dotnet test (EN and FR locales), node --test ("fail N") and build errors.
# The FR patterns are anchored without accents so they survive an encoding layer eating them.
$failPatterns = @(
    'Failed!',                          # VSTest summary, EN
    '(?i)chou\S{0,2}\s*!',              # FR summary
    '(?i)chec\s*!',                     # FR variant
    '(?i)chec\s*:\s*[1-9]',             # FR counter (N > 0)
    '(?i)failed:\s*[1-9]',              # "Failed: N" (N > 0)
    '(?i)\berror\s+(CS|MSB)\d+',        # compilation errors
    '(?i)test run failed',
    '(?m)\s+fail\s+[1-9]'               # node --test summary: "fail N" (N > 0)
)
$result = 'PASS'
foreach ($rx in $failPatterns) {
    if ($out -match $rx) { $result = 'FAIL'; break }
}
# No recognisable summary: do not certify a PASS
if ($result -eq 'PASS' -and $out -notmatch '(?i)(passed|ussi|total\s*:?\s*\d|pass\s+\d|SUCCESS)') { $result = 'FAIL' }

$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$markerDir = '.claude'
if (-not (Test-Path $markerDir)) { New-Item -ItemType Directory -Path $markerDir | Out-Null }
Set-Content -Path (Join-Path $markerDir '.last-test-run') -Value "$timestamp|$result" -NoNewline -Encoding ascii

exit 0
