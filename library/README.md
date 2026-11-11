# Melody catalog

This is the independently versioned song database for Okarina Studio **1.3.0 or newer**. Melody-only changes do not require a new Windows executable.

## Add or correct songs using the app

1. Create or edit songs in Okarina Studio and export the library as JSON.
2. From the `OkarinaStudio` directory, import the file you want to publish:

   ```powershell
   npm run library:import -- "C:\path\Okarina-Bibliothek.json"
   npm run library:publish
   ```

3. Review the changes, then commit and push the `library` directory:

   ```powershell
   git add ../library
   git commit -m "Update melody catalog"
   git push
   ```

The import command keeps song IDs, merges additions/corrections and increases the revision when something changes. JSON exports from the original HTML editor are also supported. Only the selected export is imported; ordinary app update checks never upload personal songs.

## Edit JSON directly

Edit `catalog.json`, keep existing song IDs stable, and increase its integer `revision`. New songs need a unique, stable ID. Then run `npm run library:publish` from `OkarinaStudio` and push the result. The publisher validates notes, durations, the fingering chart, IDs and payload size before generating the update manifest.

Changing the fingering system or schema requires a compatible application update. The publisher refuses changed data without a revision increase.

## How updates work

- `catalog.json` is the editable source.
- `manifest.json` contains the revision, minimum app version, payload filename, byte count and SHA-256 checksum.
- `catalog-r<revision>-<hash>.json` is an immutable download payload. Keep previously published payloads; clients may briefly receive a cached older manifest.
- The app reads only JSON from this repository's fixed HTTPS endpoint. It does not download or execute program code.
- **Update melodies** checks manually. **Automatically update melodies** is off by default; when enabled it checks on startup and every six hours while the app is running.
- A verified copy is cached locally for offline use. Invalid or incomplete downloads do not replace it.
- New songs are added. Official corrections replace an existing song only if it still matches the previously published original. Personal edits and deleted entries are preserved. Songs omitted from a later catalog are not automatically removed locally.
- Before applying an update, the app saves `library.before-catalog-update.json` in its Windows user-data folder. Existing favorites, tuning and language settings are preserved.

## Include the latest catalog in a new app build

```powershell
npm run library:bundle
npm run build
```

This refreshes the bundled offline starting library. It is optional for melody-only online updates. The legacy MIDI preparation tools are separate; they do not publish an online update by themselves.
