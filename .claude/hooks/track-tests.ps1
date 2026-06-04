# track-tests.ps1 — hook PostToolUse (Bash, patterns `dotnet test`, `node --test`, `ng test`, `npm test`, `vitest`)
# Écrit un marqueur (timestamp UTC ISO 8601 + PASS/FAIL) consulté par guard-commit.
# Compatible PS 5.1 et pwsh 7+.

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    # PS 5.1 décode stdin en codepage OEM → re-décoder les octets d'origine en UTF-8
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

# Concaténer ce que le tool a retourné (selon les versions : stdout/stderr ou output)
$out = ''
if ($payload.tool_response) {
    foreach ($p in 'stdout', 'stderr', 'output') {
        $v = $payload.tool_response.PSObject.Properties[$p]
        if ($v -and $v.Value) { $out += [string]$v.Value + "`n" }
    }
}

# Échec si motifs d'échec dotnet test (locales EN/FR), node --test (`# fail N`)
# ou erreurs de build
# NB : patterns sans accent en ancrage ("chou", "chec") — robustes même si les
# accents sont mangés par une couche d'encodage intermédiaire.
$failPatterns = @(
    'Failed!',                          # résumé VSTest EN
    '(?i)chou\S{0,2}\s*!',              # "Échoué!" — résumé FR
    '(?i)chec\s*!',                     # "Échec !" — variante FR
    '(?i)chec\s*:\s*[1-9]',             # "échec :     N" (N > 0) — compteur FR
    '(?i)failed:\s*[1-9]',              # "Failed: N" (N > 0)
    '(?i)\berror\s+(CS|MSB)\d+',        # erreurs de compilation
    '(?i)test run failed',
    '(?m)\s+fail\s+[1-9]'               # résumé node --test : "ℹ fail N" (N > 0)
)
$result = 'PASS'
foreach ($rx in $failPatterns) {
    if ($out -match $rx) { $result = 'FAIL'; break }
}
# Aucun résumé reconnaissable → ne pas certifier un PASS
if ($result -eq 'PASS' -and $out -notmatch '(?i)(passed|ussi|total\s*:?\s*\d|pass\s+\d|SUCCESS)') { $result = 'FAIL' }

$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$markerDir = '.claude'
if (Test-Path $markerDir) {
    Set-Content -Path (Join-Path $markerDir '.last-test-run') -Value "$timestamp|$result" -NoNewline -Encoding ascii
}

exit 0
