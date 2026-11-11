$ErrorActionPreference='Stop'
$project=[IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$repository=Split-Path $project -Parent
$package=Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw | ConvertFrom-Json
$dist=Join-Path $project 'dist'
$release=Join-Path $dist 'release'
New-Item -ItemType Directory -Path $release -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $dist 'Okarina-Studio.exe') -Destination (Join-Path $release 'Okarina-Studio.exe')
foreach($name in @('Okarina-Studio.nfo','Anleitung.md')) {
 Copy-Item -LiteralPath (Join-Path $repository $name) -Destination (Join-Path $release $name)
}
$english=@'
# Okarina Studio — English instructions

Learn melodies from The Legend of Zelda on your real 12-hole ocarina.
Final Fantasy and Kingdom Hearts are additional collections.

## Start

Extract the entire ZIP to a folder and double-click Okarina-Studio.exe.
No installation or separate Node.js installation is needed.
Close an older running version before replacing its executable.

## Language

Select English or Deutsch in the lower-left corner of the app.
The selection is saved. English note names use international B;
the German display uses H. Stored notes and song titles are preserved.

## Practice

Start in Hyrule for the Zelda collection. Use the additional game-world
buttons for Final Fantasy X or Kingdom Hearts. Select Beginner or Advanced,
choose a song, and use Play, tempo, note stepping, sections and Repeat.
Filled circles show covered holes; the two holes below the line are thumbs.

Open Fingerings & first steps for the reference tone and microphone tuner.
The microphone is used only on request; audio processing stays on your PC.
The printed instrument's actual tuning must be checked. Apply its base note
to recalculate the fingerings. Octave shifts are marked with an arrow.

## Your library

Create songs with Add your own song. Note input uses international B,
R for rests, and a colon followed by a duration in beats: C5:0.5 R:1 G5:2.
User data is saved in %APPDATA%/okarina-studio/library.json.
Use Back up library for an additional JSON backup.
Updates preserve existing songs and settings while adding new arrangements.

## Project and printed ocarina

https://github.com/dantezukazero/Okarina-Studio
https://makerworld.com/de/models/1249288-deluxe-ocarina-fully-playable#profileId-1271476

Unofficial fan project, not affiliated with Nintendo, Square Enix or Disney.
Longer arrangements adapt selected MIDI voices rather than full original
scores. Source credits and any octave adjustments are shown in the app.
'@
[IO.File]::WriteAllText((Join-Path $release 'Instructions-English.md'),$english,[Text.UTF8Encoding]::new($false))
$names=@('Okarina-Studio.exe','Okarina-Studio.nfo','Anleitung.md','Instructions-English.md')
function Write-Checksums($fileNames) {
 $lines=foreach($name in $fileNames) { $hash=(Get-FileHash -LiteralPath (Join-Path $release $name) -Algorithm SHA256).Hash.ToLower(); $hash+'  '+$name }
 [IO.File]::WriteAllText((Join-Path $release 'SHA256SUMS.txt'),($lines -join "`n")+"`n",[Text.UTF8Encoding]::new($false))
}
Write-Checksums $names
$archiveName='Okarina-Studio-'+$package.version+'-Windows-x64.zip'
$files=@($names)+@('SHA256SUMS.txt') | ForEach-Object { Join-Path $release $_ }
Compress-Archive -LiteralPath $files -DestinationPath (Join-Path $release $archiveName) -CompressionLevel Fastest -Force
Write-Checksums (@($names)+@($archiveName))
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead((Join-Path $release $archiveName))
try {
 if($archive.Entries.Count -ne 5) { throw 'Release-ZIP enthält nicht die erwarteten fünf Dateien.' }
 $archive.Entries | Select-Object FullName,Length
} finally { $archive.Dispose() }
