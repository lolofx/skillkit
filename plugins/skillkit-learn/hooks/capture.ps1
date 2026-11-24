# capture.ps1 - PostToolUse hook (Bash, Skill), Windows variant. ASCII only.
# Appends session signals to .skillkit/journal/<session>.jsonl (see capture.sh).
$ErrorActionPreference = 'SilentlyContinue'
$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }
$p = $raw | ConvertFrom-Json
$session = ([string]$p.session_id) -replace '[^A-Za-z0-9_-]', '_'
if (-not $session) { $session = 'unknown' }
$ts = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

function Emit($obj) {
    New-Item -ItemType Directory -Force -Path '.skillkit/journal' | Out-Null
    if (-not (Test-Path '.skillkit/.gitignore')) { Set-Content -Path '.skillkit/.gitignore' -Value '*' -Encoding ascii }
    $obj | ConvertTo-Json -Compress | Add-Content -Path ".skillkit/journal/$session.jsonl" -Encoding utf8
}

if ($p.tool_name -eq 'Skill') {
    if ($p.tool_input.skill) { Emit ([ordered]@{ ts = $ts; type = 'skill-used'; skill = [string]$p.tool_input.skill }) }
    exit 0
}
if ($p.tool_name -ne 'Bash') { exit 0 }

$cmd = [string]$p.tool_input.command
if ($cmd.Length -gt 300) { $cmd = $cmd.Substring(0, 300) }
$out = (@($p.tool_response.stdout, $p.tool_response.stderr, $p.tool_response.output) | Where-Object { $_ }) -join "`n"
$code = if ($null -ne $p.tool_response.exit_code) { $p.tool_response.exit_code } else { $p.tool_response.exitCode }

if ($cmd -match '(?i)dotnet\s+test\b|node\s+--test\b|ng\s+test\b|npm\s+(run\s+)?test\b|vitest\b') {
    $result = 'PASS'
    if ($out -match '(?i)Failed!|chou.{0,2}\s*!|chec\s*!|failed:\s*[1-9]|error\s+(CS|MSB)[0-9]+|test run failed|\sfail\s+[1-9]') { $result = 'FAIL' }
    $detail = (($out -split "`n") | Where-Object { $_ -match '(?i)error|fail|chec' } | Select-Object -First 3) -join "`n"
    if ($detail.Length -gt 400) { $detail = $detail.Substring(0, 400) }
    Emit ([ordered]@{ ts = $ts; type = 'test-run'; result = $result; command = $cmd; detail = $detail })
}
elseif ($null -ne $code -and "$code" -ne '0') {
    Emit ([ordered]@{ ts = $ts; type = 'command-failed'; exit = "$code"; command = $cmd })
}
exit 0
