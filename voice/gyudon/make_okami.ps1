$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:50021"
$out = Split-Path -Parent $MyInvocation.MyCommand.Path
$response = Invoke-WebRequest -Uri "$base/speakers" -UseBasicParsing
$speakers = [System.Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray()) | ConvertFrom-Json
$sp = ($speakers | Where-Object { $_.name -eq "冥鳴ひまり" }).styles | Where-Object { $_.name -eq "ノーマル" } | Select-Object -First 1
if (-not $sp) { throw "speaker not found" }
$id = $sp.id
$lines = @(
  @("okami_01", "いらっしゃい！"),
  @("okami_02", "待ってるよ〜"),
  @("okami_03", "……つゆだく、ね。")
)
foreach ($l in $lines) {
  $enc = [uri]::EscapeDataString($l[1])
  $response = Invoke-WebRequest -Method Post -Uri "$base/audio_query?speaker=$id&text=$enc" -UseBasicParsing
  $q = [System.Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray()) | ConvertFrom-Json
  $q.speedScale = 1.0
  $q.intonationScale = 1.3
  $json = $q | ConvertTo-Json -Depth 20
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Invoke-WebRequest -Method Post -Uri "$base/synthesis?speaker=$id" -Body $bytes -ContentType "application/json" -OutFile (Join-Path $out ($l[0] + ".wav")) -UseBasicParsing
  Write-Host "done" $l[0]
}
Write-Host "ALL DONE speaker id=$id"
