# guard-commit.ps1 - PreToolUse hook (Bash, `git commit` commands)
# Denies the commit unless a recent green test run was recorded by track-tests
# (dotnet test, node --test, ng test, npm test, vitest).
# Only applies when the repo holds a .NET project, node tests or a frontend project.
# Works on Windows PowerShell 5.1 and pwsh 7+. Keep this file ASCII-only (no BOM needed).

$ErrorActionPreference = 'Stop'
$maxAgeMinutes = 30

try {
    $raw = [Console]::In.ReadToEnd()
    # PS 5.1 decodes stdin with the OEM codepage: re-decode the original bytes as UTF-8
    try { $raw = [Text.Encoding]::UTF8.GetString([Console]::InputEncoding.GetBytes($raw)) } catch {}
    $payload = $raw.TrimStart([char]0xFEFF).Trim() | ConvertFrom-Json
} catch { exit 0 }

if ($payload.tool_name -ne 'Bash') { exit 0 }
$cmd = [string]$payload.tool_input.command
if ($cmd -notmatch '(?i)git\s+commit\b') { exit 0 }

# No recognised project: the gate does not apply
$dotnetFiles   = git ls-files '*.sln' '*.csproj' 2>$null
$nodeTests     = git ls-files '*.test.js' '*.test.mjs' 2>$null
$frontendFiles = git ls-files 'angular.json' 'package.json' 2>$null
if (-not $dotnetFiles -and -not $nodeTests -and -not $frontendFiles) { exit 0 }

$suite = if ($dotnetFiles) { 'dotnet test' }
         elseif ($nodeTests) { 'node --test' }
         elseif (git ls-files 'angular.json' 2>$null) { 'ng test' }
         else { 'npm test' }

function Block([string]$reason) {
    # Deny through JSON on stdout and exit 0, so the polyglot `||` dispatch cannot swallow it
    $msg = "COMMIT DENIED by guard-commit: $reason. Run '$suite' (full suite) and commit only when everything is green."
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
    Block "no '$suite' run recorded - the tests have not been run"
}

$parts = (Get-Content $marker -Raw).Trim() -split '\|'
if ($parts.Count -lt 2) { Block 'test marker unreadable' }

$ts = [datetime]::Parse($parts[0], [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind)
$result = $parts[1]

if ($result -ne 'PASS') {
    Block "the last '$suite' failed ($($ts.ToLocalTime().ToString('HH:mm:ss')))"
}
if (((Get-Date).ToUniversalTime() - $ts.ToUniversalTime()).TotalMinutes -gt $maxAgeMinutes) {
    Block "the last green '$suite' is older than $maxAgeMinutes minutes - rerun the suite"
}

exit 0
