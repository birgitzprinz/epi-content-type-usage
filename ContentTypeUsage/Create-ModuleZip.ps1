# Create-ModuleZip.ps1
# Builds ContentTypeUsage.zip for packaging as an Optimizely CMS module.
#
# Parameters
#   -Version   : the package version string read from MSBuild (e.g. "3.0.0")
#   -ProjectDir: absolute path to the ContentTypeUsage project directory
param(
    [Parameter(Mandatory)][string]$Version,
    [Parameter(Mandatory)][string]$ProjectDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$zipPath     = Join-Path $ProjectDir 'ContentTypeUsage.zip'
$stagingRoot = Join-Path $ProjectDir 'obj\_module_staging'
$versionDir  = Join-Path $stagingRoot $Version

# ── Clean staging area ────────────────────────────────────────────────────────
if (Test-Path $stagingRoot) { Remove-Item $stagingRoot -Recurse -Force }
New-Item $stagingRoot -ItemType Directory | Out-Null

# ── Stage ClientResources (deployable files only) ────────────────────────────
# Only Styles and Scripts/dist go into the zip; source files and tests are excluded.
$clientResourcesSrc = Join-Path $ProjectDir 'ClientResources'
$clientResourcesDst = Join-Path $versionDir 'ClientResources'

$includeDirs = @('Styles', 'Scripts\dist')
foreach ($rel in $includeDirs) {
    $src = Join-Path $clientResourcesSrc $rel
    $dst = Join-Path $clientResourcesDst $rel
    if (Test-Path $src) {
        New-Item $dst -ItemType Directory -Force | Out-Null
        Copy-Item "$src\*" $dst -Recurse -Force
    }
}

# ── Generate module.config with the correct version ──────────────────────────
$moduleConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<module name="ContentTypeUsage" clientResourceRelativePath="$Version">
  <assemblies>
    <add assembly="ContentTypeUsage" />
  </assemblies>
</module>
"@
$moduleConfig | Set-Content (Join-Path $stagingRoot 'module.config') -Encoding UTF8

# ── Zip staging area → ContentTypeUsage.zip ──────────────────────────────────
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$stagingRoot\*" -DestinationPath $zipPath
Write-Host "ContentTypeUsage.zip created at $zipPath (version $Version)"
