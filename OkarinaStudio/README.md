# Okarina Studio — source directory

A Zelda-first practice app for a real 12-hole ocarina, with Final Fantasy and Kingdom Hearts as additional collections. The interface supports English and German.

See the [main project README](../README.md) for screenshots, the collection list, the printed instrument, source credits and downloads. [German documentation](../README.de.md) is also available.

## Development

Run these commands from this directory:

```powershell
npm ci
npm start
npm test
npm run test:ui
npm run build
node scripts/packaged.cjs
npm run release:package
```

The Windows executable is created at `dist/Okarina-Studio.exe`. The complete distribution ZIP and checksums are placed in `dist/release`.

User data is stored in `%APPDATA%/okarina-studio/library.json`. Updates preserve custom songs, edits, deleted entries, favorites, tuning and language settings. Use the app's JSON backup for an additional copy.

The checked-in `ui/library.js` is enough to run and build. `npm run library:prepare` optionally downloads the documented source MIDI archives and regenerates the bundled note data. Downloaded archives and raw MIDI files are excluded from Git.

Unofficial fan project, not affiliated with Nintendo, Square Enix or Disney. Third-party compositions and transcriptions belong to their respective rights holders. See the main README for attribution and the limitations of the fingering chart and tuning measurement.
