$dest = Join-Path $PSScriptRoot '..\src\fonts'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$files = [ordered]@{
  'hubot-sans-400.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/hubot-sans@5.2.8/files/hubot-sans-latin-400-normal.woff2'
  'hubot-sans-500.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/hubot-sans@5.2.8/files/hubot-sans-latin-500-normal.woff2'
  'hubot-sans-600.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/hubot-sans@5.2.8/files/hubot-sans-latin-600-normal.woff2'
  'source-sans-3-400.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.2.9/files/source-sans-3-latin-400-normal.woff2'
  'source-sans-3-500.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.2.9/files/source-sans-3-latin-500-normal.woff2'
  'source-sans-3-600.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.2.9/files/source-sans-3-latin-600-normal.woff2'
  'jetbrains-mono-400.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.2.8/files/jetbrains-mono-latin-400-normal.woff2'
  'jetbrains-mono-500.woff2' = 'https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.2.8/files/jetbrains-mono-latin-500-normal.woff2'
}

foreach ($entry in $files.GetEnumerator()) {
  $out = Join-Path $dest $entry.Key
  Invoke-WebRequest -Uri $entry.Value -OutFile $out -UseBasicParsing
  $size = (Get-Item $out).Length
  Write-Host "$($entry.Key) $size bytes"
}
