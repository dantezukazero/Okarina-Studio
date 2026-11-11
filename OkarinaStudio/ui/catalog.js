(function (root) {
  "use strict";
  const HOLES = [
    "L4",
    "L3",
    "L2",
    "L1",
    "R1",
    "R2",
    "R3",
    "R4",
    "SL",
    "SR",
    "LT",
    "RT",
  ];
  const NOTES = [
    "A4",
    "A#4",
    "B4",
    "C5",
    "C#5",
    "D5",
    "D#5",
    "E5",
    "F5",
    "F#5",
    "G5",
    "G#5",
    "A5",
    "A#5",
    "B5",
    "C6",
    "C#6",
    "D6",
    "D#6",
    "E6",
    "F6",
  ];
  function string(value, max, label) {
    if (typeof value !== "string" || !value.trim() || value.length > max)
      throw Error("Invalid catalog " + label);
    return value;
  }
  function song(value, fingerings) {
    if (!value || typeof value !== "object")
      throw Error("Invalid catalog song");
    const id = string(value.id, 100, "ID");
    if (
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id) ||
      ["constructor", "prototype", "__proto__"].includes(id)
    )
      throw Error("Invalid catalog ID");
    if (
      !["beginner", "advanced"].includes(value.level) ||
      !Number.isFinite(value.bpm) ||
      value.bpm < 30 ||
      value.bpm > 240
    )
      throw Error("Invalid catalog difficulty or tempo");
    if (
      !Array.isArray(value.sections) ||
      !value.sections.length ||
      value.sections.length > 1000
    )
      throw Error("Invalid catalog sections");
    const sections = value.sections.map((sec) => {
      if (
        !Array.isArray(sec.events) ||
        !sec.events.length ||
        sec.events.length > 5000
      )
        throw Error("Invalid catalog events");
      return {
        label: string(sec.label, 160, "section"),
        events: sec.events.map((e) => {
          if (
            !e ||
            (e.note !== "R" && !Object.hasOwn(fingerings, e.note)) ||
            !Number.isFinite(e.beats) ||
            e.beats <= 0 ||
            e.beats > 32
          )
            throw Error("Invalid catalog note or duration");
          return { note: e.note, beats: e.beats, baseFold: !!e.baseFold };
        }),
      };
    });
    const result = {
      id,
      title: string(value.title, 160, "title"),
      family: string(value.family, 120, "family"),
      game: string(value.game, 120, "game"),
      level: value.level,
      bpm: value.bpm,
      sections,
    };
    for (const key of ["source", "sourceUrl", "sourceFile"])
      if (value[key] !== undefined) {
        if (typeof value[key] !== "string" || value[key].length > 2000)
          throw Error("Invalid catalog source");
        result[key] = value[key];
      }
    return result;
  }
  function validate(value, reference) {
    if (
      !value ||
      value.format !== "okarina-catalog-v1" ||
      value.schemaVersion !== 1 ||
      !Number.isSafeInteger(value.revision) ||
      value.revision < 1
    )
      throw Error("Unsupported catalog format or revision");
    if (!/^\d+\.\d+\.\d+$/.test(value.minAppVersion || ""))
      throw Error("Invalid catalog app version");
    if (
      !Array.isArray(value.songs) ||
      !value.songs.length ||
      value.songs.length > 500
    )
      throw Error("Invalid catalog song count");
    const fingerings = {};
    if (!value.fingerings || typeof value.fingerings !== "object")
      throw Error("Invalid catalog fingering chart");
    for (const note of NOTES) {
      const holes = value.fingerings[note];
      if (
        !Array.isArray(holes) ||
        holes.some((h) => !HOLES.includes(h)) ||
        new Set(holes).size !== holes.length
      )
        throw Error("Invalid catalog fingering");
      fingerings[note] = [...holes];
      if (
        reference &&
        JSON.stringify([...holes].sort()) !==
          JSON.stringify([...(reference[note] || [])].sort())
      )
        throw Error("Catalog uses incompatible fingerings");
    }
    const songs = value.songs.map((s) => song(s, fingerings));
    if (new Set(songs.map((s) => s.id)).size !== songs.length)
      throw Error("Duplicate catalog song IDs");
    if (
      songs.reduce(
        (n, s) => n + s.sections.reduce((v, sec) => v + sec.events.length, 0),
        0,
      ) > 30000
    )
      throw Error("Catalog contains too many notes");
    return {
      format: value.format,
      schemaVersion: 1,
      revision: value.revision,
      minAppVersion: value.minAppVersion,
      fingerings,
      songs,
    };
  }
  function canonical(value) {
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    if (value && typeof value === "object")
      return (
        "{" +
        Object.keys(value)
          .sort()
          .map((k) => JSON.stringify(k) + ":" + canonical(value[k]))
          .join(",") +
        "}"
      );
    return JSON.stringify(value);
  }
  function fingerprint(value, fingerings) {
    try {
      return canonical(song(value, fingerings));
    } catch {
      return canonical(value);
    }
  }
  function initialize(library, bundled) {
    const result = structuredClone(library);
    const existing =
      result.catalogBaselines && typeof result.catalogBaselines === "object"
        ? result.catalogBaselines
        : {};
    result.catalogBaselines = Object.fromEntries(
      bundled.songs.map((s) => [
        s.id,
        typeof existing[s.id] === "string"
          ? existing[s.id]
          : fingerprint(s, bundled.fingerings),
      ]),
    );
    for (const [id, baseline] of Object.entries(existing))
      if (
        typeof baseline === "string" &&
        !["__proto__", "constructor", "prototype"].includes(id)
      )
        result.catalogBaselines[id] = baseline;
    result.catalogRevision = Number.isSafeInteger(result.catalogRevision)
      ? result.catalogRevision
      : bundled.catalogRevision || 1;
    return result;
  }
  function merge(library, payload, bundled) {
    const remote = validate(payload, library.fingerings);
    const result = initialize(library, bundled);
    if (remote.revision < result.catalogRevision)
      return {
        library: result,
        added: 0,
        updated: 0,
        preserved: 0,
        changed: false,
      };
    const known = new Set(result.bundledIds || bundled.legacyBundledIds || []),
      positions = new Map(result.songs.map((s, i) => [s.id, i]));
    let added = 0,
      updated = 0,
      preserved = 0;
    for (const incoming of remote.songs) {
      const baseline = result.catalogBaselines[incoming.id],
        next = fingerprint(incoming, result.fingerings),
        position = positions.get(incoming.id);
      if (position !== undefined) {
        const current = fingerprint(result.songs[position], result.fingerings);
        if (current === baseline && current !== next) {
          result.songs[position] = structuredClone(incoming);
          updated++;
        } else if (baseline && baseline !== next && current !== next) {
          preserved++;
        }
      } else if (!known.has(incoming.id)) {
        positions.set(incoming.id, result.songs.length);
        result.songs.push(structuredClone(incoming));
        added++;
      }
      known.add(incoming.id);
      result.catalogBaselines[incoming.id] = next;
    }
    if (result.songs.length > 500)
      throw Error(
        "Library limit reached. Export or remove some songs before updating.",
      );
    const changed =
      result.catalogRevision !== remote.revision ||
      added > 0 ||
      updated > 0 ||
      canonical(result.catalogBaselines) !==
        canonical(library.catalogBaselines || {});
    result.catalogRevision = remote.revision;
    result.bundledIds = [...known];
    return { library: result, added, updated, preserved, changed };
  }
  const api = { validate, normalizeSong: song, fingerprint, initialize, merge };
  if (typeof module !== "undefined") module.exports = api;
  else root.Catalog = api;
})(globalThis);
