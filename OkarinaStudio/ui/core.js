(function (root) {
  "use strict";
  const names = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  function midi(note) {
    const m = /^([A-G])(#?)([0-8])$/.exec(note);
    if (!m) throw Error("Ungültiger Ton: " + note);
    return names.indexOf(m[1] + m[2]) + (+m[3] + 1) * 12;
  }
  function name(n) {
    return names[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);
  }
  function display(n) {
    return String(n).replace(/^B/, "H").replace(/^A#/, "B♭").replace("#", "♯");
  }
  function parse(text, fingerings) {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const m = /^([^:]+):\s*(.*)$/.exec(line);
        const label = m ? m[1] : "Melodie";
        const raw = m ? m[2] : line;
        const events = [];
        for (const t of raw
          .replaceAll("|", " | ")
          .split(/\s+/)
          .filter(Boolean)) {
          if (t === "|") continue;
          const match = /^([A-G]#?[0-8]|R)(?::(\d+(?:\.\d+)?))?$/.exec(t);
          if (!match) throw Error("Ungültige Eingabe: " + t);
          const beats = match[2] ? +match[2] : 1;
          if (beats <= 0 || beats > 32)
            throw Error("Notenlänge muss zwischen 0 und 32 liegen.");
          if (match[1] !== "R" && !Object.hasOwn(fingerings, match[1]))
            throw Error("Außerhalb der C-Vorlage (A4–F6): " + match[1]);
          events.push({ note: match[1], beats });
        }
        if (!events.length) throw Error("Abschnitt ohne Töne: " + label);
        return { label, events };
      });
  }
  function resolve(note, offset, fold) {
    if (note === "R")
      return { note: "R", grip: "R", shifted: false, valid: true };
    let pitch = midi(note),
      grip = pitch - offset;
    const original = pitch;
    if (fold) {
      while (grip < 69) {
        grip += 12;
        pitch += 12;
      }
      while (grip > 89) {
        grip -= 12;
        pitch -= 12;
      }
    }
    return {
      note: name(pitch),
      grip: name(grip),
      shifted: pitch !== original,
      valid: grip >= 69 && grip <= 89,
    };
  }
  function pitch(samples, rate) {
    let power = 0;
    for (const v of samples) power += v * v;
    if (Math.sqrt(power / samples.length) < 0.012) return null;
    const min = Math.floor(rate / 2400),
      max = Math.min(Math.floor(rate / 150), Math.floor(samples.length / 2));
    const diff = new Float64Array(max + 1);
    let sum = 0;
    for (let tau = 1; tau <= max; tau++) {
      let d = 0;
      for (let i = 0; i < samples.length - max; i++) {
        const v = samples[i] - samples[i + tau];
        d += v * v;
      }
      sum += d;
      diff[tau] = sum ? (d * tau) / sum : 1;
      if (tau > min && diff[tau] < 0.12) {
        let best = tau;
        while (best < max) {
          let next = 0;
          for (let i = 0; i < samples.length - max; i++) {
            const v = samples[i] - samples[i + best + 1];
            next += v * v;
          }
          sum += next;
          diff[best + 1] = (next * (best + 1)) / sum;
          if (diff[best + 1] >= diff[best]) break;
          best++;
        }
        const a = diff[best - 1],
          b = diff[best],
          c = diff[best + 1];
        const correction =
          Number.isFinite(c) && a - 2 * b + c !== 0
            ? (a - c) / (2 * (a - 2 * b + c))
            : 0;
        return rate / (best + correction);
      }
    }
    return null;
  }
  function updateLibrary(stored, bundled) {
    const result = structuredClone(stored);
    const known = new Set(
      Array.isArray(stored.bundledIds)
        ? stored.bundledIds
        : bundled.legacyBundledIds || [],
    );
    const present = new Set(result.songs.map((s) => s.id));
    let added = 0;
    for (const s of bundled.songs) {
      if (!known.has(s.id) && !present.has(s.id)) {
        result.songs.push(structuredClone(s));
        present.add(s.id);
        added++;
      }
    }
    result.bundledIds = [
      ...new Set([...known, ...bundled.songs.map((s) => s.id)]),
    ];
    return { library: result, added };
  }
  const api = { midi, name, display, parse, resolve, pitch, updateLibrary };
  if (typeof module !== "undefined") module.exports = api;
  else root.Core = api;
})(globalThis);
