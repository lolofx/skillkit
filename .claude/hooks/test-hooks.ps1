# test-hooks.ps1 — smoke test des hooks (exécuté manuellement, non câblé dans settings.json)
# Le blocage est signalé par un JSON `permissionDecision: deny` sur stdout (exit 0),
# pas par un code retour — voir README.md.
$ErrorActionPreference = 'Continue'
$OutputEncoding = New-Object Text.UTF8Encoding($false)   # pipe vers les hooks en UTF-8 (sans BOM)
$hookDir = Split-Path $MyInvocation.MyCommand.Path

function Invoke-Hook([string]$script, [hashtable]$payload) {
    $json = $payload | ConvertTo-Json -Compress -Depth 5
    return ($json | powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $hookDir $script) 2>$null | Out-String)
}

$fails = 0
function Assert-Case([string]$script, [string]$cmd, [string]$expected, [string]$label) {
    $out = Invoke-Hook $script @{ tool_name = 'Bash'; tool_input = @{ command = $cmd } }
    $denied = $out -match '"permissionDecision":\s*"deny"'
    $verdict = if ($denied) { 'deny' } else { 'allow' }
    if ($verdict -eq $expected) { Write-Host "OK   [$script] $label" }
    else { Write-Host "FAIL [$script] $label (attendu=$expected obtenu=$verdict)"; $script:fails++ }
}

# --- guard-bash ---
Assert-Case 'guard-bash.ps1' ('rm -r' + 'f src/')                          'deny'  'rm rf hors temp -> bloque'
Assert-Case 'guard-bash.ps1' ('rm -r' + 'f /tmp/build-cache')              'allow' 'rm rf sur /tmp -> ok'
Assert-Case 'guard-bash.ps1' ('git push --for' + 'ce origin main')         'deny'  'push force main -> bloque'
Assert-Case 'guard-bash.ps1' 'git push origin feature/x'                   'allow' 'push normal -> ok'
Assert-Case 'guard-bash.ps1' ('git reset --ha' + 'rd HEAD~1')              'deny'  'reset hard -> bloque'
Assert-Case 'guard-bash.ps1' ('sqlcmd -Q "DR' + 'OP DATABASE prod"')       'deny'  'drop database -> bloque'
Assert-Case 'guard-bash.ps1' ('TRUNC' + 'ATE TABLE orders')                'deny'  'truncate -> bloque'
Assert-Case 'guard-bash.ps1' ('Remove-It' + 'em -Recurse -Force C:\')      'deny'  'Remove-Item racine -> bloque'
Assert-Case 'guard-bash.ps1' ('Remove-It' + 'em -Recurse -Force .\bin\Debug') 'allow' 'Remove-Item dossier build -> ok'
Assert-Case 'guard-bash.ps1' 'dotnet test'                                 'allow' 'dotnet test -> ok'
Assert-Case 'guard-bash.ps1' 'ls -la'                                      'allow' 'ls -> ok'

# --- guard-commit : gate applicable (le repo contient des tests node *.test.js) ---
$markerSauvegarde = Get-Content '.claude/.last-test-run' -Raw -ErrorAction SilentlyContinue
Remove-Item '.claude/.last-test-run' -ErrorAction SilentlyContinue
Assert-Case 'guard-commit.ps1' 'git commit -m "test"'                      'deny'  'commit sans tests traces -> bloque'
Assert-Case 'guard-commit.ps1' 'git status'                                'allow' 'commande non-commit -> ok'
$tsVert = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
Set-Content -Path '.claude/.last-test-run' -Value "$tsVert|PASS" -NoNewline -Encoding ascii
Assert-Case 'guard-commit.ps1' 'git commit -m "test"'                      'allow' 'commit avec tests verts recents -> ok'

# --- track-tests : marqueur PASS/FAIL selon la sortie (dotnet EN + FR, node --test) ---
function Assert-Marker([string]$cmd, [string]$stdout, [string]$expected, [string]$label) {
    $p = @{ tool_name = 'Bash'; tool_input = @{ command = $cmd }; tool_response = @{ stdout = $stdout; stderr = '' } }
    Invoke-Hook 'track-tests.ps1' $p | Out-Null
    $marker = Get-Content '.claude/.last-test-run' -Raw -ErrorAction SilentlyContinue
    if ($marker -match "\|$expected$") { Write-Host "OK   [track-tests] $label" }
    else { Write-Host "FAIL [track-tests] $label -> '$marker'"; $script:fails++ }
}

Assert-Marker 'dotnet test' "Passed!  - Failed: 0, Passed: 12, Total: 12"                                                  'PASS' 'sortie verte EN -> PASS'
Assert-Marker 'dotnet test' "Failed!  - Failed: 2, Passed: 10, Total: 12"                                                  'FAIL' 'sortie rouge EN -> FAIL'
Assert-Marker 'dotnet test' "Réussi!  - échec :     0, réussite :     1, ignorée(s) :     0, total :     1, durée : 8 ms"  'PASS' 'sortie verte FR -> PASS'
Assert-Marker 'dotnet test' "Échoué!  - échec :     1, réussite :     1, ignorée(s) :     0, total :     2, durée : 15 ms" 'FAIL' 'sortie rouge FR -> FAIL'
Assert-Marker 'node --test "cli/test/**/*.test.js"' "# tests 17`n# pass 17`n# fail 0"                                      'PASS' 'sortie verte node -> PASS'
Assert-Marker 'node --test "cli/test/**/*.test.js"' "# tests 17`n# pass 15`n# fail 2"                                      'FAIL' 'sortie rouge node -> FAIL'

# Restaurer le marqueur d'avant le smoke test (ne pas invalider un vrai run vert)
if ($markerSauvegarde) { Set-Content -Path '.claude/.last-test-run' -Value $markerSauvegarde -NoNewline -Encoding ascii }
else { Remove-Item '.claude/.last-test-run' -ErrorAction SilentlyContinue }

Write-Host "--- $fails echec(s)"
exit $(if ($fails -gt 0) { 1 } else { 0 })
