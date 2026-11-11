Okarina Studio is a **Zelda-first ocarina practice app** with additional Final Fantasy and Kingdom Hearts collections.

## New in 1.3.0: independent library updates

- **Update melodies** checks the public GitHub catalog without downloading another app executable.
- **Automatically update melodies** is optional and off by default. When enabled, it checks on startup and every six hours while the app is running.
- New songs are added. Corrections update untouched originals; personal edits, deleted entries, custom songs, favorites, tuning and language settings are preserved.
- Downloads are restricted to this project's HTTPS catalog and checked for format, supported notes/fingerings, size and SHA-256 checksum. Only JSON data is downloaded, not executable code.
- The last verified catalog is cached for offline use. Failed or invalid downloads do not replace it.
- A local `library.before-catalog-update.json` backup is made before applying changes. Playback or an open editor defers application; stop or close it and check again.

## Publish new melodies

Create or edit songs in the app, export JSON, then run:

```powershell
cd OkarinaStudio
npm run library:import -- "C:\path\Okarina-Bibliothek.json"
npm run library:publish
git add ../library
git commit -m "Update melody catalog"
git push
```

[Full catalog maintenance guide](https://github.com/dantezukazero/Okarina-Studio/blob/main/library/README.md)

No personal songs are uploaded by the app. The import command publishes only the export chosen by the maintainer. Stable song IDs allow later corrections without duplicates.

## Download and start

Download `Okarina-Studio-1.3.0-Windows-x64.zip`, extract it, and run `Okarina-Studio.exe`. Close an older version first. Version 1.3.0 is required once to enable the new catalog update mechanism; future melody-only updates do not require another EXE.

The collection still contains **86 arrangements**: 18 Zelda, 48 Final Fantasy and 20 Kingdom Hearts. Existing app data is preserved. The interface remains selectable in English and German.

**Verified:** catalog merge/preservation, export/import/publish workflow, checksums, invalid manifests and payloads, incompatible versions, offline fallback, live GitHub download, update UI, automatic preference persistence, existing playback/import/export/tuner/language checks, and the packaged Windows application.

The NFO contains the [MakerWorld model and print profile](https://makerworld.com/de/models/1249288-deluxe-ocarina-fully-playable#profileId-1271476). The printed instrument's actual tuning must be checked locally. Longer arrangements adapt selected MIDI voices, not complete original scores. Unofficial fan project, not affiliated with Nintendo, Square Enix or Disney.
