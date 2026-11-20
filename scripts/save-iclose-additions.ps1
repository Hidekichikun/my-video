$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetDir = Join-Path $PSScriptRoot '../photo/I close my mind/MV素材'
$manifest = Get-Content -LiteralPath (Join-Path $assetDir '追加素材_生成プロンプト.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$sheet = [System.Drawing.Bitmap]::new(1440, 1184)
$sg = [System.Drawing.Graphics]::FromImage($sheet)
$sg.Clear([System.Drawing.Color]::FromArgb(22,22,28))
$sg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = [System.Drawing.Font]::new('Arial', 15)
$i = 0
foreach ($asset in $manifest.assets) {
  $dest = Join-Path $assetDir $asset.file
  if (Test-Path -LiteralPath $dest) { throw "Already exists: $dest" }
  $sourceImage = [System.Drawing.Image]::FromFile($asset.source)
  $final = [System.Drawing.Bitmap]::new(1456,816)
  $g = [System.Drawing.Graphics]::FromImage($final)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($sourceImage,0,0,1456,816)
  $final.Save($dest,[System.Drawing.Imaging.ImageFormat]::Png)
  $x = ($i % 3) * 480
  $y = [math]::Floor($i / 3) * 296
  $sg.DrawImage($final,[int]$x,[int]$y,480,269)
  $sg.DrawString($asset.id,$font,[System.Drawing.Brushes]::White,[single]($x+10),[single]($y+272))
  $g.Dispose(); $final.Dispose(); $sourceImage.Dispose()
  $i++
}
$sheet.Save((Join-Path $assetDir '追加素材_一覧.jpg'),[System.Drawing.Imaging.ImageFormat]::Jpeg)
$sg.Dispose(); $sheet.Dispose(); $font.Dispose()
foreach ($asset in $manifest.assets) {
  $verifyImage = [System.Drawing.Image]::FromFile((Join-Path $assetDir $asset.file))
  if ($verifyImage.Width -ne 1456 -or $verifyImage.Height -ne 816) { throw "Wrong dimensions: $($asset.file)" }
  Write-Output "$($asset.file): $($verifyImage.Width)x$($verifyImage.Height)"
  $verifyImage.Dispose()
}
