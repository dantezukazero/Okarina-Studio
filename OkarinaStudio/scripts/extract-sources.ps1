param([Parameter(Mandatory=$true)][string]$ArchivePath,[Parameter(Mandatory=$true)][string]$DestinationPath,[Parameter(Mandatory=$true)][string]$ListPath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$destination=[IO.Path]::GetFullPath($DestinationPath)
[IO.Directory]::CreateDirectory($destination) | Out-Null
$wanted=@{}
foreach($file in (Get-Content -LiteralPath $ListPath -Raw | ConvertFrom-Json)) {
 if([IO.Path]::GetFileName($file) -ne $file -or $file -notmatch '\.mid$') { throw 'Ungültiger Dateiname in der Quellenliste.' }
 $wanted[$file]=$true
}
$archive=[IO.Compression.ZipFile]::OpenRead($ArchivePath)
try {
 foreach($entry in $archive.Entries) {
  if($entry.FullName.StartsWith('__MACOSX/')) { continue }
  $flat=$entry.FullName.Replace('/','__')
  if($wanted.ContainsKey($flat)) {
   $target=[IO.Path]::GetFullPath([IO.Path]::Combine($destination,$flat))
   if([IO.Path]::GetDirectoryName($target) -ne $destination) { throw 'Ziel liegt außerhalb des Quellenverzeichnisses.' }
   [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$target,$true)
   $wanted.Remove($flat)
  }
 }
 if($wanted.Count) { throw ('Dateien fehlen im Archiv: '+($wanted.Keys -join ', ')) }
} finally { $archive.Dispose() }
