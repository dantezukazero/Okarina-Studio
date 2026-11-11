"use strict";
const $ = (id) => document.getElementById(id),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let library = structuredClone(window.LIBRARY),
  settings = {
    offset: 0,
    fold: true,
    favorites: [],
    language: "de",
    autoCatalog: false,
  },
  selected = library.songs[0].id,
  family = "all",
  game = "all",
  level = "all",
  query = "",
  index = 0,
  playing = false,
  timer = null,
  loop = false,
  loopSection = -1,
  tempo = 85,
  editing = null,
  context = null,
  voice = null,
  saveQueue = Promise.resolve(),
  toastTimer;
const song = () => library.songs.find((s) => s.id === selected),
  flatten = () =>
    song().sections.flatMap((s, section) =>
      s.events.map((e) => ({ ...e, section })),
    ),
  resolved = (e) => Core.resolve(e.note, +settings.offset, settings.fold);
const display = (note) => Core.display(note, settings.language);
const POS = {
  L4: [51, 48, 8.7],
  L3: [73, 42, 8.7],
  L2: [96, 39, 8.7],
  L1: [119, 42, 8.7],
  R1: [145, 50, 8.7],
  R2: [165, 55, 8.7],
  R3: [185, 60, 8.7],
  R4: [203, 65, 8],
  SL: [97, 58, 4.3],
  SR: [164, 73, 4.3],
  LT: [71, 94, 8.2],
  RT: [148, 94, 8.2],
};
function diagram(note) {
  if (note === "R")
    return '<svg viewBox="0 0 230 124"><text x="115" y="80" text-anchor="middle" fill="#7d8b71" font-size="40">𝄽</text></svg>';
  const holes = library.fingerings[note];
  if (!holes)
    return '<svg viewBox="0 0 230 124"><text x="115" y="73" text-anchor="middle" fill="#b57853" font-size="13">Außerhalb des Umfangs</text></svg>';
  return `<svg viewBox="0 0 230 124" role="img" aria-label="Griff ${esc(display(note))}"><path d="M31 77 Q18 70 14 81 L9 101 Q10 109 20 111 L35 99Z" fill="#e0e9d9" stroke="#8a9b79"/><path d="M34 77 Q33 54 47 37 Q66 22 97 22 Q148 23 212 49 Q222 54 220 63 Q219 67 211 70 Q174 87 116 108 Q87 118 57 111 L31 103 Q21 97 34 77Z" fill="#fafbf3" stroke="#8a9b79" stroke-width="2"/><path d="M37 83 208 83" stroke="#d9e1cf"/>${Object.entries(
    POS,
  )
    .map(
      ([h, [x, y, r]]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${holes.includes(h) ? "#668451" : "#fffefb"}" stroke="#748369" stroke-width="1.5"/>`,
    )
    .join(
      "",
    )}<text x="91" y="117" font-size="8" fill="#8b977f">Daumen</text></svg>`;
}
function notify(message) {
  $("toast").textContent = message;
  $("toast").style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").style.display = "none"), 3500);
}
function persist() {
  const snapshot = structuredClone({ ...library, settings });
  $("saveState").textContent = "Wird gespeichert …";
  saveQueue = saveQueue
    .catch(() => {})
    .then(() => window.desktop.save(snapshot))
    .then(() => {
      $("saveState").textContent = "Gespeichert auf diesem PC · offline";
      return true;
    })
    .catch((e) => {
      $("saveState").textContent = "Speichern fehlgeschlagen – JSON sichern";
      notify("Speichern fehlgeschlagen: " + e.message);
      return false;
    });
  return saveQueue;
}
function stop() {
  playing = false;
  clearTimeout(timer);
  if (voice) {
    try {
      voice.stop();
    } catch {}
    voice = null;
  }
  const b = $("play");
  if (b) b.textContent = "▶ Abspielen";
}
async function audio() {
  context ??= new AudioContext();
  if (context.state === "suspended") await context.resume();
  return context;
}
async function tone(note, seconds = 0.35) {
  if (note === "R") return;
  const ctx = await audio();
  if (voice) {
    try {
      voice.stop();
    } catch {}
  }
  const osc = ctx.createOscillator(),
    gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 440 * 2 ** ((Core.midi(note) - 69) / 12);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.018);
  gain.gain.setTargetAtTime(
    0,
    ctx.currentTime + Math.max(0.03, seconds - 0.045),
    0.015,
  );
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + seconds + 0.06);
  voice = osc;
}
function highlight() {
  document
    .querySelectorAll(".note.active")
    .forEach((e) => e.classList.remove("active"));
  const card = document.querySelector(`.note[data-index="${index}"]`);
  if (card) {
    card.classList.add("active");
    if (playing) {
      const box = $("noteScroll");
      const top =
        card.getBoundingClientRect().top -
        box.getBoundingClientRect().top +
        box.scrollTop;
      if (
        top < box.scrollTop ||
        top + card.offsetHeight > box.scrollTop + box.clientHeight
      )
        box.scrollTop = top - 20;
    }
  }
  const progress = $("progress");
  if (progress) progress.textContent = `${index + 1} / ${flatten().length}`;
}
function bounds() {
  const e = flatten();
  if (loopSection < 0) return [0, e.length];
  const start = e.findIndex((n) => n.section === loopSection);
  return [start, start + e.filter((n) => n.section === loopSection).length];
}
function tick() {
  if (!playing) return;
  const events = flatten(),
    [start, end] = bounds();
  if (index < start || index >= end) index = start;
  const e = events[index],
    r = resolved(e),
    ms = (e.beats * 60000) / tempo;
  highlight();
  if (r.valid)
    tone(r.note, Math.max(0.03, (ms / 1000) * 0.9)).catch((e) => {
      stop();
      notify("Audio konnte nicht gestartet werden: " + e.message);
    });
  timer = setTimeout(() => {
    if (!playing) return;
    index++;
    if (index >= end) {
      if (loop) {
        index = start;
        tick();
      } else {
        stop();
        index = start;
        highlight();
      }
    } else tick();
  }, ms);
}
async function toggle() {
  if (playing) {
    stop();
    return;
  }
  await audio();
  playing = true;
  $("play").textContent = "Ⅱ Pause";
  tick();
}
function selectSong(id) {
  stop();
  selected = id;
  index = 0;
  loopSection = -1;
  tempo = Math.min(240, Math.max(30, song().bpm));
  renderList();
  renderPractice();
}
function renderWorlds() {
  const families = [...new Set(library.songs.map((s) => s.family))].sort(
    (a, b) =>
      a === "The Legend of Zelda"
        ? -1
        : b === "The Legend of Zelda"
          ? 1
          : a === "Final Fantasy"
            ? -1
            : b === "Final Fantasy"
              ? 1
              : a === "Kingdom Hearts"
                ? -1
                : b === "Kingdom Hearts"
                  ? 1
                  : a.localeCompare(b),
  );
  $("worlds").innerHTML = families
    .map(
      (f) =>
        `<button class="nav ${family === f ? "active" : ""}" data-family="${esc(f)}">${f === "The Legend of Zelda" ? "△" : f === "Final Fantasy" ? "✦" : "♫"} <span>${esc(f === "The Legend of Zelda" ? "The Legend of Zelda" : f)}</span></button>${family === f ? [...new Set(library.songs.filter((s) => s.family === f).map((s) => s.game))].map((g) => `<button data-user-text class="game-nav ${game === g ? "active" : ""}" data-game="${esc(g)}">${esc(g)}</button>`).join("") : ""}`,
    )
    .join("");
  document.querySelectorAll("[data-family]").forEach(
    (b) =>
      (b.onclick = () => {
        family = b.dataset.family;
        game = "all";
        renderWorlds();
        renderGameFilter();
        renderList();
      }),
  );
  document.querySelectorAll("[data-game]").forEach(
    (b) =>
      (b.onclick = () => {
        game = b.dataset.game;
        renderWorlds();
        renderGameFilter();
        renderList();
      }),
  );
  document
    .querySelectorAll(".sidebar>.nav")
    .forEach((b) => b.classList.toggle("active", family === b.dataset.family));
  $("total").textContent = library.songs.length;
}
function renderGameFilter() {
  const games = [
    ...new Set(
      library.songs
        .filter(
          (s) =>
            family === "all" || family === "favorites" || s.family === family,
        )
        .map((s) => s.game),
    ),
  ];
  $("gameFilter").innerHTML =
    '<option value="all">Alle Spiele</option>' +
    games
      .map((g) => `<option value="${esc(g)}" data-user-text>${esc(g)}</option>`)
      .join("");
  $("gameFilter").value = game;
}
function renderList() {
  const results = library.songs.filter(
    (s) =>
      (family === "all" ||
        (family === "favorites"
          ? settings.favorites.includes(s.id)
          : s.family === family)) &&
      (game === "all" || s.game === game) &&
      (level === "all" || s.level === level) &&
      `${s.title} ${s.game} ${s.family}`.toLocaleLowerCase().includes(query),
  );
  $("libraryTitle").textContent =
    family === "all"
      ? "Deine Melodien"
      : family === "favorites"
        ? "Meine Favoriten"
        : family;
  $("resultCount").textContent = results.length + " Fassungen";
  $("songs").innerHTML = results.length
    ? results
        .map(
          (s) =>
            `<button class="song-card ${s.id === selected ? "active" : ""}" data-song="${esc(s.id)}"><span class="song-icon">${s.family === "The Legend of Zelda" ? "△" : "♫"}</span><span><strong>${esc(s.title)}</strong><small>${esc(s.game)}</small></span><span class="song-meta">${s.level === "beginner" ? "Einsteiger" : "Fortgeschritten"}<br>${s.sections.flatMap((x) => x.events).filter((e) => e.note !== "R").length} Töne</span></button>`,
        )
        .join("")
    : '<div class="empty">Hier ist es noch still.<br>Ändere die Suche oder lege ein eigenes Lied an.</div>';
  document
    .querySelectorAll("[data-song]")
    .forEach((b) => (b.onclick = () => selectSong(b.dataset.song)));
}
function tuningOptions() {
  return Array.from({ length: 25 }, (_, i) => i - 12)
    .map(
      (n) =>
        `<option value="${n}" ${+settings.offset === n ? "selected" : ""}>${display(Core.name(72 + n))}${n === 0 ? " · Standard" : ""}</option>`,
    )
    .join("");
}
function renderPractice() {
  const s = song(),
    events = flatten();
  const variants = library.songs.filter(
    (x) => x.title === s.title && x.game === s.game,
  );
  let count = 0;
  const adjusted = events.filter(
      (e) => resolved(e).shifted || e.baseFold,
    ).length,
    invalid = events.filter((e) => !resolved(e).valid).length;
  $("practice").innerHTML =
    `<div class="practice-head"><div class="practice-top"><span class="tag" data-user-text>${esc(s.family.toUpperCase())}</span><button class="star" id="favorite" aria-label="Favorit umschalten">${settings.favorites.includes(s.id) ? "★" : "☆"}</button></div><h2>${esc(s.title)}</h2><div class="print-title">12-Loch-Okarina · Stimmung ${esc(display(Core.name(72 + settings.offset)))} · klingende Töne</div><div class="practice-sub">${esc(s.game)} · ${s.level === "beginner" ? "Kurze Einstiegsfassung" : "Längere Melodiefassung"}</div><div class="variant-row">${variants.map((v) => `<button class="variant ${v.id === s.id ? "active" : ""}" data-variant="${esc(v.id)}">${v.level === "beginner" ? "Einsteiger · kurz" : "Fortgeschritten · lang"}</button>`).join("")}<button class="variant" id="edit">Bearbeiten</button><button class="variant" id="pdf">PDF speichern</button><button class="variant" id="svg">SVG speichern</button></div></div><div class="player"><div class="player-buttons"><button class="play" id="play">▶ Abspielen</button><button class="step" id="previous" aria-label="Vorheriger Ton">‹</button><button class="step" id="next" aria-label="Nächster Ton">›</button><button class="step" id="restart" aria-label="Zum Anfang">↺</button><label><input type="checkbox" id="loop" ${loop ? "checked" : ""}> Wiederholen</label><span class="muted" id="progress"></span></div><div class="player-settings"><label>Tempo <input type="number" id="tempo" min="30" max="240" value="${tempo}"> BPM</label><label>Stimmung <select id="tuning">${tuningOptions()}</select></label><label><input type="checkbox" id="fold" ${settings.fold ? "checked" : ""}> Oktaven anpassen</label><button class="quiet" id="openTuner">Stimmung finden ↗</button></div><div class="player-settings"><label>Üben <select id="sectionLoop"><option value="-1">Ganzes Lied</option>${s.sections.map((sec, i) => `<option value="${i}" ${loopSection === i ? "selected" : ""}>${esc(sec.label)}</option>`).join("")}</select></label></div></div><div class="notes-area" id="noteScroll">${invalid ? `<div class="notice">${invalid} Töne liegen außerhalb des Tonumfangs. Aktiviere die Oktavanpassung oder verwende eine andere Fassung.</div>` : ""}${adjusted ? `<div class="notice">↕ ${adjusted} Töne sind für den Tonumfang oktavversetzt. Markierte Karten zeigen die angepasste Fassung.</div>` : ""}${s.sections
      .map(
        (sec) =>
          `<div class="section-title"><span>${esc(sec.label)}</span></div><div class="notes">${sec.events
            .map((e) => {
              const r = resolved(e),
                i = count++;
              return `<button class="note ${r.valid ? "" : "invalid"} ${r.shifted || e.baseFold ? "shifted" : ""}" data-index="${i}" aria-label="${esc(r.note === "R" ? "Pause" : display(r.note))}, ${e.beats} Schläge">${diagram(r.valid ? r.grip : "invalid")}<strong>${r.note === "R" ? "Pause" : esc(display(r.note))}</strong><small>${+e.beats.toFixed(2)} ${e.beats === 1 ? "Schlag" : "Schläge"}${+settings.offset !== 0 && r.note !== "R" ? " · Griff " + esc(display(r.grip)) : ""}</small></button>`;
            })
            .join("")}</div>`,
      )
      .join(
        "",
      )}<p class="source">${esc(s.source || "Eigene Melodie")}${s.sourceUrl ? "<br>Quelle: " + esc(s.sourceUrl) : ""}${s.sourceFile ? "<br>MIDI: " + esc(s.sourceFile) : ""}</p></div><div class="practice-foot">● Gefüllt = schließen · ○ Leer = offen · unten = Daumen<br>Anzeige: klingende Töne · B wird als deutsches H angezeigt · Griffsystem aus deiner Vorlage</div>`;
  $("play").onclick = () => toggle().catch((e) => notify(e.message));
  $("previous").onclick = () => step(-1);
  $("next").onclick = () => step(1);
  $("restart").onclick = () => {
    stop();
    index = bounds()[0];
    highlight();
  };
  $("loop").onchange = (e) => (loop = e.target.checked);
  $("tempo").onchange = (e) => {
    tempo = Math.max(30, Math.min(240, +e.target.value || 85));
    e.target.value = tempo;
  };
  $("sectionLoop").onchange = (e) => {
    stop();
    loopSection = +e.target.value;
    index = bounds()[0];
    highlight();
  };
  $("tuning").onchange = (e) => {
    stop();
    settings.offset = +e.target.value;
    persist();
    renderPractice();
    updateInstrument();
  };
  $("fold").onchange = (e) => {
    stop();
    settings.fold = e.target.checked;
    persist();
    renderPractice();
  };
  $("favorite").onclick = () => {
    const i = settings.favorites.indexOf(s.id);
    if (i < 0) settings.favorites.push(s.id);
    else settings.favorites.splice(i, 1);
    persist();
    renderList();
    renderPractice();
  };
  $("edit").onclick = () => openEditor(s);
  $("pdf").onclick = async () => {
    stop();
    try {
      if (await window.desktop.pdf()) notify("PDF gespeichert.");
    } catch (e) {
      notify("PDF fehlgeschlagen: " + e.message);
    }
  };
  $("svg").onclick = exportSvg;
  $("openTuner").onclick = openHelp;
  document
    .querySelectorAll("[data-variant]")
    .forEach((b) => (b.onclick = () => selectSong(b.dataset.variant)));
  document.querySelectorAll("[data-index]").forEach(
    (b) =>
      (b.onclick = () => {
        stop();
        index = +b.dataset.index;
        highlight();
        const r = resolved(flatten()[index]);
        if (r.valid) tone(r.note).catch((e) => notify(e.message));
      }),
  );
  highlight();
}
function step(delta) {
  stop();
  index = Math.max(0, Math.min(flatten().length - 1, index + delta));
  highlight();
  const r = resolved(flatten()[index]);
  if (r.valid) tone(r.note).catch((e) => notify(e.message));
}
async function exportSvg() {
  stop();
  try {
    const s = song();
    let y = 110;
    let content = `<rect width="100%" height="100%" fill="#fffef9"/><text x="30" y="42" font-family="Georgia,serif" font-size="28" fill="#285843">${esc(s.title)}</text><text x="30" y="70" font-family="sans-serif" font-size="13" fill="#65785e">${esc(s.game)} · ${I18n.text("Stimmung")} ${esc(display(Core.name(72 + settings.offset)))}</text>`;
    for (const sec of s.sections) {
      content += `<text x="30" y="${y}" font-family="sans-serif" font-size="16" fill="#285843">${esc(sec.label)}</text>`;
      y += 18;
      sec.events.forEach((e, i) => {
        const r = resolved(e),
          x = 30 + (i % 6) * 155,
          cy = y + Math.floor(i / 6) * 125;
        content += `<g transform="translate(${x},${cy})">${diagram(r.valid ? r.grip : "invalid").replace("<svg ", '<svg width="145" height="90" ')}<text x="72" y="105" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#285843">${r.note === "R" ? I18n.text("Pause") : esc(display(r.note))}${r.shifted || e.baseFold ? " ↕" : ""} · ${+e.beats.toFixed(2)}</text></g>`;
      });
      y += Math.ceil(sec.events.length / 6) * 125 + 30;
    }
    content += `<text x="30" y="${y}" font-family="sans-serif" font-size="11" fill="#65785e">${I18n.text("Gefüllt = schließen · unten = Daumen · ↕ = oktavversetzt · Längen in Schlägen")}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="990" height="${y + 40}" viewBox="0 0 990 ${y + 40}">${content}</svg>`;
    if (await window.desktop.svg(I18n.localizeSvg(svg)))
      notify("SVG gespeichert.");
  } catch (e) {
    notify("SVG fehlgeschlagen: " + e.message);
  }
}
function updateInstrument() {
  document.querySelector(".instrument small").innerHTML =
    `Deluxe Ocarina · gedrucktes Modell<br>Stimmung: ${esc(display(Core.name(72 + settings.offset)))} · ${esc(display(Core.name(69 + settings.offset)))}–${esc(display(Core.name(89 + settings.offset)))}`;
}
function openEditor(s) {
  stop();
  editing = s?.id || null;
  $("editTitle").value = s?.title || "";
  $("editFamily").value = s?.family || "Eigene Sammlung";
  $("editGame").value = s?.game || "Meine Melodien";
  $("editLevel").value = s?.level || "beginner";
  $("editBpm").value = s?.bpm || 85;
  $("editNotes").value = s
    ? s.sections
        .map(
          (sec) =>
            sec.label +
            ": " +
            sec.events
              .map((e) => e.note + (e.beats !== 1 ? ":" + e.beats : ""))
              .join(" "),
        )
        .join("\n")
    : "Melodie: C5 D5 E5 | F5 G5:2";
  $("editError").textContent = "";
  $("deleteSong").hidden = !s;
  $("editor").showModal();
}
$("songForm").onsubmit = (e) => {
  e.preventDefault();
  try {
    const sections = Core.parse($("editNotes").value, library.fingerings);
    if (!sections.length) throw Error("Mindestens ein Abschnitt ist nötig.");
    const title = $("editTitle").value.trim(),
      gameName = $("editGame").value.trim();
    if (!title || !gameName) throw Error("Bitte Titel und Spiel eingeben.");
    const item = {
      id: editing || "custom-" + crypto.randomUUID(),
      title,
      family: $("editFamily").value,
      game: gameName,
      level: $("editLevel").value,
      bpm: +$("editBpm").value,
      sections,
      source: "Eigene oder selbst bearbeitete Melodie.",
    };
    const i = library.songs.findIndex((s) => s.id === editing);
    if (i >= 0) library.songs[i] = item;
    else library.songs.push(item);
    $("editor").close();
    family = "all";
    game = "all";
    level = "all";
    query = "";
    $("search").value = "";
    document
      .querySelectorAll("[data-level]")
      .forEach((b) =>
        b.classList.toggle("selected", b.dataset.level === "all"),
      );
    persist();
    renderWorlds();
    renderGameFilter();
    selectSong(item.id);
  } catch (err) {
    $("editError").textContent = err.message;
  }
};
$("deleteSong").onclick = () => {
  if (library.songs.length < 2) {
    $("editError").textContent = "Ein Lied muss erhalten bleiben.";
    return;
  }
  if (
    !confirm(
      I18n.text(
        "Dieses Lied löschen? Ein Backup lässt sich später wieder importieren.",
      ),
    )
  )
    return;
  library.songs = library.songs.filter((s) => s.id !== editing);
  $("editor").close();
  persist();
  renderWorlds();
  renderGameFilter();
  selectSong(library.songs[0].id);
};
$("closeEditor").onclick = () => $("editor").close();
$("new").onclick = () => openEditor(null);
$("search").oninput = (e) => {
  query = e.target.value.trim().toLocaleLowerCase();
  renderList();
};
$("gameFilter").onchange = (e) => {
  game = e.target.value;
  renderWorlds();
  renderList();
};
document.querySelectorAll("[data-level]").forEach(
  (b) =>
    (b.onclick = () => {
      level = b.dataset.level;
      document
        .querySelectorAll("[data-level]")
        .forEach((x) => x.classList.toggle("selected", x === b));
      renderList();
    }),
);
$("startZelda").onclick = () => {
  family = "The Legend of Zelda";
  game = "Ocarina of Time";
  level = "beginner";
  query = "";
  $("search").value = "";
  document
    .querySelectorAll("[data-level]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.level === level));
  renderWorlds();
  renderGameFilter();
  selectSong(
    library.songs.find((s) => s.game === game && s.level === level)?.id ||
      library.songs[0].id,
  );
  $("libraryTitle").scrollIntoView({ behavior: "smooth" });
};
$("startFfx").onclick = () => {
  family = "Final Fantasy";
  game = "Final Fantasy X";
  level = "all";
  query = "";
  $("search").value = "";
  document
    .querySelectorAll("[data-level]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.level === level));
  renderWorlds();
  renderGameFilter();
  selectSong(
    library.songs.find(
      (s) =>
        s.game === game && s.title === "To Zanarkand" && s.level === "beginner",
    )?.id || library.songs.find((s) => s.game === game).id,
  );
  $("libraryTitle").scrollIntoView({ behavior: "smooth" });
};
function validate(obj) {
  if (
    !obj ||
    !["okarina-studio-v1", "ocarina-tabs-v1"].includes(obj.format) ||
    !Array.isArray(obj.songs) ||
    !obj.songs.length ||
    obj.songs.length > 500
  )
    throw Error(
      "Keine gültige Okarina-Bibliothek (1–500 Lieder erforderlich).",
    );
  const copy = structuredClone(obj);
  copy.fingerings ??= structuredClone(window.LIBRARY.fingerings);
  for (const n of Object.keys(window.LIBRARY.fingerings)) {
    if (
      !Array.isArray(copy.fingerings[n]) ||
      copy.fingerings[n].some((h) => !Object.hasOwn(POS, h))
    )
      throw Error("Ungültige Grifftabelle für " + n);
  }
  let total = 0;
  copy.songs = copy.songs.map((s, i) => {
    if (
      typeof s.title !== "string" ||
      !s.title.trim() ||
      typeof s.game !== "string" ||
      !Array.isArray(s.sections) ||
      !s.sections.length
    )
      throw Error("Lied " + (i + 1) + " ist unvollständig.");
    const sections = s.sections.map((sec) => {
      if (obj.format === "ocarina-tabs-v1")
        return Core.parse(
          (sec.label || "Melodie") + ": " + sec.notes,
          copy.fingerings,
        )[0];
      if (!Array.isArray(sec.events) || !sec.events.length)
        throw Error("Leerer Abschnitt.");
      for (const e of sec.events) {
        if (
          (e.note !== "R" && !Object.hasOwn(copy.fingerings, e.note)) ||
          !Number.isFinite(e.beats) ||
          e.beats <= 0 ||
          e.beats > 32
        )
          throw Error("Ungültiger Ton oder ungültige Notenlänge.");
      }
      return {
        label: String(sec.label || "Melodie"),
        events: sec.events.map((e) => ({
          note: e.note,
          beats: e.beats,
          baseFold: !!e.baseFold,
        })),
      };
    });
    total += sections.reduce((n, x) => n + x.events.length, 0);
    if (total > 30000) throw Error("Bibliothek enthält zu viele Töne.");
    return {
      ...s,
      id: typeof s.id === "string" && s.id.length < 100 ? s.id : "import-" + i,
      family: s.family || "The Legend of Zelda",
      level: ["beginner", "advanced"].includes(s.level) ? s.level : "beginner",
      bpm: Math.min(240, Math.max(30, +s.bpm || 85)),
      sections,
    };
  });
  if (new Set(copy.songs.map((s) => s.id)).size !== copy.songs.length)
    throw Error("Doppelte Lied-IDs.");
  copy.format = "okarina-studio-v1";
  return copy;
}
$("backup").onclick = async () => {
  try {
    if (await window.desktop.export({ ...library, settings }))
      notify("Bibliothek gesichert.");
  } catch (e) {
    notify("Sichern fehlgeschlagen: " + e.message);
  }
};
$("import").onclick = async () => {
  stop();
  try {
    const data = await window.desktop.import();
    if (!data) return;
    const incoming = validate(data);
    if (library.songs.length + incoming.songs.length > 500)
      throw Error("Mehr als 500 Lieder: Import zu groß.");
    for (const n of Object.keys(library.fingerings)) {
      if (
        JSON.stringify([...library.fingerings[n]].sort()) !==
        JSON.stringify([...incoming.fingerings[n]].sort())
      )
        throw Error(
          "Abweichende Grifftabelle: Diese Datei verwendet andere Griffe.",
        );
    }
    const additions = incoming.songs.map((s) => ({
      ...s,
      id: "import-" + crypto.randomUUID(),
    }));
    library.songs.push(...additions);
    persist();
    renderWorlds();
    renderGameFilter();
    selectSong(additions[0].id);
    notify(
      additions.length +
        " Lieder hinzugefügt. Bestehende Lieder bleiben erhalten.",
    );
  } catch (e) {
    notify("Import fehlgeschlagen: " + e.message);
  }
};
let micStream = null,
  micContext = null,
  tunerFrame = null,
  tunerLatest = null,
  tunerHistory = [];
function stopTuner() {
  cancelAnimationFrame(tunerFrame);
  micStream?.getTracks().forEach((t) => t.stop());
  micStream = null;
  micContext?.close();
  micContext = null;
  const b = $("micStart");
  if (b) b.textContent = "Mikrofon starten";
  tunerHistory = [];
}
function openHelp() {
  stop();
  $("helpDiagram").innerHTML = diagram("C5");
  if (!$("tunerBox")) {
    $("helpDiagram").insertAdjacentHTML(
      "afterend",
      `<div class="tuner" id="tunerBox"><strong>Welche Stimmung hat meine Okarina?</strong><p>1. Instrument kurz einspielen. Acht große Fingerlöcher und beide Daumenlöcher vollständig schließen; beide kleinen Zusatzlöcher offen lassen.<br>2. Einen ruhigen, klaren Ton mit natürlichem Blasdruck halten. Nicht durch stärkeres Blasen einen bestimmten Ton erzwingen.<br>3. Mehrfach messen. Der stabile Ton ist ein Hinweis auf die Grundstimmung. Prüfe danach weitere Griffe.</p><button class="step" id="reference">C5 anhören</button><button class="step" id="micStart">Mikrofon starten</button><div class="tuner-readout" id="tunerReadout">–</div><div id="tunerHint">Mikrofon nur während der Messung aktiv. Verarbeitung bleibt auf diesem PC.</div><p><button class="step" id="usePitch" disabled>Gemessenen Grundton übernehmen</button></p><p>Oder manuell wählen: <select id="manualTuning">${tuningOptions()}</select><button class="step" id="applyTuning">Übernehmen</button></p><p class="muted">Die Messung prüft keine einzelnen Tonlöcher. Weichen die Griffe untereinander ab, reicht eine globale Stimmungseinstellung nicht aus. Kleine Cent-Abweichungen entstehen auch durch Atemdruck und Temperatur. Referenz: A4 = 440 Hz.</p></div>`,
    );
    $("reference").onclick = () => {
      stopTuner();
      tone("C5", 1.5).catch((e) => notify(e.message));
    };
    $("micStart").onclick = startTuner;
    $("usePitch").onclick = () => {
      if (tunerLatest !== null) applyTuning(tunerLatest - 72);
    };
    $("applyTuning").onclick = () => applyTuning(+$("manualTuning").value);
  }
  $("manualTuning").value = String(settings.offset);
  $("helpDialog").showModal();
}
function applyTuning(offset) {
  if (offset < -12 || offset > 12) {
    notify(
      "Dieser Grundton liegt außerhalb C4–C6. Bitte Griff und Messung prüfen.",
    );
    return;
  }
  settings.offset = offset;
  stopTuner();
  persist();
  updateInstrument();
  renderPractice();
  $("manualTuning").value = String(offset);
  notify(
    "Stimmung " +
      display(Core.name(72 + offset)) +
      " übernommen. Alle Griffbilder neu berechnet.",
  );
}
async function startTuner() {
  if (micStream) {
    stopTuner();
    return;
  }
  try {
    stop();
    if (voice) {
      try {
        voice.stop();
      } catch {}
    }
    tunerLatest = null;
    $("usePitch").disabled = true;
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    if (!$("helpDialog").open) {
      stopTuner();
      return;
    }
    micContext = new AudioContext();
    await micContext.resume();
    const analyser = micContext.createAnalyser();
    analyser.fftSize = 4096;
    micContext.createMediaStreamSource(micStream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    $("micStart").textContent = "Messung stoppen";
    let last = 0;
    function measure(now) {
      if (!micStream) return;
      if (now - last > 90) {
        last = now;
        analyser.getFloatTimeDomainData(samples);
        const freq = Core.pitch(samples, micContext.sampleRate);
        if (freq) {
          const floating = 69 + 12 * Math.log2(freq / 440),
            nearest = Math.round(floating),
            cents = Math.round((floating - nearest) * 100);
          $("tunerReadout").textContent =
            `${display(Core.name(nearest))} · ${Math.round(freq)} Hz · ${cents > 0 ? "+" : ""}${cents} Cent`;
          tunerHistory.push(nearest);
          if (tunerHistory.length > 12) tunerHistory.shift();
          const stable =
            tunerHistory.length >= 8 &&
            tunerHistory.every((n) => n === nearest);
          tunerLatest = stable ? nearest : null;
          $("usePitch").disabled = !stable || nearest < 60 || nearest > 84;
          $("tunerHint").textContent = stable
            ? "Stabiler Ton erkannt. Nur übernehmen, wenn du den beschriebenen Grundgriff hältst."
            : "Ton ruhig halten – mehrere Messungen werden verglichen.";
        } else {
          $("tunerReadout").textContent = "–";
          $("tunerHint").textContent =
            "Kein stabiler Ton. Näher ans Mikrofon gehen und Nebengeräusche reduzieren.";
          tunerHistory = [];
          tunerLatest = null;
          $("usePitch").disabled = true;
        }
      }
      tunerFrame = requestAnimationFrame(measure);
    }
    tunerFrame = requestAnimationFrame(measure);
  } catch (e) {
    stopTuner();
    $("tunerHint").textContent =
      "Mikrofon nicht verfügbar oder Zugriff verweigert. Du kannst den Vergleichston und die manuelle Auswahl verwenden.";
  }
}
$("help").onclick = openHelp;
$("closeHelp").onclick = () => $("helpDialog").close();
$("helpDialog").addEventListener("close", stopTuner);
document.addEventListener("keydown", (e) => {
  if (
    document.querySelector("dialog[open]") ||
    ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
      document.activeElement.tagName,
    )
  )
    return;
  if (e.code === "Space") {
    e.preventDefault();
    toggle().catch((err) => notify(err.message));
  }
  if (e.code === "ArrowLeft") {
    e.preventDefault();
    step(-1);
  }
  if (e.code === "ArrowRight") {
    e.preventDefault();
    step(1);
  }
});
$("startKh").onclick = () => {
  family = "Kingdom Hearts";
  game = "Kingdom Hearts";
  level = "all";
  query = "";
  $("search").value = "";
  document
    .querySelectorAll("[data-level]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.level === level));
  renderWorlds();
  renderGameFilter();
  selectSong(
    library.songs.find(
      (s) =>
        s.family === family &&
        s.title === "Dearly Beloved" &&
        s.level === "beginner",
    ).id,
  );
  $("libraryTitle").scrollIntoView({ behavior: "smooth" });
};
$("language").onchange = (e) => {
  stop();
  settings.language = e.target.value;
  I18n.setLanguage(settings.language);
  renderWorlds();
  renderGameFilter();
  renderList();
  renderPractice();
  updateInstrument();
  if ($("manualTuning")) $("manualTuning").innerHTML = tuningOptions();
  persist();
};
let catalogChecking = false;
function catalogStatus(message) {
  $("catalogStatus").textContent = message;
}
async function applyCatalog(payload) {
  if (playing || $("editor").open) return { deferred: true };
  await saveQueue;
  if (playing || $("editor").open) return { deferred: true };
  await window.desktop.backupCatalog();
  if (playing || $("editor").open) return { deferred: true };
  const merged = Catalog.merge(library, payload, window.LIBRARY);
  if (!merged.changed) return merged;
  const previous = library;
  library = validate(merged.library);
  if (!(await persist())) {
    library = previous;
    throw Error("Could not save the updated library");
  }
  if (!song()) selected = library.songs[0].id;
  renderWorlds();
  renderGameFilter();
  renderList();
  renderPractice();
  return merged;
}
async function checkCatalog(silent = false) {
  if (catalogChecking) return;
  if (silent && (playing || $("editor").open)) return;
  catalogChecking = true;
  $("libraryUpdate").disabled = true;
  catalogStatus("Bibliothek wird geprüft …");
  try {
    const result = await window.desktop.checkCatalog(
      library.catalogRevision || 1,
    );
    let merged;
    if (result.catalog && result.catalog.revision > library.catalogRevision)
      merged = await applyCatalog(result.catalog);
    if (merged?.deferred) {
      catalogStatus(
        "Neue Bibliothek bereit. Wiedergabe stoppen oder Editor schließen und erneut prüfen.",
      );
      return;
    }
    if (result.status === "error") {
      catalogStatus(
        "Update nicht möglich. Die Offline-Bibliothek bleibt verfügbar.",
      );
      if (!silent)
        notify(I18n.text("Update fehlgeschlagen: ") + result.message);
      return;
    }
    if (result.status === "requires-app") {
      catalogStatus(
        "Für diese Bibliothek ist eine neuere Programmversion nötig. Siehe GitHub Releases.",
      );
      return;
    }
    if (merged?.changed) {
      const message = `Bibliothek aktualisiert: ${merged.added} neu, ${merged.updated} korrigiert, ${merged.preserved} eigene Fassungen behalten.`;
      catalogStatus(message);
      if (!silent || merged.added || merged.updated) notify(message);
    } else {
      catalogStatus(
        "Bibliothek ist aktuell. Revision " + library.catalogRevision,
      );
      if (!silent)
        notify("Bibliothek ist aktuell. Revision " + library.catalogRevision);
    }
  } catch (e) {
    catalogStatus(
      "Update nicht möglich. Die Offline-Bibliothek bleibt verfügbar.",
    );
    if (!silent) notify(I18n.text("Update fehlgeschlagen: ") + e.message);
  } finally {
    catalogChecking = false;
    $("libraryUpdate").disabled = false;
  }
}
$("libraryUpdate").onclick = () => checkCatalog(false);
$("autoCatalog").onchange = async (e) => {
  settings.autoCatalog = e.target.checked;
  await persist();
  if (settings.autoCatalog) checkCatalog(true);
};
setInterval(
  () => {
    if (settings.autoCatalog) checkCatalog(true);
  },
  6 * 60 * 60 * 1000,
);
I18n.start();
(async () => {
  let added = 0,
    needsSave = false;
  try {
    const stored = await window.desktop.load();
    if (stored) {
      const update = Core.updateLibrary(validate(stored), window.LIBRARY);
      library = update.library;
      added = update.added;
      needsSave = added > 0 || !Array.isArray(stored.bundledIds);
      if (stored.settings) {
        settings.language = stored.settings.language === "en" ? "en" : "de";
        settings.autoCatalog = stored.settings.autoCatalog === true;
        settings.offset =
          Number.isInteger(stored.settings.offset) &&
          Math.abs(stored.settings.offset) <= 12
            ? stored.settings.offset
            : 0;
        settings.fold = stored.settings.fold !== false;
        settings.favorites = Array.isArray(stored.settings.favorites)
          ? stored.settings.favorites
          : [];
      }
    }
  } catch (e) {
    notify("Gespeicherte Bibliothek konnte nicht geladen werden: " + e.message);
  }
  I18n.setLanguage(settings.language);
  library = Catalog.initialize(library, window.LIBRARY);
  try {
    const cached = await window.desktop.catalogCache();
    if (cached && cached.revision > library.catalogRevision) {
      await saveQueue;
      await window.desktop.backupCatalog();
      const merged = Catalog.merge(library, cached, window.LIBRARY);
      library = validate(merged.library);
      added += merged.added;
      needsSave = needsSave || merged.changed;
    }
  } catch (e) {
    notify(I18n.text("Update fehlgeschlagen: ") + e.message);
  }
  $("autoCatalog").checked = settings.autoCatalog;
  catalogStatus(
    "Bibliothek offline verfügbar. Revision " + library.catalogRevision,
  );
  selected = library.songs[0].id;
  tempo = song().bpm;
  renderWorlds();
  renderGameFilter();
  renderList();
  renderPractice();
  updateInstrument();
  if (needsSave) await persist();
  if (added)
    notify(
      added +
        " neue Fassungen ergänzt – deine Lieder und Einstellungen bleiben erhalten.",
    );
  if (settings.autoCatalog) checkCatalog(true);
})();
