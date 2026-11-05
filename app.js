/* =========================================================
   毒物谱 · Poisons & Pathogens
   Vanilla JS only. Entries load from the global data files.
   ========================================================= */

(function () {
  "use strict";

  const META = window.POISON_META;
  const COMPARE_REFERENCES = Array.isArray(window.POISON_COMPARE_REFERENCES) ? window.POISON_COMPARE_REFERENCES : [];
  const COMPARE_MAP = new Map(COMPARE_REFERENCES.map((entry) => [entry.id, entry]));
  const PLANT_COMPARE_MAP = window.POISON_PLANT_COMPARISONS || {};
  const RAW_ENTRIES = [
    ...(Array.isArray(window.POISON_PLANTS) ? window.POISON_PLANTS : []),
    ...(Array.isArray(window.POISON_SNAKES) ? window.POISON_SNAKES : []),
    ...(Array.isArray(window.POISON_FUNGI) ? window.POISON_FUNGI : []),
    ...(Array.isArray(window.POISON_MARINE) ? window.POISON_MARINE : []),
    ...(Array.isArray(window.POISON_ARTHROPODS) ? window.POISON_ARTHROPODS : []),
    ...(Array.isArray(window.POISON_PATHOGENS) ? window.POISON_PATHOGENS : [])
  ];

  if (!META || !RAW_ENTRIES.length) {
    console.error("毒物谱：数据未载入。");
    return;
  }

  const INK = "#211C17";
  const LINE = "#B5A791";
  const PAPER = "#F7F2E9";
  const CINNABAR = "#A0432B";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pad2 = (n) => String(n).padStart(2, "0");

  const KIND_MAP = new Map(META.categories.map((category) => [category.key, category]));
  const DANGER_MAP = new Map(META.dangerScale.map((item) => [item.level, item]));
  const DANGER_GROUP_MAP = new Map(META.dangerGroups.map((group) => [group.key, group]));
  const SYMPTOM_MAP = new Map(META.symptoms.map((symptom) => [symptom.zh, symptom]));
  const CORE_SYMPTOMS = META.symptoms.filter((symptom) => symptom.group === "core");
  const EXTENDED_SYMPTOMS = META.symptoms.filter((symptom) => symptom.group === "extended");

  const HTML_ESCAPE = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => HTML_ESCAPE[character]);
  }

  function normalize(value) {
    return String(value == null ? "" : value)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\s·,，。.;；:：/\\\-—_'"“”‘’()（）[\]【】]/g, "");
  }

  function levelInfo(level) {
    return DANGER_MAP.get(level) || META.dangerScale[0];
  }

  function kindInfo(entryOrKey) {
    const key = typeof entryOrKey === "string" ? entryOrKey : entryOrKey.kind;
    return KIND_MAP.get(key) || { key, label: key, en: key };
  }

  function isPlant(entry) { return entry.kind === "plant"; }
  function isSnake(entry) { return entry.kind === "snake"; }
  function isFungus(entry) { return entry.kind === "fungus"; }
  function isMarine(entry) { return entry.kind === "marine"; }
  function isArthropod(entry) { return entry.kind === "arthropod"; }
  function isPathogen(entry) { return ["bacteria", "virus", "protozoan"].includes(entry.kind); }
  function isPoison(entry) { return !isPathogen(entry); }
  function isVenomousAnimal(entry) { return isSnake(entry) || isMarine(entry) || isArthropod(entry); }

  function hazardLabel(entry) {
    const info = levelInfo(entry.hazard.level);
    return isPoison(entry) ? info.poisonLabel : info.pathogenLabel;
  }

  function hazardPrefix(entry) {
    return isPoison(entry) ? "毒级" : "风险级";
  }

  function timingLabel(entry) {
    return isPathogen(entry) ? "潜伏" : "发作";
  }

  function timingLabelLong(entry) {
    return isPathogen(entry) ? "潜伏期" : "发作时间";
  }

  function sourceLabel(entry) {
    if (isVenomousAnimal(entry)) return "毒器";
    if (isPathogen(entry)) return "传播 / 来源";
    return "有毒部位";
  }

  function timelineText(entry) {
    const raw = String(entry.hazard.onset || "");
    return isPathogen(entry) ? (raw.replace(/^潜伏期\s*/, "") || raw) : raw;
  }

  function symptomLookup(label) {
    return SYMPTOM_MAP.get(label);
  }

  function countForSymptom(label) {
    return catalog.filter((entry) => (entry.hazard.symptoms || []).includes(label)).length;
  }

  function countPlantsForSymptom(label) {
    return catalog.filter((entry) => entry.kind === "plant" && (entry.hazard.symptoms || []).includes(label)).length;
  }

  function collectStrings(value, output = []) {
    if (typeof value === "string") output.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
    else if (value && typeof value === "object") {
      Object.keys(value).forEach((key) => {
        if (key.startsWith("_")) return;
        if (key === "art" || key === "palette") return;
        collectStrings(value[key], output);
      });
    }
    return output;
  }

  const catalog = RAW_ENTRIES.map((raw, index) => {
    const kind = raw.kind || "plant";
    const profile = Array.isArray(raw.profile) ? raw.profile : [];
    const distribution = raw.distribution || (profile.find((item) => item.label === "分布") || {}).value || "";
    const hazard = raw.hazard || raw.toxicity;
    const entry = {
      ...raw,
      kind,
      hazard,
      distribution,
      aliases: raw.aliases || [],
      profile,
      medicinal: raw.medicinal || null,
      _index: index,
      _no: pad2(index + 1),
      _kind: kindInfo(kind)
    };
    if (!entry.hazard.source && entry.hazard.parts) entry.hazard.source = entry.hazard.parts;
    if (!entry.hazard._sourceLabel) entry.hazard._sourceLabel = sourceLabel(entry);
    const searchText = [
      entry.name, entry.en, entry.latin, entry.family, entry.genus, entry.distribution,
      entry.kind, entry._kind.label, entry._kind.en,
      ...(entry.aliases || []),
      ...(entry.topics || []),
      ...(entry.habitatTypes || []),
      ...(entry.routeTags || []),
      ...(entry.colorTags || []),
      ...(entry.hazard.symptoms || []),
      ...collectStrings(profile)
    ].join(" ");
    entry._search = normalize(searchText);
    return entry;
  });

  const entryMap = new Map(catalog.map((entry) => [entry.id, entry]));
  const totalEntries = catalog.length;
  const kindCounts = Object.fromEntries(META.categories.map((category) => [
    category.key,
    catalog.filter((entry) => entry.kind === category.key).length
  ]));

  // Defensive data checks; they never stop the page from rendering.
  (function validateData() {
    const allowedSymptoms = new Set(META.symptoms.map((item) => item.zh));
    const allowedKinds = new Set(META.categories.map((item) => item.key));
    const allowedHabitats = new Set(META.habitatTypes);
    const allowedRoutes = new Set(META.routeTypes);
    const allowedColors = new Set(META.flowerColors.map((item) => item.key));
    const seenIds = new Set();
    catalog.forEach((entry) => {
      if (!entry.id || !entry.name) console.warn("毒物谱：条目缺少 id 或中文名", entry);
      if (seenIds.has(entry.id)) console.warn("毒物谱：重复 id", entry.id);
      seenIds.add(entry.id);
      if (!allowedKinds.has(entry.kind)) console.warn("毒物谱：未知类群", entry.kind);
      if (!entry.hazard) console.warn("毒物谱：条目缺少危险数据", entry.id);
      (entry.hazard ? entry.hazard.symptoms || [] : []).forEach((symptom) => {
        if (!allowedSymptoms.has(symptom)) console.warn(`毒物谱：${entry.name} 的症状标签不在反查表中`, symptom);
      });
      (entry.habitatTypes || []).forEach((habitat) => {
        if (!allowedHabitats.has(habitat)) console.warn(`毒物谱：${entry.name} 的生境标签未注册`, habitat);
      });
      (entry.routeTags || []).forEach((route) => {
        if (!allowedRoutes.has(route)) console.warn(`毒物谱：${entry.name} 的传播/暴露标签未注册`, route);
      });
      (entry.colorTags || []).forEach((color) => {
        if (!allowedColors.has(color)) console.warn(`毒物谱：${entry.name} 的颜色标签未注册`, color);
      });
      if (entry.kind === "plant") {
        const compare = PLANT_COMPARE_MAP[entry.id];
        if (!compare) console.warn(`毒物谱：${entry.name} 缺少可食/常见对照`);
        else if (!COMPARE_MAP.has(compare.targetId)) console.warn(`毒物谱：${entry.name} 的对照目标不存在`, compare.targetId);
      }
    });
  })();

  const state = {
    kind: "all",
    query: "",
    symptom: null,
    hazardGroups: new Set(),
    routes: new Set(),
    habitats: new Set(),
    colors: new Set(),
    medicinal: null,
    page: 1,
    perPage: 15,
    currentEntry: null,
    lastFocus: null
  };

  const dom = {};

  function cacheDom() {
    dom.searchInput = $("#searchInput");
    dom.searchClear = $("#searchClear");
    dom.searchHints = $(".search-hints");
    dom.kindTabs = $("#kindTabs");
    dom.symptomBoard = $(".symptom-board");
    dom.symptomGrid = $("#symptomGrid");
    dom.symptomExtraGrid = $("#symptomExtraGrid");
    dom.symptomOutput = $("#symptomOutput");
    dom.hazardFilters = $("#hazardFilters");
    dom.routeFilters = $("#routeFilters");
    dom.habitatFilters = $("#habitatFilters");
    dom.colorFilters = $("#colorFilters");
    dom.medicinalFilters = $("#medicinalFilters");
    dom.dangerScale = $("#dangerScale");
    dom.clearFilters = $("#clearFilters");
    dom.filterToggle = $("#filterToggle");
    dom.filterCount = $("#filterCount");
    dom.filtersPanel = $("#filtersPanel");
    dom.activeFilters = $("#activeFilters");
    dom.specimenList = $("#specimenList");
    dom.emptyState = $("#emptyState");
    dom.pagination = $("#pagination");
    dom.resultCount = $("#resultCount");
    dom.totalCount = $("#totalCount");
    dom.heroEntryCount = $("#heroEntryCount");
    dom.heroKindCount = $("#heroKindCount");
    dom.heroSymptomCount = $("#heroSymptomCount");
    dom.heroPlate = $("#heroPlate");
    dom.heroFigureName = $("#heroFigureName");
    dom.heroFigureLatin = $("#heroFigureLatin");
    dom.heroFigureKind = $("#heroFigureKind");
    dom.indexUpdated = $("#indexUpdated");
    dom.drawer = $("#drawer");
    dom.drawerContent = $("#drawerContent");
    dom.drawerClose = $("#drawerClose");
    dom.drawerScroll = $("#drawerScroll");
    dom.drawerPlateNo = $("#drawerPlateNo");
    dom.backdrop = $("#backdrop");
    dom.toast = $("#toast");
    dom.compareDialog = $("#compareDialog");
    dom.compareContent = $("#compareContent");
    dom.compareClose = $("#compareClose");
    dom.printButton = $("#printButton");
    dom.printSheet = $("#printSheet");
    dom.topbar = $("#siteHeader");
    dom.main = $("#main");
    dom.footer = $("#siteFooter");
    dom.filterClose = $("#filterClose");
    dom.heroRandom = $("#heroRandom");
    dom.randomButton = $("#randomButton");
    dom.emptyReset = $("#emptyReset");
  }

  /* =========================================================
     Botanical SVG generator
     The illustration is composed from leaf / flower / fruit
     parameters in each record. It is a diagram, never a photo.
     ========================================================= */

  function svgText(value, x, y, options = {}) {
    const anchor = options.anchor || "start";
    const size = options.size || 8;
    const opacity = options.opacity == null ? 0.72 : options.opacity;
    const fill = options.fill || INK;
    return `<text x="${x}" y="${y}" fill="${fill}" opacity="${opacity}" font-size="${size}" text-anchor="${anchor}" letter-spacing="${options.tracking || "0.08em"}">${esc(value)}</text>`;
  }

  function leafMarkup(type, palette) {
    const leaf = palette.leaf || "#667354";
    const stem = palette.stem || "#6A6853";
    const fillAttrs = `fill="${leaf}" fill-opacity=".28" stroke="${INK}" stroke-opacity=".9" stroke-width="1.05" stroke-linejoin="round"`;
    const veinAttrs = `fill="none" stroke="${stem}" stroke-opacity=".9" stroke-width=".72" stroke-linecap="round"`;

    if (type === "palmate") {
      const lobes = [
        { rotate: 0, scale: 1 },
        { rotate: -38, scale: 0.9 },
        { rotate: 38, scale: 0.9 },
        { rotate: -72, scale: 0.72 },
        { rotate: 72, scale: 0.72 }
      ];
      return `<g>${lobes.map((lobe) => `
        <g transform="rotate(${lobe.rotate}) scale(${lobe.scale})">
          <path d="M0 0 C-9 -25 -13 -64 0 -113 C13 -64 9 -25 0 0Z" ${fillAttrs}/>
          <path d="M0 -8 C0 -43 0 -80 0 -103 M0 -38 L-7 -54 M0 -62 L6 -78 M0 -38 L7 -52 M0 -62 L-6 -76" ${veinAttrs}/>
        </g>`).join("")}</g>`;
    }

    if (type === "compound") {
      const forms = [];
      const pairs = [
        { y: -32, side: -1, s: 0.78 },
        { y: -32, side: 1, s: 0.78 },
        { y: -60, side: -1, s: 0.83 },
        { y: -60, side: 1, s: 0.83 },
        { y: -88, side: -1, s: 0.74 },
        { y: -88, side: 1, s: 0.74 }
      ];
      pairs.forEach((pair) => {
        forms.push(`<g transform="translate(0 ${pair.y}) rotate(${pair.side * 62}) scale(${pair.s})">
          <path d="M0 0 C-8 -6 -10 -20 0 -34 C10 -20 8 -6 0 0Z" ${fillAttrs}/>
          <path d="M0 -4 L0 -29 M0 -16 L-6 -24 M0 -16 L5 -25" ${veinAttrs}/>
        </g>`);
      });
      forms.push(`<g transform="translate(0 -112) scale(.8)">
        <path d="M0 0 C-8 -6 -10 -20 0 -34 C10 -20 8 -6 0 0Z" ${fillAttrs}/>
        <path d="M0 -4 L0 -29 M0 -16 L-6 -24 M0 -16 L5 -25" ${veinAttrs}/>
      </g>`);
      return `<g><path d="M0 2 C-2 -35 0 -78 0 -113" ${veinAttrs}/>${forms.join("")}</g>`;
    }

    if (type === "trifoliate") {
      const leaflet = `<path d="M0 0 C-16 -15 -22 -39 0 -59 C22 -39 16 -15 0 0Z" ${fillAttrs}/>
        <path d="M0 -4 L0 -51 M0 -24 L-8 -34 M0 -24 L8 -34 M0 -39 L-6 -48 M0 -39 L6 -48" ${veinAttrs}/>`;
      return `<g>
        <g transform="translate(0 -7) rotate(-43) scale(.9)">${leaflet}</g>
        <g transform="translate(0 -7) rotate(43) scale(.9)">${leaflet}</g>
        <g transform="translate(0 -2)">${leaflet}</g>
      </g>`;
    }

    let outline = "";
    let veins = "";

    if (type === "lanceolate") {
      outline = `<path d="M0 0 C-8 -17 -15 -38 -12 -60 C-10 -81 -4 -99 0 -116 C4 -99 10 -81 12 -60 C15 -38 8 -17 0 0Z" ${fillAttrs}/>`;
      veins = `<path d="M0 -5 C0 -42 0 -83 0 -107 M0 -31 L-7 -46 M0 -31 L7 -46 M0 -59 L-7 -74 M0 -59 L7 -74 M0 -85 L-4 -95 M0 -85 L4 -95" ${veinAttrs}/>`;
    } else if (type === "linear") {
      outline = `<path d="M0 0 C-3 -18 -5 -46 -4 -76 L0 -122 L4 -76 C5 -46 3 -18 0 0Z" ${fillAttrs}/>`;
      veins = `<path d="M0 -6 L0 -111 M0 -31 L-2 -48 M0 -31 L2 -48 M0 -60 L-2 -77 M0 -60 L2 -77 M0 -88 L-1 -101" ${veinAttrs}/>`;
    } else if (type === "cordate") {
      outline = `<path d="M0 -8 C0 -25 -18 -21 -28 -34 C-41 -51 -30 -77 -12 -79 C-4 -80 0 -73 0 -66 C0 -73 4 -80 12 -79 C30 -77 41 -51 28 -34 C18 -21 0 -25 0 -8Z" ${fillAttrs}/>`;
      veins = `<path d="M0 -14 L0 -66 M0 -37 L-10 -50 M0 -37 L10 -50 M0 -55 L-7 -67 M0 -55 L7 -67" ${veinAttrs}/>`;
    } else if (type === "lobed") {
      outline = `<path d="M0 0 C-17 -5 -35 -14 -43 -27 C-49 -38 -36 -46 -29 -52 C-39 -64 -30 -81 -17 -84 C-25 -97 -10 -108 0 -116 C10 -108 25 -97 17 -84 C30 -81 39 -64 29 -52 C36 -46 49 -38 43 -27 C35 -14 17 -5 0 0Z" ${fillAttrs}/>`;
      veins = `<path d="M0 -6 L0 -102 M0 -42 L-17 -31 M0 -42 L17 -31 M0 -68 L-13 -62 M0 -68 L13 -62 M0 -27 L-28 -23 M0 -27 L28 -23" ${veinAttrs}/>`;
    } else {
      // ovate is also the graceful fallback for unfamiliar shapes
      outline = `<path d="M0 0 C-13 -15 -25 -31 -28 -49 C-31 -65 -23 -76 -24 -85 C-25 -95 -12 -100 0 -112 C12 -100 25 -95 24 -85 C23 -76 31 -65 28 -49 C25 -31 13 -15 0 0Z" ${fillAttrs}/>`;
      veins = `<path d="M0 -5 C0 -40 0 -83 0 -105 M0 -32 L-10 -43 M0 -32 L10 -43 M0 -59 L-9 -70 M0 -59 L9 -70 M0 -83 L-5 -91 M0 -83 L5 -91" ${veinAttrs}/>`;
    }

    return `<g>${outline}${veins}</g>`;
  }

  function petalRing(palette, shape = "pointed", scale = 1) {
    const flower = palette.flower || "#D9CDBA";
    const accent = palette.accent || CINNABAR;
    const pointedPath = "M0 0 C-10 -10 -20 -26 -10 -39 C-4 -47 4 -47 10 -39 C20 -26 10 -10 0 0Z";
    const roundPath = "M0 0 C-16 -8 -23 -23 -12 -35 C-5 -42 5 -42 12 -35 C23 -23 16 -8 0 0Z";
    const petalPath = shape === "round" ? roundPath : pointedPath;
    const petals = Array.from({ length: 5 }, (_, index) =>
      `<path d="${petalPath}" transform="rotate(${index * 72}) " fill="${flower}" fill-opacity=".68" stroke="${INK}" stroke-opacity=".82" stroke-width=".9" stroke-linejoin="round"/>`
    ).join("");
    return `<g transform="scale(${scale})">
      ${petals}
      <circle cx="0" cy="0" r="5.5" fill="${accent}" fill-opacity=".88" stroke="${INK}" stroke-width=".8"/>
      <circle cx="0" cy="0" r="1.8" fill="${PAPER}" fill-opacity=".8"/>
    </g>`;
  }

  function flowerTrumpet(palette) {
    const flower = palette.flower || "#E5D9C4";
    const accent = palette.accent || CINNABAR;
    return `<g>
      <path d="M-5 0 C-8 -12 -13 -24 -17 -34 C-8 -31 8 -31 17 -34 C13 -24 8 -12 5 0 C2 4 -2 4 -5 0Z" fill="${flower}" fill-opacity=".42" stroke="${INK}" stroke-width=".9" stroke-opacity=".8"/>
      <path d="M-15 -33 C-10 -40 10 -40 15 -33" fill="none" stroke="${INK}" stroke-width=".8" stroke-opacity=".72"/>
      <g transform="translate(0 -43)">${petalRing(palette, "pointed", 1.12)}</g>
      <path d="M-10 -43 C-15 -51 -23 -59 -27 -65 M10 -43 C15 -51 23 -59 27 -65" fill="none" stroke="${accent}" stroke-width=".8" opacity=".6"/>
      <circle cx="-27" cy="-65" r="1.8" fill="${accent}" opacity=".85"/>
      <circle cx="27" cy="-65" r="1.8" fill="${accent}" opacity=".85"/>
    </g>`;
  }

  function flowerBell(palette) {
    const flower = palette.flower || "#A5939B";
    return `<g>
      <path d="M0 0 C-4 8 -7 15 -11 23 C-5 28 5 28 11 23 C7 15 4 8 0 0Z" fill="${flower}" fill-opacity=".52" stroke="${INK}" stroke-width=".9" stroke-opacity=".82"/>
      <path d="M-12 23 Q-8 31 -4 23 Q0 32 4 23 Q8 31 12 23" fill="none" stroke="${INK}" stroke-width=".8" stroke-opacity=".72"/>
      <path d="M0 4 L0 24 M-7 10 C-8 14 -9 18 -9 21 M7 10 C8 14 9 18 9 21" fill="none" stroke="${INK}" stroke-width=".6" opacity=".48"/>
      <path d="M-6 1 C-11 -1 -15 2 -14 6 C-13 9 -8 8 -5 4" fill="${palette.leaf || "#667354"}" fill-opacity=".38" stroke="${INK}" stroke-width=".7" opacity=".85"/>
    </g>`;
  }

  function flowerFunnel(palette) {
    const flower = palette.flower || "#C9A45C";
    return `<g>
      <path d="M-4 0 C-7 -10 -11 -22 -15 -31 C-7 -28 7 -28 15 -31 C11 -22 7 -10 4 0 C2 3 -2 3 -4 0Z" fill="${flower}" fill-opacity=".42" stroke="${INK}" stroke-width=".85"/>
      <g transform="translate(0 -37)">${petalRing(palette, "round", 1.06)}</g>
    </g>`;
  }

  function flowerHelmet(palette) {
    const flower = palette.flower || "#737E9B";
    return `<g>
      <path d="M-2 3 C-6 11 -10 18 -18 24 C-35 13 -29 -19 0 -37 C28 -19 33 13 16 24 C10 15 6 9 4 2 C2 -2 0 -1 -2 3Z" fill="${flower}" fill-opacity=".66" stroke="${INK}" stroke-width=".9" stroke-opacity=".85"/>
      <path d="M-10 12 C-18 6 -19 -5 -10 -13 M9 10 C15 2 15 -7 7 -14" fill="none" stroke="${INK}" stroke-width=".65" opacity=".45"/>
      <path d="M-16 22 C-23 19 -24 12 -18 7" fill="none" stroke="${palette.leaf || "#667354"}" stroke-width="1.2" opacity=".7"/>
      <path d="M-6 4 C-15 4 -23 7 -25 13 C-20 16 -13 14 -9 9" fill="${flower}" fill-opacity=".3" stroke="${INK}" stroke-width=".65"/>
    </g>`;
  }

  function flowerPea(palette) {
    const flower = palette.flower || "#C3A2AC";
    return `<g>
      <path d="M-1 0 C-20 -2 -29 -14 -22 -26 C-16 -36 -4 -29 -2 -18 C0 -11 3 -4 -1 0Z" fill="${flower}" fill-opacity=".62" stroke="${INK}" stroke-width=".85"/>
      <path d="M-5 -13 C-14 -11 -17 -2 -9 2 C-3 4 -1 -5 -5 -13Z" fill="${flower}" fill-opacity=".38" stroke="${INK}" stroke-width=".7"/>
      <path d="M-18 -24 C-9 -27 -2 -25 1 -20" fill="none" stroke="${INK}" stroke-width=".6" opacity=".5"/>
    </g>`;
  }

  function flowerFoxglove(palette) {
    const flower = palette.flower || "#987A94";
    return `<g>
      <path d="M0 0 C-4 7 -14 14 -18 24 C-20 31 -11 34 -3 30 C5 34 15 31 16 24 C14 14 4 7 0 0Z" fill="${flower}" fill-opacity=".58" stroke="${INK}" stroke-width=".85" stroke-opacity=".82"/>
      <path d="M-16 25 Q-11 31 -5 26 Q0 33 5 26 Q11 31 16 25" fill="none" stroke="${INK}" stroke-width=".7"/>
      <circle cx="-7" cy="19" r="1.4" fill="${PAPER}" fill-opacity=".8"/>
      <circle cx="2" cy="22" r="1.1" fill="${PAPER}" fill-opacity=".7"/>
      <circle cx="9" cy="17" r="1.1" fill="${PAPER}" fill-opacity=".7"/>
      <path d="M-1 3 L-4 22 M4 6 L7 20" fill="none" stroke="${INK}" stroke-width=".5" opacity=".4"/>
    </g>`;
  }

  function flowerLily6(palette) {
    const flower = palette.flower || "#B396B8";
    const accent = palette.accent || CINNABAR;
    const tepals = Array.from({ length: 6 }, (_, index) => {
      return `<path d="M0 0 C-7 -17 -10 -37 0 -59 C10 -37 7 -17 0 0Z" transform="rotate(${index * 60})" fill="${flower}" fill-opacity=".58" stroke="${INK}" stroke-width=".8" stroke-opacity=".8"/>`;
    }).join("");
    const stamens = Array.from({ length: 6 }, (_, index) => {
      const x = -17 + index * 7;
      return `<path d="M0 0 C${x * .35} -12 ${x} -21 ${x * 1.4} -30" fill="none" stroke="${accent}" stroke-width=".7" opacity=".85"/><circle cx="${x * 1.4}" cy="-30" r="1.5" fill="${accent}" opacity=".9"/>`;
    }).join("");
    return `<g>${tepals}${stamens}<path d="M0 0 C-2 -8 -1 -16 2 -24" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><circle cx="2" cy="-26" r="2.4" fill="${accent}" stroke="${INK}" stroke-width=".5"/></g>`;
  }

  function flowerCup(palette) {
    const flower = palette.flower || "#E8E0D1";
    const accent = palette.accent || "#C1A052";
    return `<g>
      <g transform="translate(0 -3)">${petalRing({ ...palette, flower, accent: flower }, "round", .96)}</g>
      <path d="M-13 -3 C-15 -14 15 -14 13 -3 L9 8 C4 12 -4 12 -9 8Z" fill="${accent}" fill-opacity=".82" stroke="${INK}" stroke-width=".9" stroke-opacity=".82"/>
      <path d="M-8 -5 C-4 -9 4 -9 8 -5" fill="none" stroke="${PAPER}" stroke-width=".8" opacity=".55"/>
    </g>`;
  }

  function flowerSpider(palette) {
    const flower = palette.flower || "#A0432B";
    const accent = palette.accent || CINNABAR;
    const petals = Array.from({ length: 6 }, (_, index) => {
      const angle = index * 60;
      return `<path d="M0 0 C-5 -20 -13 -36 -4 -55 C4 -48 7 -39 7 -29 C8 -17 4 -8 0 0Z" transform="rotate(${angle})" fill="${flower}" fill-opacity=".55" stroke="${INK}" stroke-width=".8" stroke-opacity=".78"/>`;
    }).join("");
    const stamens = Array.from({ length: 7 }, (_, index) => {
      const x = -28 + index * 9;
      return `<path d="M0 0 C${x * 0.4} -25 ${x} -44 ${x * 1.45} -64" fill="none" stroke="${accent}" stroke-width=".7" opacity=".85"/><circle cx="${x * 1.45}" cy="-64" r="1.8" fill="${accent}" opacity=".9"/>`;
    }).join("");
    return `<g>${petals}${stamens}<circle cx="0" cy="0" r="5" fill="${accent}" fill-opacity=".5" stroke="${INK}" stroke-width=".8"/></g>`;
  }

  function flowerTiny(palette, scale = 1) {
    return `<g transform="scale(${scale})">
      <g transform="scale(.55)">${petalRing(palette, "round", 1)}</g>
    </g>`;
  }

  function flowerArt(type, palette) {
    const stem = palette.stem || "#6A6853";
    const line = (d) => `<path d="${d}" fill="none" stroke="${stem}" stroke-width="1.05" stroke-linecap="round" opacity=".8"/>`;
    const dot = (x, y, r = 2.2, color = palette.accent || CINNABAR) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity=".9" stroke="${INK}" stroke-width=".4"/>`;

    if (type === "trumpet") {
      return `<g>
        ${line("M234 159 C218 151 205 141 199 129")}
        ${line("M234 169 C254 164 268 163 277 171")}
        <g transform="translate(199 129) rotate(-18)">${flowerTrumpet(palette)}</g>
        <g transform="translate(277 171) rotate(26) scale(.76)">${flowerTrumpet(palette)}</g>
        ${dot(320, 95, 2.4, palette.accent || CINNABAR)}
      </g>`;
    }

    if (type === "bell") {
      return `<g>
        ${line("M234 137 C220 131 211 128 202 126")}
        ${line("M234 154 C250 149 258 144 265 137")}
        ${line("M234 170 C220 171 211 177 204 187")}
        <g transform="translate(202 126) rotate(13)">${flowerBell(palette)}</g>
        <g transform="translate(265 137) rotate(-17) scale(.86)">${flowerBell(palette)}</g>
        <g transform="translate(204 187) rotate(32) scale(.72)">${flowerBell(palette)}</g>
        <path d="M234 154 C233 144 234 123 234 108" fill="none" stroke="${stem}" stroke-width="1" opacity=".55"/>
      </g>`;
    }

    if (type === "helmet") {
      return `<g>
        ${line("M234 154 C220 145 211 135 205 125")}
        ${line("M234 171 C251 164 260 154 265 144")}
        <g transform="translate(205 125) rotate(-12)">${flowerHelmet(palette)}</g>
        <g transform="translate(265 144) rotate(19) scale(.8)">${flowerHelmet(palette)}</g>
        <path d="M234 162 C238 137 239 113 242 97" fill="none" stroke="${stem}" stroke-width=".9" opacity=".55"/>
      </g>`;
    }

    if (type === "funnel") {
      return `<g>
        ${line("M233 151 C221 142 211 137 204 133")}
        ${line("M233 167 C250 161 262 155 270 148")}
        <g transform="translate(204 133) rotate(-17)">${flowerFunnel(palette)}</g>
        <g transform="translate(270 148) rotate(21) scale(.82)">${flowerFunnel(palette)}</g>
        ${line("M233 185 C229 165 230 135 234 118")}
      </g>`;
    }

    if (type === "umbel") {
      const tips = [
        [199, 107], [209, 86], [226, 73], [244, 77], [261, 90], [272, 110], [287, 126], [193, 132], [215, 113], [250, 111]
      ];
      const rays = tips.map(([x, y], index) => line(`M235 164 C${226 + index * 1.2} 140 ${x + 2} 120 ${x} ${y}`)).join("");
      const blossoms = tips.map(([x, y], index) =>
        `<g transform="translate(${x} ${y}) scale(${0.52 + (index % 3) * 0.06})">${petalRing(palette, "round", 1)}</g>`
      ).join("");
      return `<g>${rays}${blossoms}
        <path d="M199 115 C188 106 182 100 179 92" fill="none" stroke="${stem}" stroke-width=".8" opacity=".55"/>
        <path d="M286 120 C294 110 300 101 303 91" fill="none" stroke="${stem}" stroke-width=".8" opacity=".55"/>
      </g>`;
    }

    if (type === "spike") {
      const flowers = [];
      for (let index = 0; index < 8; index += 1) {
        const y = 96 + index * 18;
        const side = index % 2 === 0 ? -1 : 1;
        const x = 241 + side * (18 + (index % 3) * 5);
        flowers.push(line(`M241 ${y + 9} C${241 + side * 7} ${y + 8} ${x - side * 3} ${y + 3} ${x} ${y}`));
        flowers.push(`<g transform="translate(${x} ${y}) rotate(${side * 35}) scale(.62)">${flowerTiny(palette, 1)}</g>`);
      }
      return `<g>
        <path d="M241 168 C235 143 238 112 241 84" fill="none" stroke="${stem}" stroke-width="1.05" opacity=".75"/>
        ${flowers.join("")}
        <circle cx="241" cy="80" r="3" fill="${palette.accent || CINNABAR}" fill-opacity=".75"/>
      </g>`;
    }

    if (type === "foxglove") {
      const nodes = [
        { y: 214, x: 205, scale: 1, rot: -22 },
        { y: 187, x: 266, scale: .94, rot: 20 },
        { y: 160, x: 207, scale: .86, rot: -18 },
        { y: 134, x: 263, scale: .78, rot: 18 },
        { y: 111, x: 216, scale: .66, rot: -14 },
        { y: 91, x: 253, scale: .54, rot: 14 }
      ];
      const flowers = nodes.map((node) => `
        <path d="M240 ${node.y + 13} C${node.x < 240 ? 230 : 250} ${node.y + 10} ${node.x + (node.x < 240 ? 8 : -8)} ${node.y + 4} ${node.x} ${node.y}" fill="none" stroke="${stem}" stroke-width=".85" opacity=".7"/>
        <g transform="translate(${node.x} ${node.y}) rotate(${node.rot}) scale(${node.scale})">${flowerFoxglove(palette)}</g>
      `).join("");
      return `<g>
        <path d="M235 240 C232 206 239 142 241 71" fill="none" stroke="${stem}" stroke-width="1.1" opacity=".8"/>
        ${flowers}
        <path d="M241 75 C238 66 240 58 247 52 C252 60 250 68 245 75Z" fill="${palette.leaf || "#667354"}" fill-opacity=".3" stroke="${INK}" stroke-width=".7"/>
      </g>`;
    }

    if (type === "lily6") {
      return `<g>
        ${line("M234 168 C231 146 232 124 236 105")}
        <g transform="translate(236 104) scale(1.08)">${flowerLily6(palette)}</g>
        ${line("M234 176 C218 166 210 155 204 142")}
        <g transform="translate(204 142) rotate(-29) scale(.6)">${flowerLily6(palette)}</g>
        ${line("M234 176 C251 170 262 162 271 151")}
        <g transform="translate(271 151) rotate(27) scale(.54)">${flowerLily6(palette)}</g>
      </g>`;
    }

    if (type === "star" || type === "cluster") {
      return `<g>
        ${line("M234 150 C217 140 207 127 198 114")}
        ${line("M234 159 C250 151 260 139 268 127")}
        ${line("M234 171 C238 152 244 129 249 108")}
        <g transform="translate(198 114) rotate(-15) scale(.78)">${petalRing(palette, "pointed", 1)}</g>
        <g transform="translate(268 127) rotate(18) scale(.68)">${petalRing(palette, "pointed", 1)}</g>
        <g transform="translate(249 108) rotate(-2) scale(.56)">${petalRing(palette, "pointed", 1)}</g>
        ${dot(294, 95, 2, palette.accent || CINNABAR)}
      </g>`;
    }

    if (type === "pea") {
      return `<g>
        ${line("M234 164 C220 154 211 141 200 130")}
        ${line("M234 174 C248 163 258 150 268 139")}
        <g transform="translate(200 130) rotate(-18) scale(1.02)">${flowerPea(palette)}</g>
        <g transform="translate(268 139) rotate(20) scale(.9)">${flowerPea(palette)}</g>
        <g transform="translate(237 109) rotate(3) scale(.75)">${flowerPea(palette)}</g>
        <path d="M234 174 C231 158 232 131 237 108" fill="none" stroke="${stem}" stroke-width=".9" opacity=".6"/>
      </g>`;
    }

    if (type === "cup") {
      return `<g>
        ${line("M237 154 C229 130 230 109 236 88")}
        <g transform="translate(236 86) scale(1.06)">${flowerCup(palette)}</g>
        <g transform="translate(194 132) rotate(-29) scale(.6)">${flowerCup(palette)}</g>
        <path d="M194 132 C206 130 220 128 230 127" fill="none" stroke="${stem}" stroke-width=".8" opacity=".65"/>
      </g>`;
    }

    if (type === "spider") {
      return `<g>
        <path d="M237 174 C231 148 232 128 238 106" fill="none" stroke="${stem}" stroke-width="1" opacity=".75"/>
        <g transform="translate(238 84) scale(1.18)">${flowerSpider(palette)}</g>
        <g transform="translate(205 143) rotate(-40) scale(.47)">${flowerSpider(palette)}</g>
        <g transform="translate(274 154) rotate(34) scale(.42)">${flowerSpider(palette)}</g>
        <path d="M238 174 C220 161 210 149 205 143 M238 174 C254 165 264 161 274 154" fill="none" stroke="${stem}" stroke-width=".8" opacity=".65"/>
      </g>`;
    }

    if (type === "cup-spike") {
      return `<g>${line("M236 158 C235 128 239 100 245 72")}${[112, 88, 66].map((y, index) => `<g transform="translate(${235 + index * 4} ${y}) scale(${0.85 - index * 0.15})">${flowerCup(palette)}</g>`).join("")}</g>`;
    }

    if (type === "cyathium") {
      const bract = palette.accent || CINNABAR;
      const cup = (x, y, scale, angle) => `
        <g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
          <path d="M-31 4 C-40 -14 -26 -33 -7 -24 C-13 -43 8 -53 17 -36 C31 -48 43 -25 29 -11 C21 2 4 5 -7 5 C-15 10 -27 10 -31 4Z" fill="${bract}" fill-opacity=".48" stroke="${INK}" stroke-width=".8" stroke-opacity=".8"/>
          <path d="M-13 0 C-10 -10 10 -10 13 0 C9 8 -9 8 -13 0Z" fill="${palette.flower || "#D1CE84"}" fill-opacity=".8" stroke="${INK}" stroke-width=".8"/>
          <circle cx="0" cy="-1" r="4.3" fill="${bract}" fill-opacity=".9" stroke="${INK}" stroke-width=".5"/>
          <circle cx="-2.5" cy="-2.5" r="1.2" fill="${PAPER}" opacity=".85"/>
          <circle cx="2.5" cy="-1.5" r="1.2" fill="${PAPER}" opacity=".85"/>
        </g>`;
      return `<g>
        ${line("M234 157 C226 143 221 130 217 117")}
        ${line("M234 166 C248 156 259 144 267 130")}
        ${line("M234 178 C242 162 250 145 257 128")}
        ${cup(217, 110, 1.04, -12)}
        ${cup(271, 126, .78, 17)}
        ${cup(261, 122, .56, 3)}
      </g>`;
    }

    if (type === "panicle" || type === "raceme") {
      const tips = type === "raceme"
        ? [[219, 118], [207, 95], [240, 86], [260, 102], [277, 120], [225, 140]]
        : [[203, 128], [188, 104], [218, 94], [245, 88], [271, 103], [286, 123], [258, 136], [226, 118]];
      const stems = tips.map(([x, y]) => line(`M238 163 C235 139 224 118 ${x} ${y}`)).join("");
      const blooms = tips.map(([x, y], index) =>
        `<g transform="translate(${x} ${y}) scale(${0.42 + (index % 3) * 0.06})">${petalRing(palette, "round", 1)}</g>`
      ).join("");
      return `<g>${stems}${blooms}</g>`;
    }

    return `<g>
      ${line("M234 154 C224 139 216 125 207 112")}
      <g transform="translate(207 112)">${petalRing(palette, "round", 1)}</g>
    </g>`;
  }

  function fruitArt(type, palette) {
    const accent = palette.accent || CINNABAR;
    const stem = palette.stem || "#6A6853";
    const leaf = palette.leaf || "#667354";
    const fruitFill = palette.fruit || (type === "berry" || type === "drupe" ? accent : palette.leaf) || "#7B735E";
    const fill = `fill="${fruitFill}" fill-opacity=".38" stroke="${INK}" stroke-opacity=".84" stroke-width=".9"`;
    let shape = "";

    if (type === "spiny-capsule") {
      let spikes = "";
      for (let index = 0; index < 14; index += 1) {
        const angle = (Math.PI * 2 * index) / 14;
        const x1 = Math.cos(angle) * 20;
        const y1 = Math.sin(angle) * 25;
        const x2 = Math.cos(angle) * (29 + (index % 3) * 2);
        const y2 = Math.sin(angle) * (34 + (index % 2) * 3);
        spikes += `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${INK}" stroke-width=".9" opacity=".78"/>`;
      }
      shape = `<ellipse cx="0" cy="0" rx="19" ry="25" ${fill}/><path d="M-18 0 C-6 -16 6 -16 18 0 M0 -24 L0 24" fill="none" stroke="${INK}" stroke-width=".6" opacity=".45"/>${spikes}<path d="M0 -28 C1 -38 5 -46 10 -53" fill="none" stroke="${stem}" stroke-width="1.1"/>`;
    } else if (type === "berry") {
      shape = `<g>
        <path d="M0 0 C-2 -13 3 -24 12 -31 M0 0 C-8 -13 -14 -22 -22 -29 M0 0 C2 -16 10 -24 18 -26" fill="none" stroke="${stem}" stroke-width=".85" opacity=".75"/>
        <circle cx="12" cy="-37" r="13" ${fill}/>
        <circle cx="-22" cy="-34" r="11" ${fill}/>
        <circle cx="-5" cy="-47" r="10" ${fill}/>
        <circle cx="8" cy="-40" r="2.2" fill="${PAPER}" opacity=".5"/>
        <circle cx="-24" cy="-37" r="1.8" fill="${PAPER}" opacity=".45"/>
      </g>`;
    } else if (type === "pod") {
      shape = `<g>
        <path d="M-5 0 C-4 -17 5 -25 15 -33" fill="none" stroke="${stem}" stroke-width="1"/>
        <path d="M4 -11 C-28 -17 -51 -35 -61 -61 C-30 -62 14 -50 36 -28 C28 -12 16 -7 4 -11Z" ${fill}/>
        <path d="M-55 -57 C-29 -48 4 -33 29 -20" fill="none" stroke="${INK}" stroke-width=".7" opacity=".5"/>
        <circle cx="-30" cy="-40" r="5" fill="${accent}" fill-opacity=".75" stroke="${INK}" stroke-width=".6"/>
        <circle cx="-11" cy="-32" r="5" fill="${accent}" fill-opacity=".75" stroke="${INK}" stroke-width=".6"/>
        <circle cx="9" cy="-25" r="5" fill="${accent}" fill-opacity=".75" stroke="${INK}" stroke-width=".6"/>
      </g>`;
    } else if (type === "follicle") {
      shape = `<g>
        <path d="M0 0 C-2 -16 1 -33 10 -53 C18 -37 21 -21 17 -4 C12 10 -6 10 0 0Z" ${fill}/>
        <path d="M14 -14 C28 -28 42 -37 53 -43 C39 -43 25 -34 16 -21" ${fill}/>
        <path d="M8 -6 C16 -21 27 -32 43 -40" fill="none" stroke="${INK}" stroke-width=".65" opacity=".45"/>
        <path d="M4 -27 C8 -31 12 -31 15 -27 C12 -22 8 -22 4 -27Z" fill="${accent}" fill-opacity=".68" stroke="${INK}" stroke-width=".55"/>
      </g>`;
    } else if (type === "schizocarp") {
      shape = `<g>
        <path d="M0 0 C-2 -14 0 -27 7 -39 M0 0 C8 -12 15 -23 22 -31" fill="none" stroke="${stem}" stroke-width=".85"/>
        <ellipse cx="8" cy="-44" rx="7" ry="10" transform="rotate(-20 8 -44)" ${fill}/>
        <ellipse cx="24" cy="-36" rx="7" ry="10" transform="rotate(24 24 -36)" ${fill}/>
        <path d="M4 -48 C8 -52 12 -52 14 -47 M21 -40 C25 -44 29 -44 31 -39" fill="none" stroke="${INK}" stroke-width=".6" opacity=".55"/>
        <path d="M8 -41 L11 -48 M24 -33 L27 -40" fill="none" stroke="${accent}" stroke-width=".7" opacity=".7"/>
      </g>`;
    } else if (type === "drupe") {
      shape = `<g>
        <path d="M0 0 C-1 -14 3 -26 10 -34" fill="none" stroke="${stem}" stroke-width="1"/>
        <ellipse cx="17" cy="-47" rx="15" ry="18" ${fill}/>
        <path d="M5 -54 C8 -58 15 -59 20 -56" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/>
        <circle cx="22" cy="-51" r="2" fill="${PAPER}" opacity=".35"/>
      </g>`;
    } else if (type === "pome") {
      shape = `<g>
        <path d="M0 0 C-1 -16 3 -28 11 -36" fill="none" stroke="${stem}" stroke-width="1"/>
        <path d="M8 -44 C11 -60 22 -66 32 -63 C34 -48 28 -32 16 -25 C6 -20 1 -28 8 -44Z" ${fill}/>
        <path d="M17 -31 C13 -45 18 -61 30 -65 C39 -54 35 -39 21 -30Z" ${fill}/>
        <path d="M18 -31 C16 -45 20 -57 25 -65" fill="none" stroke="${stem}" stroke-width=".85" opacity=".7"/>
        <path d="M21 -66 C25 -74 33 -75 37 -70 C34 -64 27 -62 21 -66Z" fill="${leaf}" fill-opacity=".35" stroke="${INK}" stroke-width=".7"/>
      </g>`;
    } else if (type === "samara") {
      shape = `<g>
        <path d="M0 0 C-1 -14 2 -24 8 -31" fill="none" stroke="${stem}" stroke-width=".9"/>
        <path d="M6 -31 C-9 -47 -28 -59 -45 -62 C-32 -44 -18 -32 -3 -25 C8 -20 15 -24 6 -31Z" ${fill}/>
        <path d="M-39 -58 C-24 -47 -10 -35 2 -28" fill="none" stroke="${INK}" stroke-width=".65" opacity=".45"/>
        <circle cx="6" cy="-30" r="6" fill="${accent}" fill-opacity=".65" stroke="${INK}" stroke-width=".6"/>
      </g>`;
    } else if (type === "capsule") {
      shape = `<g>
        <path d="M0 0 C-2 -11 1 -22 8 -31" fill="none" stroke="${stem}" stroke-width=".9"/>
        <path d="M8 -34 C-2 -45 -6 -60 0 -70 C8 -65 17 -70 25 -61 C30 -50 23 -41 8 -34Z" ${fill}/>
        <path d="M8 -41 L8 -65 M4 -45 C8 -50 13 -52 19 -52" fill="none" stroke="${INK}" stroke-width=".65" opacity=".45"/>
        <path d="M8 -34 C4 -26 3 -20 4 -14" fill="none" stroke="${stem}" stroke-width=".8"/>
      </g>`;
    } else {
      shape = `<g>
        <path d="M0 0 C-2 -12 2 -23 8 -30" fill="none" stroke="${stem}" stroke-width=".9"/>
        <path d="M8 -34 C-2 -45 -7 -58 0 -69 C8 -63 16 -68 23 -58 C28 -48 22 -40 8 -34Z" ${fill}/>
        <path d="M8 -40 L8 -63" fill="none" stroke="${INK}" stroke-width=".65" opacity=".45"/>
      </g>`;
    }

    return `<g>
      <path d="M231 356 C257 359 283 347 310 325" fill="none" stroke="${stem}" stroke-width="1" opacity=".75"/>
      <path d="M278 346 C274 337 281 329 291 329 C299 329 303 336 299 342 C295 348 286 350 278 346Z" fill="${leaf}" fill-opacity=".28" stroke="${INK}" stroke-width=".7"/>
      <g transform="translate(319 319) rotate(-8)">${shape}</g>
    </g>`;
  }

  function botanicalSVG(plant, options = {}) {
    const palette = plant.palette || {};
    const silhouette = plant.silhouette || {};
    const annotated = Boolean(options.annotated);
    const name = plant.name;
    const leafNodes = [
      { y: 414, side: 1, reach: 69, angle: 61, scale: .96 },
      { y: 360, side: -1, reach: 75, angle: -58, scale: 1.02 },
      { y: 306, side: 1, reach: 72, angle: 57, scale: .9 },
      { y: 253, side: -1, reach: 65, angle: -63, scale: .82 },
      { y: 205, side: 1, reach: 53, angle: 68, scale: .7 }
    ];

    const leafType = silhouette.leaf || "ovate";
    const leafExtraScale = leafType === "palmate" ? .84 : leafType === "compound" ? 1.03 : leafType === "linear" ? 1.08 : 1;

    const stem = palette.stem || "#6A6853";
    const leafLayer = leafNodes.map((node) => {
      const stemX = 219 + Math.sin((414 - node.y) / 150) * 7;
      const baseX = stemX + node.side * node.reach;
      const baseY = node.y - 7;
      return `<g>
        <path d="M${stemX} ${node.y} C${stemX + node.side * 20} ${node.y - 4} ${baseX - node.side * 13} ${baseY + 4} ${baseX} ${baseY}" fill="none" stroke="${stem}" stroke-width="1" opacity=".72"/>
        <g transform="translate(${baseX} ${baseY}) rotate(${node.angle}) scale(${node.scale * leafExtraScale})">${leafMarkup(leafType, palette)}</g>
      </g>`;
    }).join("");

    const roots = `<g fill="none" stroke="${stem}" stroke-width=".8" opacity=".48" stroke-linecap="round">
      <path d="M219 477 C214 487 204 494 195 501"/>
      <path d="M222 478 C227 488 237 496 246 500"/>
      <path d="M218 476 C216 488 216 492 212 503"/>
      <path d="M223 476 C226 487 227 493 231 503"/>
      <path d="M218 476 C211 483 206 486 198 490"/>
    </g>`;

    const extraLeaf = leafType === "linear"
      ? `<g transform="translate(224 343) rotate(145) scale(.76)">${leafMarkup("linear", palette)}</g><g transform="translate(237 289) rotate(-132) scale(.68)">${leafMarkup("linear", palette)}</g>`
      : "";

    const annotationLayer = annotated ? `<g class="plate-annotations" fill="none" stroke="${INK}" stroke-width=".55" stroke-opacity=".48">
      <path d="M323 75 C300 82 282 94 267 109"/><circle cx="323" cy="75" r="1.5" fill="${CINNABAR}" stroke="none"/>
      <path d="M333 354 C330 343 327 334 323 324"/><circle cx="333" cy="354" r="1.5" fill="${CINNABAR}" stroke="none"/>
      <path d="M83 279 C107 282 128 286 149 290"/><circle cx="83" cy="279" r="1.5" fill="${CINNABAR}" stroke="none"/>
    </g>
    ${svgText("花 / FLOS", 327, 71, { size: 7.5, tracking: ".04em", opacity: .7 })}
    ${svgText("果 / FRUCTUS", 337, 366, { size: 7.2, tracking: ".03em", opacity: .7 })}
    ${svgText("叶 / FOLIUM", 36, 276, { size: 7.2, tracking: ".03em", opacity: .7 })}` : "";

    const aria = `${esc(name)}形态示意：叶为${esc(plant.morphology.leaf)}；花为${esc(plant.morphology.flower)}；果为${esc(plant.morphology.fruit)}。程序生成，非实拍。`;

    return `<svg class="botanical" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${plant._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">形态示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7">
          <path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/>
          <path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/>
        </g>
        <path d="M240 480 C227 422 242 376 232 318 C222 259 240 194 239 146 C239 126 241 111 239 98" fill="none" stroke="${stem}" stroke-width="1.35" stroke-linecap="round" opacity=".92"/>
        ${roots}
        ${leafLayer}
        ${extraLeaf}
        ${fruitArt(silhouette.fruit || "capsule", palette)}
        ${flowerArt(silhouette.flower || "cluster", palette)}
        ${annotationLayer}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.flower || "#E5DAC9"}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">花</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.leaf || "#667354"}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">叶</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.stem || "#6A6853"}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">茎</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${plant._no}</text>
      </g>
    </svg>`;
  }


  /* =========================================================
     Snake and pathogen plate generators
     Same paper, same ink, different orders of life.
     ========================================================= */

  const SNAKE_POSES = {
    wave: [
      [[124, 462], [286, 508], [334, 418], [250, 364]],
      [[250, 364], [160, 312], [146, 238], [232, 204]],
      [[232, 204], [322, 174], [300, 120], [334, 96]]
    ],
    loop: [
      [[322, 468], [136, 496], [104, 397], [203, 349]],
      [[203, 349], [301, 300], [349, 217], [269, 177]],
      [[269, 177], [198, 143], [215, 99], [292, 88]]
    ],
    coil: [
      [[128, 455], [314, 506], [380, 399], [260, 365]],
      [[260, 365], [144, 333], [111, 246], [226, 225]],
      [[226, 225], [322, 208], [342, 133], [258, 97]]
    ],
    sweep: [
      [[342, 468], [180, 457], [119, 364], [209, 331]],
      [[209, 331], [303, 295], [329, 231], [258, 190]],
      [[258, 190], [206, 158], [220, 115], [296, 80]]
    ],
    plot: [
      [[115, 466], [285, 487], [324, 393], [204, 369]],
      [[204, 369], [91, 344], [140, 266], [256, 290]],
      [[256, 290], [349, 310], [356, 203], [264, 177]],
      [[264, 177], [208, 158], [222, 112], [288, 90]]
    ]
  };

  function cubicAt(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: mt2 * mt * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t2 * t * p3[0],
      y: mt2 * mt * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t2 * t * p3[1]
    };
  }

  function sampleSnake(pose) {
    const segments = SNAKE_POSES[pose] || SNAKE_POSES.wave;
    const points = [];
    const samples = 34;
    segments.forEach((segment, segmentIndex) => {
      const start = segmentIndex === 0 ? 0 : 1;
      for (let i = start; i <= samples; i += 1) {
        const t = i / samples;
        const position = cubicAt(segment[0], segment[1], segment[2], segment[3], t);
        const previous = cubicAt(segment[0], segment[1], segment[2], segment[3], Math.max(0, t - 0.01));
        const next = cubicAt(segment[0], segment[1], segment[2], segment[3], Math.min(1, t + 0.01));
        const dx = next.x - previous.x;
        const dy = next.y - previous.y;
        const length = Math.hypot(dx, dy) || 1;
        points.push({
          x: position.x,
          y: position.y,
          tx: dx / length,
          ty: dy / length,
          nx: -dy / length,
          ny: dx / length
        });
      }
    });
    return points;
  }

  function pointsToPath(points, offset = 0) {
    return points.map((point, index) => {
      const x = point.x + point.nx * offset;
      const y = point.y + point.ny * offset;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ");
  }

  function snakeHeadPath(kind) {
    if (kind === "hooked") return "M-18 -9 C-3 -16 22 -17 36 -4 C29 2 30 6 38 9 C27 16 3 18 -17 10 C-25 4 -25 -3 -18 -9Z";
    if (kind === "broad") return "M-20 -12 C-3 -24 25 -22 38 -5 C44 4 38 14 23 18 C-1 25 -22 17 -24 4 C-25 -2 -24 -8 -20 -12Z";
    if (kind === "long") return "M-19 -8 C-2 -15 24 -13 40 0 C24 13 -2 15 -19 8 C-26 4 -26 -4 -19 -8Z";
    return "M-16 -9 C-2 -17 22 -13 30 0 C22 13 -2 17 -16 9 C-23 4 -23 -4 -16 -9Z";
  }

  function snakeSVG(entry, options = {}) {
    const art = entry.art || {};
    const palette = art.palette || { body: "#6C7767", band: "#2D332C", belly: "#D7CBAC", accent: "#A0432B" };
    const points = sampleSnake(art.pose || "wave");
    const len = points.length;
    const bodyWidth = 29;
    const annotated = Boolean(options.annotated);
    const head = points[len - 1];
    const tail = points[0];
    const headAngle = Math.atan2(head.ty, head.tx) * 180 / Math.PI;
    const tailAngle = Math.atan2(tail.ty, tail.tx) * 180 / Math.PI;
    const pattern = art.pattern || "bands";
    const bandCount = Math.max(0, art.bandCount == null ? 10 : art.bandCount);

    const widthAt = (t) => {
      const clamped = Math.max(0, Math.min(1, t));
      const bell = Math.pow(Math.sin(Math.PI * Math.max(0.045, Math.min(0.955, clamped))), 0.42);
      const tailTaper = 0.42 + 0.58 * Math.min(1, clamped / 0.16);
      return (7 + bodyWidth * bell) * tailTaper;
    };
    const widths = points.map((point, index) => widthAt(index / (len - 1)));

    const left = points.map((point, index) => {
      const half = widths[index] / 2;
      return [point.x + point.nx * half, point.y + point.ny * half];
    });
    const right = points.map((point, index) => {
      const half = widths[index] / 2;
      return [point.x - point.nx * half, point.y - point.ny * half];
    }).reverse();
    const bodyPolygon = [
      ...left.map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(2)} ${point[1].toFixed(2)}`),
      ...right.map((point) => `L${point[0].toFixed(2)} ${point[1].toFixed(2)}`),
      "Z"
    ].join(" ");
    const bellyPoints = points.map((point, index) => ({
      x: point.x - point.nx * widths[index] * 0.28,
      y: point.y - point.ny * widths[index] * 0.28
    }));
    const bellyLine = bellyPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");

    let patternMarkup = "";
    if (bandCount > 0 && pattern !== "solid" && pattern !== "twotone") {
      for (let i = 0; i < bandCount; i += 1) {
        const t = (i + 0.7) / (bandCount + 0.5);
        const index = Math.min(len - 3, Math.max(3, Math.round(t * (len - 1))));
        const point = points[index];
        const half = widths[index] * (pattern === "rings" ? 0.39 : 0.35);
        if (pattern === "spotted") {
          patternMarkup += `<circle cx="${point.x + point.nx * half * 0.55}" cy="${point.y + point.ny * half * 0.55}" r="${widths[index] * 0.095}" fill="${palette.band}" fill-opacity=".62"/>
            <circle cx="${point.x - point.nx * half * 0.8}" cy="${point.y - point.ny * half * 0.8}" r="${widths[index] * 0.07}" fill="${palette.band}" fill-opacity=".4"/>`;
        } else if (pattern === "zigzag") {
          patternMarkup += `<path d="M${point.x + point.nx * half} ${point.y + point.ny * half} L${point.x + point.tx * widths[index] * 0.18} ${point.y + point.ty * widths[index] * 0.18} L${point.x - point.nx * half} ${point.y - point.ny * half}" fill="none" stroke="${palette.band}" stroke-width="${Math.max(2.4, widths[index] * 0.14)}" stroke-opacity=".6" stroke-linecap="round" stroke-linejoin="round"/>`;
        } else if (pattern === "rings" || pattern === "bands") {
          patternMarkup += `<path d="M${point.x + point.nx * half} ${point.y + point.ny * half} Q${point.x + point.tx * 4} ${point.y + point.ty * 4} ${point.x - point.nx * half} ${point.y - point.ny * half}" fill="none" stroke="${palette.band}" stroke-width="${Math.max(2.8, widths[index] * (pattern === "rings" ? 0.16 : 0.2))}" stroke-opacity=".62" stroke-linecap="round"/>`;
        } else {
          patternMarkup += `<ellipse cx="${point.x}" cy="${point.y}" rx="${widths[index] * 0.23}" ry="${widths[index] * 0.12}" transform="rotate(${Math.atan2(point.ty, point.tx) * 180 / Math.PI} ${point.x} ${point.y})" fill="${palette.band}" fill-opacity=".4"/>`;
        }
      }
    }

    let scaleMarks = "";
    for (let i = 7; i < len - 6; i += 5) {
      const point = points[i];
      scaleMarks += `<ellipse cx="${point.x + point.nx * widths[i] * 0.16}" cy="${point.y + point.ny * widths[i] * 0.16}" rx="1.4" ry=".55" transform="rotate(${Math.atan2(point.ty, point.tx) * 180 / Math.PI} ${point.x} ${point.y})" fill="${INK}" opacity=".18"/>`;
    }

    const headShape = `<g transform="scale(1.23)">
      <path d="${snakeHeadPath(art.head)}" fill="${palette.body}" fill-opacity=".68" stroke="${INK}" stroke-width="1.15" stroke-opacity=".9" stroke-linejoin="round"/>
      <path d="M-7 -10 C8 -15 21 -9 27 0" fill="none" stroke="${palette.belly}" stroke-width="2.8" opacity=".35"/>
      <circle cx="7" cy="-4.5" r="2.9" fill="${INK}"/><circle cx="7.9" cy="-5.3" r=".9" fill="${PAPER}" opacity=".85"/>
      <path d="M18 5 C24 7 29 6 33 4" fill="none" stroke="${INK}" stroke-width=".7" opacity=".4"/>
      <circle cx="-2" cy="5.4" r="1.2" fill="${INK}" opacity=".45"/>
      <path d="M-12 0 C-20 0 -26 2 -33 5" fill="none" stroke="${INK}" stroke-width=".55" opacity=".25"/>
    </g>`;

    const hood = art.hood ? `<g transform="translate(-10 0)">
      <path d="M-8 0 C-38 -35 -71 -33 -60 -1 C-74 30 -38 41 -8 5Z" fill="${palette.body}" fill-opacity=".28" stroke="${INK}" stroke-width=".85" stroke-opacity=".6"/>
      <path d="M-22 -16 C-40 -19 -50 -13 -54 -2 M-22 16 C-40 19 -50 13 -54 2" fill="none" stroke="${palette.band}" stroke-width="3.4" opacity=".4"/>
    </g>` : "";

    const tailShape = art.tail === "paddle"
      ? `<g transform="rotate(${tailAngle} ${tail.x} ${tail.y}) translate(${tail.x} ${tail.y})">
          <path d="M0 -7 C-16 -15 -36 -15 -47 -4 C-52 1 -51 7 -45 10 C-32 17 -14 16 1 7 C7 3 7 -3 0 -7Z" fill="${palette.body}" fill-opacity=".55" stroke="${INK}" stroke-width="1" stroke-opacity=".8"/>
          <path d="M-9 -9 C-16 -13 -30 -13 -39 -8 M-9 9 C-16 13 -30 13 -39 8 M-45 1 C-49 1 -51 4 -49 7" fill="none" stroke="${INK}" stroke-width=".55" opacity=".3"/>
        </g>`
      : `<g transform="rotate(${tailAngle} ${tail.x} ${tail.y}) translate(${tail.x} ${tail.y})">
          <path d="M0 -3.5 C-16 -2.5 -28 -1 -38 0 C-28 1 -16 2.5 0 3.5 C5 1.5 5 -1.5 0 -3.5Z" fill="${palette.body}" fill-opacity=".5" stroke="${INK}" stroke-width=".8" stroke-opacity=".75"/>
        </g>`;

    const annotation = annotated ? `<g class="plate-annotations" fill="none" stroke="${INK}" stroke-width=".55" stroke-opacity=".45">
      <path d="M353 71 C344 78 ${head.x + 10} ${head.y - 15} ${head.x} ${head.y}"/><circle cx="353" cy="71" r="1.5" fill="${CINNABAR}" stroke="none"/>
      <path d="M54 474 C75 474 ${tail.x - 18} ${tail.y + 8} ${tail.x} ${tail.y}"/><circle cx="54" cy="474" r="1.5" fill="${CINNABAR}" stroke="none"/>
    </g>
    ${svgText("头 / CAPUT", 357, 67, { size: 7.4, tracking: ".04em", opacity: .68 })}
    ${svgText("尾 / CAUDA", 50, 486, { size: 7.2, tracking: ".03em", opacity: .68 })}` : "";

    const aria = `${esc(entry.name)}形态示意：蛇体为${esc(art.pattern || "斑纹")}型花纹，头形${esc(art.head || "小型")}，尾部${esc(art.tail === "paddle" ? "侧扁如桨" : "渐细")}。程序生成，非实拍。`;

    return `<svg class="botanical snake-plate" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${entry._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">形态示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7">
          <path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/>
          <path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/>
        </g>
        ${tailShape}
        <path class="snake-body" d="${bodyPolygon}" fill="${palette.body}" fill-opacity=".55" stroke="${INK}" stroke-width="1.15" stroke-opacity=".88" stroke-linejoin="round"/>
        ${pattern === "twotone" ? `<path d="${bellyLine}" fill="none" stroke="${palette.belly}" stroke-width="8" stroke-opacity=".92" stroke-linecap="round"/>` : ""}
        ${patternMarkup}
        ${scaleMarks}
        <path d="${bellyLine}" fill="none" stroke="${palette.belly}" stroke-width="1.15" stroke-opacity=".55" stroke-linecap="round"/>
        <path d="${points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ")}" fill="none" stroke="${palette.belly}" stroke-width=".8" stroke-opacity=".32" stroke-linecap="round"/>
        <g transform="translate(${head.x} ${head.y}) rotate(${headAngle})">${hood}${headShape}</g>
        ${annotation}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.body}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">背</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.band}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">纹</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.belly}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">腹</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${entry._no}</text>
      </g>
    </svg>`;
  }

  const PATHOGEN_FORM_LABELS = {
    rod: "杆菌 / ROD",
    spore: "芽孢 / SPORE",
    filament: "丝状 / FILAMENT",
    retrovirus: "包膜病毒 / ENVELOPED",
    orthomyxovirus: "多形病毒 / PLEOMORPHIC",
    protozoan: "红内期 / RING STAGE",
    vibrio: "弧菌 / CURVED ROD",
    pox: "砖形 / BRICK",
    spirochete: "螺旋体 / SPIROCHETE",
    bullet: "弹状 / BULLET",
    mycobacterium: "分枝杆菌 / ROD",
    flavivirus: "黄病毒 / ICOSAHEDRAL"
  };

  function pathogenFormSVG(form, palette) {
    const main = palette.main || "#83594E";
    const membrane = palette.membrane || "#DCCFC0";
    const accent = palette.accent || CINNABAR;
    const stroke = `${INK}`;
    if (form === "rod") {
      return `<g>
        <g transform="translate(220 260) rotate(-11)">
          <rect x="-64" y="-13" width="128" height="26" rx="13" fill="${main}" fill-opacity=".23" stroke="${stroke}" stroke-width="1.2"/>
          <circle cx="-31" cy="0" r="3.5" fill="${accent}" fill-opacity=".7"/><circle cx="31" cy="0" r="3.5" fill="${accent}" fill-opacity=".7"/>
          <path d="M-42 -6 C-20 -12 20 -12 42 -6 M-42 6 C-20 12 20 12 42 6" fill="none" stroke="${INK}" stroke-width=".55" opacity=".35"/>
        </g>
        <g transform="translate(305 192) rotate(27) scale(.7)">
          <rect x="-54" y="-11" width="108" height="22" rx="11" fill="${main}" fill-opacity=".18" stroke="${stroke}" stroke-width="1"/>
          <circle cx="-27" cy="0" r="3" fill="${accent}" opacity=".55"/><circle cx="27" cy="0" r="3" fill="${accent}" opacity=".55"/>
        </g>
        <g transform="translate(139 342) rotate(-37) scale(.56)">
          <rect x="-54" y="-11" width="108" height="22" rx="11" fill="${main}" fill-opacity=".18" stroke="${stroke}" stroke-width="1"/>
          <circle cx="-27" cy="0" r="3" fill="${accent}" opacity=".55"/><circle cx="27" cy="0" r="3" fill="${accent}" opacity=".55"/>
        </g>
      </g>`;
    }
    if (form === "spore") {
      return `<g>
        <g transform="translate(223 250) rotate(-7)">
          <rect x="-75" y="-14" width="150" height="28" rx="14" fill="${membrane}" fill-opacity=".3" stroke="${stroke}" stroke-width="1.1"/>
          <rect x="-23" y="-10" width="40" height="20" rx="10" fill="${main}" fill-opacity=".3" stroke="${stroke}" stroke-width="1"/>
          <ellipse cx="9" cy="0" rx="16" ry="9" fill="${PAPER}" stroke="${stroke}" stroke-width=".9"/>
          <path d="M-36 -7 C-16 -12 8 -12 28 -7" fill="none" stroke="${accent}" stroke-width=".9" opacity=".5"/>
        </g>
        <g transform="translate(320 190) rotate(28) scale(.66)">
          <rect x="-65" y="-13" width="130" height="26" rx="13" fill="${main}" fill-opacity=".22" stroke="${stroke}" stroke-width="1"/>
          <ellipse cx="45" cy="0" rx="16" ry="9" fill="${PAPER}" stroke="${stroke}" stroke-width=".8"/>
        </g>
        <ellipse cx="126" cy="349" rx="12" ry="7" fill="${membrane}" fill-opacity=".65" stroke="${stroke}" stroke-width=".8"/>
        <ellipse cx="341" cy="344" rx="8" ry="13" fill="${membrane}" fill-opacity=".55" stroke="${stroke}" stroke-width=".7"/>
        <path d="M126 342 C130 344 134 346 137 349" fill="none" stroke="${INK}" stroke-width=".55" opacity=".35"/>
      </g>`;
    }
    if (form === "filament") {
      const spikes = [
        [166, 322, -12, -10], [184, 296, -11, -12], [207, 275, -9, -13], [235, 258, -7, -13],
        [264, 253, -3, -13], [288, 239, 2, -13], [301, 216, 5, -12], [302, 191, 6, -14],
        [294, 170, 4, -13], [278, 153, 2, -12], [259, 140, 0, -11], [240, 128, -2, -10], [229, 112, -3, -8]
      ].map(([x, y, dx, dy]) => `<path d="M${x} ${y} l${dx} ${dy}" stroke="${accent}" stroke-width="1.25" opacity=".65"/><circle cx="${x + dx}" cy="${y + dy}" r="1.7" fill="${accent}" opacity=".58"/>`).join("");
      return `<g>
        <path d="M126 356 C71 291 137 232 221 249 C310 267 347 202 312 157 C288 125 247 120 232 89" fill="none" stroke="${INK}" stroke-width="15" stroke-opacity=".84" stroke-linecap="round"/>
        <path d="M126 356 C71 291 137 232 221 249 C310 267 347 202 312 157 C288 125 247 120 232 89" fill="none" stroke="${main}" stroke-width="10.5" stroke-opacity=".34" stroke-linecap="round"/>
        <path d="M139 354 C91 296 151 249 223 265 C296 281 328 211 295 174 C277 152 253 144 240 116" fill="none" stroke="${PAPER}" stroke-width="2.2" stroke-opacity=".7" stroke-linecap="round"/>
        <path d="M144 342 C113 313 122 283 153 262 C192 235 267 266 300 239" fill="none" stroke="${INK}" stroke-width="2.3" stroke-dasharray="7 7" stroke-opacity=".42" stroke-linecap="round"/>
        ${spikes}
        <g transform="translate(338 360) rotate(24)">
          <path d="M-62 0 C-41 -19 -8 -22 21 -8 C33 -2 38 3 42 10 C17 21 -18 20 -46 14" fill="none" stroke="${INK}" stroke-width="10" stroke-opacity=".78" stroke-linecap="round"/>
          <path d="M-62 0 C-41 -19 -8 -22 21 -8 C33 -2 38 3 42 10 C17 21 -18 20 -46 14" fill="none" stroke="${main}" stroke-width="6.5" stroke-opacity=".3" stroke-linecap="round"/>
          <path d="M-31 -11 l-8 -8 M-12 -16 l-9 -9 M7 -17 l-6 -10 M24 -12 l0 -10" stroke="${accent}" stroke-width="1" opacity=".55"/>
        </g>
        <g transform="translate(126 176)">
          <circle cx="0" cy="0" r="25" fill="${membrane}" fill-opacity=".25" stroke="${INK}" stroke-width=".9"/>
          <circle cx="0" cy="0" r="13" fill="${main}" fill-opacity=".2" stroke="${INK}" stroke-width=".65"/>
          <path d="M-8 -4 C-3 -11 6 -10 9 -2 C10 5 3 9 -3 8 C-9 6 -8 0 -3 -2" fill="none" stroke="${accent}" stroke-width="1.3" opacity=".7"/>
          <path d="M-25 0 C-41 2 -50 11 -57 22" fill="none" stroke="${INK}" stroke-width=".55" stroke-opacity=".45"/>
        </g>
        <g fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.2" letter-spacing=".04em">
          <text x="57" y="158">包膜 / ENV</text>
          <text x="69" y="204">核衣壳 / NP</text>
          <text x="310" y="143">糖蛋白 / GP</text>
        </g>
        <g fill="none" stroke="${INK}" stroke-width=".5" stroke-opacity=".35">
          <path d="M108 168 C112 174 113 180 119 185"/>
          <path d="M130 160 C129 165 128 169 128 171"/>
          <path d="M301 145 C294 147 287 149 278 150"/>
        </g>
        <g transform="translate(154 414)">
          <path d="M0 0h58" stroke="${INK}" stroke-width=".9" opacity=".6"/>
          <path d="M0 -3v6M58 -3v6" stroke="${INK}" stroke-width=".9" opacity=".6"/>
          <text x="64" y="3" fill="${INK}" opacity=".45" font-family="Menlo, monospace" font-size="6">示意图 / NOT TO SCALE</text>
        </g>
      </g>`;
    }
    if (form === "retrovirus") {
      const spikes = Array.from({ length: 16 }, (_, i) => {
        const angle = i * Math.PI * 2 / 16;
        const x1 = Math.cos(angle) * 64;
        const y1 = Math.sin(angle) * 64;
        const x2 = Math.cos(angle) * 76;
        const y2 = Math.sin(angle) * 76;
        return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${accent}" stroke-width="2" stroke-opacity=".5"/><circle cx="${x2}" cy="${y2}" r="2.5" fill="${accent}" fill-opacity=".7"/>`;
      }).join("");
      return `<g transform="translate(226 263)">
        <circle cx="0" cy="0" r="64" fill="${membrane}" fill-opacity=".35" stroke="${INK}" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="48" fill="none" stroke="${INK}" stroke-width=".75" opacity=".45"/>
        <path d="M-22 -31 L22 -31 L31 20 L-12 32 L-27 17Z" fill="${main}" fill-opacity=".35" stroke="${INK}" stroke-width="1.1"/>
        <path d="M-22 -31 L-12 32 M22 -31 L-12 32 M31 20 L-27 17" fill="none" stroke="${accent}" stroke-width=".8" opacity=".45"/>
        ${spikes}
        <circle cx="-8" cy="-5" r="3.2" fill="${accent}" opacity=".55"/>
      </g>
      <g transform="translate(346 385) scale(.34)"><circle cx="0" cy="0" r="64" fill="${membrane}" fill-opacity=".25" stroke="${INK}" stroke-width="2"/></g>`;
    }
    if (form === "orthomyxovirus") {
      const virus = (cx, cy, r, rotate) => {
        const spikes = Array.from({ length: 18 }, (_, i) => {
          const angle = i * Math.PI * 2 / 18;
          return `<path d="M${Math.cos(angle) * r} ${Math.sin(angle) * r} L${Math.cos(angle) * (r + 9)} ${Math.sin(angle) * (r + 9)}" stroke="${accent}" stroke-width="1.5" opacity=".55"/><circle cx="${Math.cos(angle) * (r + 9)}" cy="${Math.sin(angle) * (r + 9)}" r="1.9" fill="${accent}" opacity=".7"/>`;
        }).join("");
        return `<g transform="translate(${cx} ${cy}) rotate(${rotate})">
          <circle cx="0" cy="0" r="${r}" fill="${membrane}" fill-opacity=".35" stroke="${INK}" stroke-width="1.15"/>
          <path d="M${-r * .5} ${-r * .2} C${-r * .2} ${-r * .8} ${r * .4} ${-r * .6} ${r * .5} ${-r * .1} M${-r * .45} ${r * .25} C${-r * .1} ${-r * .05} ${r * .35} ${r * .1} ${r * .45} ${r * .4}" fill="none" stroke="${INK}" stroke-width=".7" opacity=".4"/>
          ${spikes}
        </g>`;
      };
      return `<g>${virus(220, 258, 66, -8)}${virus(322, 348, 34, 28)}${virus(133, 360, 26, 12)}</g>`;
    }
    if (form === "protozoan") {
      return `<g>
        <circle cx="220" cy="260" r="98" fill="${accent}" fill-opacity=".09" stroke="${INK}" stroke-width="1.3"/>
        <circle cx="220" cy="260" r="88" fill="none" stroke="${INK}" stroke-width=".5" opacity=".2"/>
        <path d="M220 198 C251 198 278 226 278 260 C278 294 251 322 220 322 C189 322 162 294 162 260 C162 226 189 198 220 198Z" fill="${membrane}" fill-opacity=".28" stroke="${INK}" stroke-width=".9"/>
        <path d="M212 241 C226 230 242 239 244 254 C246 267 232 276 221 271 C210 266 204 251 212 241Z" fill="none" stroke="${main}" stroke-width="3.7" stroke-opacity=".8"/>
        <circle cx="231" cy="255" r="8" fill="${main}" fill-opacity=".4" stroke="${INK}" stroke-width=".8"/>
        <circle cx="235" cy="252" r="2" fill="${accent}"/>
        <path d="M185 230 C178 244 178 266 191 281 M255 228 C266 242 269 262 258 280" fill="none" stroke="${INK}" stroke-width=".6" opacity=".35"/>
        <g transform="translate(327 339) rotate(28)">
          <ellipse cx="0" cy="0" rx="8" ry="13" fill="${main}" fill-opacity=".4" stroke="${INK}" stroke-width=".85"/>
          <circle cx="2" cy="-3" r="2.4" fill="${accent}" opacity=".65"/>
        </g>
        <g transform="translate(117 350) rotate(-22)">
          <ellipse cx="0" cy="0" rx="7" ry="11" fill="${main}" fill-opacity=".35" stroke="${INK}" stroke-width=".8"/>
        </g>
        <path d="M296 200 C314 190 331 185 347 188" fill="none" stroke="${accent}" stroke-width="1" opacity=".55"/>
      </g>`;
    }
    if (form === "vibrio") {
      return `<g>
        <g transform="translate(218 245) rotate(-16)">
          <path d="M-47 0 C-24 -27 24 -30 47 -2 C26 24 -22 27 -47 0Z" fill="${main}" fill-opacity=".25" stroke="${INK}" stroke-width="1.2"/>
          <path d="M28 2 C50 0 74 14 84 31 C66 23 52 22 35 28" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".75"/>
          <path d="M46 8 C62 9 72 15 81 26" fill="none" stroke="${INK}" stroke-width=".6" opacity=".35"/>
          <circle cx="-13" cy="-2" r="3.2" fill="${accent}" opacity=".6"/>
        </g>
        <g transform="translate(309 338) rotate(25) scale(.64)">
          <path d="M-47 0 C-24 -27 24 -30 47 -2 C26 24 -22 27 -47 0Z" fill="${main}" fill-opacity=".2" stroke="${INK}" stroke-width="1.2"/>
          <path d="M28 2 C50 0 74 14 84 31" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".65"/>
        </g>
        <g transform="translate(124 356) rotate(-30) scale(.55)">
          <path d="M-47 0 C-24 -27 24 -30 47 -2 C26 24 -22 27 -47 0Z" fill="${main}" fill-opacity=".2" stroke="${INK}" stroke-width="1.1"/>
          <path d="M28 2 C50 0 74 14 84 31" fill="none" stroke="${accent}" stroke-width="1.1" opacity=".6"/>
        </g>
        <path d="M124 197 C114 225 116 265 128 295" fill="none" stroke="${LINE}" stroke-width=".6" stroke-dasharray="2 5" opacity=".55"/>
      </g>`;
    }
    if (form === "pox") {
      return `<g>
        <g transform="translate(220 255) rotate(-10)">
          <rect x="-78" y="-54" width="156" height="108" rx="18" fill="${main}" fill-opacity=".2" stroke="${INK}" stroke-width="1.25"/>
          <rect x="-60" y="-36" width="94" height="68" rx="8" fill="${membrane}" fill-opacity=".32" stroke="${INK}" stroke-width=".8" opacity=".7"/>
          <path d="M-62 -24 C-40 -29 38 -29 58 -22 M-64 0 C-40 -6 38 -6 58 0 M-62 25 C-40 19 38 19 58 26" fill="none" stroke="${INK}" stroke-width=".75" opacity=".35"/>
          <path d="M-44 36 C-32 49 -14 55 5 51 C24 48 39 37 47 23" fill="none" stroke="${accent}" stroke-width="1.1" opacity=".5"/>
        </g>
        <g transform="translate(332 361) rotate(22) scale(.45)">
          <rect x="-60" y="-44" width="120" height="88" rx="16" fill="${main}" fill-opacity=".18" stroke="${INK}" stroke-width="1.2"/>
          <path d="M-43 -25 C-16 -31 17 -27 44 -21 M-46 0 C-18 -5 19 -5 45 0 M-42 26 C-17 20 17 22 42 26" fill="none" stroke="${INK}" stroke-width="1" opacity=".35"/>
        </g>
      </g>`;
    }
    if (form === "spirochete") {
      const coil = (cx, cy, scale, rotate) => {
        let d = "";
        for (let i = 0; i <= 74; i += 1) {
          const x = -85 + i * 2.3;
          const y = Math.sin(i * .62) * 9;
          d += `${i === 0 ? "M" : "L"}${x} ${y} `;
        }
        return `<g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})">
          <path d="${d}" fill="none" stroke="${INK}" stroke-width="4.8" stroke-opacity=".82" stroke-linecap="round"/>
          <path d="${d}" fill="none" stroke="${main}" stroke-width="2.8" stroke-opacity=".38" stroke-linecap="round"/>
          <path d="M-85 0 C-118 -11 -125 15 -94 22" fill="none" stroke="${accent}" stroke-width=".9" opacity=".6"/>
        </g>`;
      };
      return `<g>${coil(220, 250, 1, -12)}${coil(305, 356, .5, 24)}${coil(121, 358, .42, -30)}</g>`;
    }
    if (form === "bullet") {
      const bullet = (cx, cy, scale, rotate) => `<g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})">
        <path d="M-76 -20 L16 -20 C45 -20 65 0 65 0 C65 0 45 20 16 20 L-76 20 C-88 20 -92 12 -92 0 C-92 -12 -88 -20 -76 -20Z" fill="${main}" fill-opacity=".22" stroke="${INK}" stroke-width="1.15"/>
        <path d="M-76 -20 L-76 20 M-53 -19 L-53 19 M-29 -19 L-29 19" stroke="${INK}" stroke-width=".6" opacity=".3"/>
        <path d="M64 0 L80 -10 M64 0 L80 0 M64 0 L80 10" stroke="${accent}" stroke-width="1.2" opacity=".65"/>
        <path d="M-13 0 L32 0" stroke="${INK}" stroke-width=".65" opacity=".45"/>
      </g>`;
      return `<g>${bullet(219, 250, 1, -8)}${bullet(317, 360, .52, 28)}${bullet(125, 356, .4, -28)}</g>`;
    }
    if (form === "mycobacterium") {
      const rod = (cx, cy, scale, rotate) => `<g transform="translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})">
        <path d="M-65 0 C-45 -13 34 -14 59 -3 C40 13 -35 14 -65 0Z" fill="${main}" fill-opacity=".25" stroke="${INK}" stroke-width="1.1"/>
        <path d="M-48 -3 C-20 -5 21 -6 43 -3 M-37 4 C-9 7 23 6 45 3" fill="none" stroke="${accent}" stroke-width="1" opacity=".6"/>
        <path d="M-58 -7 C-36 -8 25 -9 48 -6" fill="none" stroke="${INK}" stroke-width=".55" opacity=".3"/>
      </g>`;
      return `<g>${rod(219, 244, 1, -8)}${rod(319, 325, .55, 22)}${rod(137, 359, .48, -30)}${rod(315, 416, .3, 8)}</g>`;
    }
    if (form === "flavivirus") {
      const virion = (cx, cy, r, rotate) => {
        const spikes = Array.from({ length: 12 }, (_, i) => {
          const angle = i * Math.PI / 6;
          return `<path d="M${Math.cos(angle) * r} ${Math.sin(angle) * r} L${Math.cos(angle) * (r + 8)} ${Math.sin(angle) * (r + 8)}" stroke="${accent}" stroke-width="1.1" opacity=".5"/>`;
        }).join("");
        const facets = [0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = angle * Math.PI / 180;
          return `<path d="M0 0 L${Math.cos(rad) * r * .78} ${Math.sin(rad) * r * .78}" stroke="${INK}" stroke-width=".55" opacity=".3"/>`;
        }).join("");
        return `<g transform="translate(${cx} ${cy}) rotate(${rotate})">
          <circle cx="0" cy="0" r="${r}" fill="${membrane}" fill-opacity=".3" stroke="${INK}" stroke-width="1.1"/>
          <circle cx="0" cy="0" r="${r * .78}" fill="none" stroke="${INK}" stroke-width=".7" opacity=".4"/>
          ${facets}${spikes}
        </g>`;
      };
      return `<g>${virion(218, 252, 44, -12)}${virion(315, 348, 23, 18)}${virion(124, 347, 19, -25)}${virion(326, 409, 12, 4)}${virion(132, 414, 10, 0)}</g>`;
    }
    return `<g transform="translate(220 260)">
      <circle cx="0" cy="0" r="62" fill="${main}" fill-opacity=".2" stroke="${INK}" stroke-width="1.1"/>
      <path d="M-26 -34 C13 -47 43 -14 31 18 C20 45 -21 44 -37 15 C-48 -4 -42 -25 -26 -34Z" fill="${membrane}" fill-opacity=".28" stroke="${INK}" stroke-width=".8"/>
    </g>`;
  }

  function pathogenSVG(entry, options = {}) {
    const art = entry.art || {};
    const form = art.form || "rod";
    const palette = art.palette || { main: "#83594E", membrane: "#DCCFC0", accent: "#A0432B" };
    const annotated = Boolean(options.annotated);
    const label = PATHOGEN_FORM_LABELS[form] || "结构 / FORM";
    const aria = `${esc(entry.name)}结构示意：${esc(label)}，程序生成，不按比例，非实拍。`;
    const annotations = annotated ? `<g class="plate-annotations" fill="none" stroke="${INK}" stroke-width=".55" stroke-opacity=".45">
      <path d="M305 126 C290 157 263 188 238 208"/><circle cx="305" cy="126" r="1.5" fill="${CINNABAR}" stroke="none"/>
      <path d="M344 366 C319 343 292 318 270 302"/><circle cx="344" cy="366" r="1.5" fill="${CINNABAR}" stroke="none"/>
    </g>
    ${svgText(label, 309, 122, { size: 7, tracking: ".04em", opacity: .66 })}
    ${svgText("结构 / FIELD", 348, 380, { size: 7, tracking: ".04em", opacity: .66 })}` : "";

    return `<svg class="botanical pathogen-plate" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${entry._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">结构示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7">
          <path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/>
          <path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/>
        </g>
        <circle cx="220" cy="264" r="151" fill="none" stroke="${LINE}" stroke-width=".55" stroke-dasharray="2 7" opacity=".45"/>
        <text x="220" y="88" text-anchor="middle" fill="${INK}" opacity=".35" font-family="Menlo, monospace" font-size="6.4" letter-spacing=".12em">FIELD OF VIEW · NOT TO SCALE</text>
        ${pathogenFormSVG(form, palette)}
        ${annotations}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.main}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">主</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.membrane}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">膜</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.accent}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>
          <text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">染</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${entry._no}</text>
      </g>
    </svg>`;
  }

  function ergotSVG(entry, options = {}) {
    const art = entry.art || {};
    const palette = art.palette || { cap: "#4B3A3A", gills: "#7B5A48", stem: "#B49B6A", accent: "#6C4A5A" };
    const annotated = Boolean(options.annotated);
    const aria = `${esc(entry.name)}形态示意：麦穗上的紫黑色角状菌核，非实拍，不能用于谷物或食品安全判断。`;
    return `<svg class="botanical fungus-plate ergot-plate" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${entry._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">形态示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7"><path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/><path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/></g>
        <path d="M46 430 C120 422 180 431 244 427 C312 422 365 431 400 425" fill="none" stroke="${LINE}" stroke-width=".8" opacity=".65"/>
        <g fill="none" stroke="${palette.stem}" stroke-width="1.2" stroke-linecap="round">
          <path d="M147 410 C138 330 150 255 137 174"/>
          <path d="M218 414 C213 336 225 260 215 159"/>
          <path d="M294 412 C283 332 297 259 286 183"/>
        </g>
        <g fill="${palette.stem}" fill-opacity=".22" stroke="${INK}" stroke-width=".7">
          <path d="M126 256 C111 246 108 232 120 220 C137 225 145 240 137 253Z"/>
          <path d="M139 220 C153 207 168 209 176 220 C166 235 150 239 139 231Z"/>
          <path d="M205 236 C190 226 188 211 201 199 C218 206 226 221 218 234Z"/>
          <path d="M215 197 C231 185 246 190 251 202 C240 217 224 221 215 212Z"/>
          <path d="M279 260 C264 248 263 233 276 221 C293 229 299 244 291 257Z"/>
          <path d="M287 218 C302 205 318 209 323 222 C312 237 296 240 287 231Z"/>
        </g>
        <g>
          <path d="M143 174 C129 164 128 147 141 138 C156 145 162 161 153 173Z" fill="${palette.cap}" fill-opacity=".8" stroke="${INK}" stroke-width="1"/>
          <path d="M215 159 C201 149 200 132 213 123 C228 130 234 146 225 158Z" fill="${palette.cap}" fill-opacity=".8" stroke="${INK}" stroke-width="1"/>
          <path d="M286 183 C272 173 271 156 284 147 C299 154 305 170 296 182Z" fill="${palette.cap}" fill-opacity=".8" stroke="${INK}" stroke-width="1"/>
          <path d="M151 178 C148 192 150 204 153 214M224 162 C221 178 223 190 226 202M294 186 C291 200 293 213 296 225" fill="none" stroke="${palette.accent}" stroke-width=".9" opacity=".7"/>
        </g>
        <g fill="none" stroke="${INK}" stroke-width=".55" opacity=".4">
          <path d="M112 174 C124 176 132 181 138 189"/><path d="M171 184 C161 188 153 195 148 204"/>
          <path d="M191 293 C203 295 213 300 219 308"/><path d="M254 278 C244 283 237 291 233 300"/>
        </g>
        ${annotated ? `<g class="plate-annotations" fill="none" stroke="${INK}" stroke-width=".55" stroke-opacity=".48">
          <path d="M330 128 C310 139 299 151 290 164"/><circle cx="330" cy="128" r="1.5" fill="${CINNABAR}" stroke="none"/>
          <path d="M114 385 C132 379 145 374 158 370"/><circle cx="114" cy="385" r="1.5" fill="${CINNABAR}" stroke="none"/>
        </g>
        ${svgText("菌核 / SCLEROTIUM", 334, 124, { size: 7.2, tracking: ".03em", opacity: .7 })}
        ${svgText("麦穗 / SPICA", 80, 381, { size: 7.2, tracking: ".03em", opacity: .7 })}` : ""}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.cap}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">核</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.gills}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">穗</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.stem}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">秆</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${entry._no}</text>
      </g>
    </svg>`;
  }

  function fungusCapPath(cap) {
    if (cap === "bell") return "M-78 0 C-76 -74 -38 -116 0 -116 C38 -116 76 -74 78 0 C38 12 -38 12 -78 0Z";
    if (cap === "flat") return "M-100 0 C-80 -62 -36 -84 0 -84 C36 -84 80 -62 100 0 C52 14 -52 14 -100 0Z";
    if (cap === "conical") return "M-62 0 C-54 -52 -28 -124 0 -146 C28 -124 54 -52 62 0 C28 11 -28 11 -62 0Z";
    if (cap === "brain") return "M-88 1 C-104 -25 -86 -58 -66 -60 C-54 -84 -23 -91 -10 -76 C6 -98 45 -89 49 -67 C83 -67 96 -36 86 -8 C78 17 50 17 33 8 C17 27 -9 22 -22 9 C-43 25 -77 19 -88 1Z";
    return "M-94 0 C-86 -70 -44 -100 0 -100 C44 -100 86 -70 94 0 C50 15 -50 15 -94 0Z";
  }

  function fungusSVG(entry, options = {}) {
    const art = entry.art || {};
    const palette = art.palette || { cap: "#9A8B63", gills: "#D9CEB6", stem: "#D8C8A4", accent: "#6B5A45" };
    const annotated = Boolean(options.annotated);
    const capType = art.cap || "convex";
    const cluster = Math.max(1, Math.min(3, Number(art.cluster) || 1));
    const capPath = fungusCapPath(capType);
    const spots = art.spots ? [[-54, -55, 4], [-20, -76, 3], [21, -62, 5], [55, -39, 3], [-48, -24, 2.5], [39, -82, 2.5]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" opacity=".72"/>`).join("") : "";
    const gillLines = [-62, -48, -34, -20, -7, 7, 20, 34, 48, 62].map((x) => {
      const edgeY = Math.abs(x) > 42 ? 3 : 10;
      return `<path d="M${x * .82} ${edgeY} L0 13" stroke="${palette.accent}" stroke-width=".55" opacity=".5"/>`;
    }).join("");
    const brainLines = capType === "brain"
      ? `<path d="M-72 -32 C-44 -54 -16 -37 0 -50 C22 -64 44 -47 63 -35 M-57 -8 C-30 -19 -12 -7 8 -17 C26 -27 49 -12 70 -3 M-39 9 C-21 0 2 8 18 4 C34 -1 49 5 61 7" fill="none" stroke="${palette.accent}" stroke-width=".8" opacity=".55"/>`
      : "";
    const stem = `<path d="M-23 1 C-18 56 -20 112 -33 156 L33 156 C20 112 18 56 23 1Z" fill="${palette.stem}" fill-opacity=".72" stroke="${INK}" stroke-width="1.05" stroke-opacity=".85"/>`;
    const ring = art.ring ? `<path d="M-39 58 C-18 70 20 70 41 57 C27 75 -23 76 -39 58Z" fill="${PAPER}" fill-opacity=".86" stroke="${INK}" stroke-width=".8" stroke-opacity=".7"/>` : "";
    const volva = art.volva ? `<path d="M-36 152 C-18 164 17 165 36 153 C48 171 27 184 -4 184 C-30 184 -47 171 -36 152Z" fill="${PAPER}" fill-opacity=".7" stroke="${INK}" stroke-width=".8" stroke-opacity=".65"/>` : "";
    const ringedStem = `<g transform="translate(0 259)">${stem}${ring}${volva}</g>`;

    const secondary = cluster > 1
      ? `<g transform="translate(${cluster === 3 ? 312 : 308} 382) scale(.52)">
          <g transform="translate(0 -155)"><path d="${capPath}" fill="${palette.cap}" fill-opacity=".62" stroke="${INK}" stroke-width="1.4" stroke-opacity=".8"/></g>
          <path d="M-18 0 C-13 48 -16 80 -24 97 L24 97 C16 80 13 48 18 0Z" fill="${palette.stem}" fill-opacity=".65" stroke="${INK}" stroke-width="1.1" stroke-opacity=".75"/>
          <path d="M-52 0 C-32 9 32 9 52 0" fill="none" stroke="${INK}" stroke-width=".8" opacity=".5"/>
        </g>`
      : "";
    const third = cluster === 3
      ? `<g transform="translate(132 410) scale(.34)">
          <g transform="translate(0 -150)"><path d="${capPath}" fill="${palette.cap}" fill-opacity=".5" stroke="${INK}" stroke-width="1.4" stroke-opacity=".7"/></g>
          <path d="M-18 0 C-13 48 -16 80 -24 97 L24 97 C16 80 13 48 18 0Z" fill="${palette.stem}" fill-opacity=".55" stroke="${INK}" stroke-width="1.1" stroke-opacity=".65"/>
        </g>`
      : "";

    const annotation = annotated ? `<g class="plate-annotations" fill="none" stroke="${INK}" stroke-width=".55" stroke-opacity=".48">
      <path d="M338 172 C318 180 302 192 291 208"/><circle cx="338" cy="172" r="1.5" fill="${CINNABAR}" stroke="none"/>
      <path d="M338 283 C314 285 294 287 279 290"/><circle cx="338" cy="283" r="1.5" fill="${CINNABAR}" stroke="none"/>
      <path d="M104 380 C125 376 142 372 155 368"/><circle cx="104" cy="380" r="1.5" fill="${CINNABAR}" stroke="none"/>
    </g>
    ${svgText("菌盖 / PILEUS", 342, 168, { size: 7.2, tracking: ".03em", opacity: .7 })}
    ${svgText("菌褶 / GILLS", 342, 287, { size: 7.2, tracking: ".03em", opacity: .7 })}
    ${svgText("菌柄 / STIPE", 70, 377, { size: 7.2, tracking: ".03em", opacity: .7 })}` : "";

    const aria = `${esc(entry.name)}形态示意：菌盖${esc(entry.cap)}；菌柄与菌托结构为示意，非实拍，不能用于野外鉴定。`;
    return `<svg class="botanical fungus-plate" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${entry._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">形态示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7"><path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/><path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/></g>
        <path d="M44 427 C104 419 152 430 220 426 C285 422 345 431 396 423" fill="none" stroke="${LINE}" stroke-width=".8" opacity=".7"/>
        <g fill="none" stroke="${LINE}" stroke-width=".5" opacity=".35"><path d="M54 436h18M68 441h12M320 435h25M350 440h10M88 447h8M372 448h18"/></g>
        ${secondary}${third}
        <g transform="translate(220 0)">
          ${ringedStem}
          <g transform="translate(0 259)">
            <path d="${capPath}" fill="${palette.cap}" fill-opacity=".7" stroke="${INK}" stroke-width="1.15" stroke-opacity=".9" stroke-linejoin="round"/>
            ${capType === "brain" ? brainLines : gillLines}
            <path d="M${capType === "conical" ? "-62 0" : capType === "bell" ? "-78 0" : "-94 0"} C-55 16 55 16 ${capType === "conical" ? "62 0" : capType === "bell" ? "78 0" : "94 0"}" fill="none" stroke="${INK}" stroke-width=".9" stroke-opacity=".7"/>
            ${spots}
          </g>
        </g>
        ${annotation}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.cap}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">盖</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.gills}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">褶</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.stem}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">柄</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${entry._no}</text>
      </g>
    </svg>`;
  }

  function marineSVG(entry, options = {}) {
    const art = entry.art || {};
    const palette = art.palette || { body: "#8B7F6A", fin: "#B3A48A", accent: "#5A4C3F" };
    const form = art.form || "puffer";
    const annotated = Boolean(options.annotated);
    let specimen = "";
    let labels = "";

    if (form === "puffer") {
      specimen = `<g>
        <path d="M128 270 C139 208 192 178 249 184 C303 190 334 224 340 268 C342 315 302 353 246 357 C187 361 143 331 128 270Z" fill="${palette.body}" fill-opacity=".55" stroke="${INK}" stroke-width="1.2"/>
        <path d="M334 262 C363 255 376 244 391 239 C380 259 379 281 391 298 C368 292 351 285 334 279Z" fill="${palette.fin}" fill-opacity=".8" stroke="${INK}" stroke-width=".85"/>
        <path d="M225 183 C227 151 243 136 264 131 C259 154 259 171 264 188Z" fill="${palette.fin}" fill-opacity=".8" stroke="${INK}" stroke-width=".85"/>
        <path d="M210 353 C201 384 191 402 178 416 C199 410 219 395 232 370Z" fill="${palette.fin}" fill-opacity=".72" stroke="${INK}" stroke-width=".8"/>
        <path d="M257 195 C259 181 269 172 282 171 C292 180 294 192 289 201" fill="none" stroke="${INK}" stroke-width="1"/>
        <circle cx="276" cy="184" r="5.2" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/><circle cx="277" cy="184" r="2.3" fill="${INK}"/>
        <path d="M290 206 C303 211 311 218 312 225" fill="none" stroke="${INK}" stroke-width="1.1" opacity=".75"/>
        <g stroke="${INK}" stroke-width="1.2" opacity=".65" stroke-linecap="round">
          <path d="M171 202 l-8 -18M196 191 l-5 -20M222 187 l-2 -22M249 189 l2 -22M276 196 l7 -19M301 210 l12 -16"/>
          <path d="M158 234 l-17 -7M154 258 l-18 0M158 282 l-17 7M174 311 l-11 15M202 331 l-5 18M234 340 l0 18"/>
        </g>
        <g fill="${palette.accent}" opacity=".55"><circle cx="208" cy="246" r="3"/><circle cx="231" cy="266" r="2.2"/><circle cx="196" cy="288" r="2.4"/><circle cx="255" cy="303" r="2.8"/><circle cx="286" cy="250" r="2.2"/><circle cx="300" cy="287" r="1.8"/></g>
      </g>`;
      labels = annotated ? `${svgText("河豚 / PUFFER", 300, 420, { size: 7.2, tracking: ".05em", opacity: .65 })}` : "";
    } else if (form === "cone") {
      specimen = `<g transform="translate(0 8)">
        <path d="M236 120 C279 127 307 158 319 208 C337 283 314 365 272 405 C238 438 204 417 190 374 C172 319 190 238 224 177 C232 160 233 139 236 120Z" fill="${palette.body}" fill-opacity=".48" stroke="${INK}" stroke-width="1.2"/>
        <path d="M253 168 C286 196 294 255 279 321 C268 369 247 397 226 402 C211 405 199 391 199 369 C198 330 214 255 235 203 C240 184 246 175 253 168Z" fill="${PAPER}" fill-opacity=".38" stroke="${INK}" stroke-width=".8"/>
        <path d="M238 122 C249 143 252 168 248 190 C243 219 232 244 220 267" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/>
        <path d="M223 181 C258 192 286 215 301 250 C316 286 311 329 292 365 C278 391 259 408 242 414" fill="none" stroke="${palette.fin}" stroke-width="7" opacity=".35"/>
        <g fill="none" stroke="${INK}" stroke-width=".65" opacity=".45">
          <path d="M214 204 C252 213 277 236 291 268"/><path d="M203 255 C240 262 269 285 284 318"/><path d="M198 305 C229 316 254 337 268 364"/><path d="M202 350 C223 358 240 373 249 392"/>
        </g>
        <path d="M247 154 C260 166 269 183 272 202" fill="none" stroke="${palette.accent}" stroke-width="1" opacity=".55"/>
        <circle cx="239" cy="125" r="2.4" fill="${palette.accent}" opacity=".8"/>
        <path d="M186 378 C206 404 236 417 263 409" fill="none" stroke="${INK}" stroke-width="1.1" opacity=".6"/>
        <path d="M192 371 C203 389 220 400 237 403" fill="none" stroke="${INK}" stroke-width=".7" opacity=".4"/>
      </g>`;
      labels = annotated ? `${svgText("壳 / TESTA", 320, 430, { size: 7.2, tracking: ".04em", opacity: .65 })}` : "";
    } else if (form === "boxjelly") {
      specimen = `<g>
        <path d="M143 191 C158 144 195 121 239 121 C286 121 324 147 337 193 C347 229 318 257 274 260 C243 262 203 260 169 253 C133 245 132 220 143 191Z" fill="${palette.body}" fill-opacity=".5" stroke="${INK}" stroke-width="1.2"/>
        <path d="M166 144 C189 156 215 164 241 164 C269 164 298 155 319 143" fill="none" stroke="${palette.accent}" stroke-width=".8" opacity=".55"/>
        <path d="M148 212 C190 224 238 230 282 224 C309 220 331 212 339 204" fill="none" stroke="${INK}" stroke-width=".8" opacity=".5"/>
        <g fill="none" stroke="${INK}" stroke-width="1.05" stroke-opacity=".65" stroke-linecap="round">
          <path d="M170 255 C154 305 157 358 136 418"/><path d="M184 257 C177 317 190 360 174 424"/>
          <path d="M294 248 C312 303 301 352 326 414"/><path d="M279 254 C286 310 269 363 290 426"/>
          <path d="M226 260 C219 318 230 371 220 431"/><path d="M244 260 C250 314 243 367 252 425"/>
        </g>
        <g fill="${INK}" opacity=".42"><circle cx="238" cy="150" r="2"/><circle cx="215" cy="160" r="1.5"/><circle cx="260" cy="164" r="1.5"/></g>
      </g>`;
      labels = annotated ? `${svgText("触手 / TENTACULA", 296, 440, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    } else if (form === "stonefish") {
      specimen = `<g>
        <path d="M123 332 C107 297 124 261 159 247 C188 219 243 210 286 231 C325 249 348 287 342 327 C335 369 296 394 246 395 C190 396 142 373 123 332Z" fill="${palette.body}" fill-opacity=".48" stroke="${INK}" stroke-width="1.2"/>
        <path d="M150 257 l-11 -40 l21 31M179 239 l-3 -47 l15 41M215 224 l6 -49 l8 48M250 224 l15 -44 l-4 48M283 239 l23 -36 l-12 42" fill="${palette.fin}" fill-opacity=".7" stroke="${INK}" stroke-width=".9"/>
        <path d="M132 322 C96 326 69 343 53 363 C81 365 108 358 130 345Z" fill="${palette.fin}" fill-opacity=".55" stroke="${INK}" stroke-width=".8"/>
        <path d="M306 253 C330 239 351 237 367 246 C349 254 337 265 330 279Z" fill="${palette.fin}" fill-opacity=".55" stroke="${INK}" stroke-width=".8"/>
        <path d="M287 301 C306 304 318 314 318 326 C304 333 286 330 274 321" fill="none" stroke="${INK}" stroke-width="1.1"/>
        <circle cx="277" cy="303" r="5.6" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/><circle cx="278" cy="303" r="2.4" fill="${INK}"/>
        <path d="M145 346 C166 360 198 368 230 366" fill="none" stroke="${palette.accent}" stroke-width="1.8" opacity=".6"/>
        <g fill="${palette.accent}" opacity=".35"><circle cx="169" cy="302" r="4"/><circle cx="196" cy="323" r="3"/><circle cx="230" cy="287" r="3"/><circle cx="260" cy="338" r="3"/><circle cx="300" cy="290" r="2"/><circle cx="146" cy="286" r="2"/></g>
      </g>`;
      labels = annotated ? `${svgText("背棘 / SPINAE", 352, 284, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    } else if (form === "octopus") {
      specimen = `<g>
        <path d="M193 220 C196 172 215 145 249 145 C286 145 304 173 304 218 C304 251 288 270 252 275 C216 279 192 257 193 220Z" fill="${palette.body}" fill-opacity=".58" stroke="${INK}" stroke-width="1.2"/>
        <circle cx="229" cy="201" r="5.4" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/><circle cx="230" cy="201" r="2.2" fill="${INK}"/>
        <circle cx="273" cy="201" r="5.4" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/><circle cx="274" cy="201" r="2.2" fill="${INK}"/>
        <g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-opacity=".72">
          <path d="M207 259 C173 275 143 299 121 333 C107 354 107 372 119 380 C132 389 146 375 147 358"/>
          <path d="M216 266 C188 294 166 326 151 362 C141 385 149 403 164 405 C180 407 189 391 184 371"/>
          <path d="M228 272 C215 310 209 348 205 387 C202 409 210 423 223 423 C238 423 245 407 238 388"/>
          <path d="M240 273 C243 311 251 350 263 384 C271 405 286 412 297 402 C309 391 304 372 292 362"/>
          <path d="M253 269 C275 296 296 326 312 358 C323 381 340 388 350 378 C361 367 354 346 338 335"/>
          <path d="M270 258 C306 272 338 291 358 318 C372 337 388 333 393 317 C398 301 384 287 367 280"/>
          <path d="M284 241 C319 244 350 254 375 272 C390 282 400 274 397 260 C394 247 380 239 365 235"/>
          <path d="M288 223 C323 217 352 220 374 232 C389 240 400 230 395 216 C390 202 372 199 357 199"/>
        </g>
        <g fill="${PAPER}" opacity=".75">
          <circle cx="186" cy="292" r="2.1"/><circle cx="173" cy="310" r="1.8"/><circle cx="164" cy="331" r="1.6"/>
          <circle cx="230" cy="310" r="1.8"/><circle cx="226" cy="334" r="1.6"/><circle cx="244" cy="342" r="1.8"/>
          <circle cx="281" cy="315" r="1.7"/><circle cx="299" cy="337" r="1.5"/><circle cx="321" cy="329" r="1.6"/>
        </g>
        <g fill="${palette.accent}" opacity=".9">
          <circle cx="189" cy="221" r="3.5"/><circle cx="203" cy="231" r="2.7"/><circle cx="283" cy="245" r="3"/><circle cx="302" cy="227" r="2.5"/><circle cx="266" cy="259" r="2.5"/><circle cx="218" cy="255" r="2.3"/><circle cx="245" cy="232" r="2.1"/><circle cx="257" cy="260" r="2.1"/>
        </g>
      </g>`;
      labels = annotated ? `${svgText("蓝环 / ANULI", 316, 176, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    } else {
      specimen = `<g transform="translate(0 4)">
        <path d="M223 180 C267 181 307 202 346 239 C319 260 299 292 281 331 C251 317 226 311 199 311 C171 311 148 318 118 332 C99 291 79 259 50 239 C89 201 130 181 176 180 C190 180 208 180 223 180Z" fill="${palette.body}" fill-opacity=".5" stroke="${INK}" stroke-width="1.2"/>
        <path d="M225 330 C226 374 234 421 249 463 C255 480 266 495 280 507 C274 490 271 474 271 459 C271 424 261 379 251 338" fill="none" stroke="${INK}" stroke-width="2.1" stroke-linecap="round"/>
        <path d="M256 414 C266 407 277 404 286 407 C279 417 272 426 263 433Z" fill="${palette.fin}" stroke="${INK}" stroke-width=".8"/>
        <path d="M255 420 C267 414 278 412 287 417" fill="none" stroke="${INK}" stroke-width=".7" opacity=".5"/>
        <circle cx="192" cy="219" r="4" fill="${INK}"/><circle cx="254" cy="219" r="4" fill="${INK}"/>
        <path d="M204 247 C216 252 229 252 241 247" fill="none" stroke="${INK}" stroke-width=".9" opacity=".45"/>
        <g fill="${INK}" opacity=".35"><circle cx="160" cy="222" r="2"/><circle cx="287" cy="222" r="2"/><circle cx="223" cy="202" r="1.5"/></g>
        <g fill="none" stroke="${INK}" stroke-width=".55" opacity=".35"><path d="M209 277 L209 293 M218 277 L218 294 M227 277 L227 294 M236 277 L236 293"/></g>
        <g fill="${palette.accent}" opacity=".4"><circle cx="197" cy="278" r="2.4"/><circle cx="246" cy="279" r="2"/><circle cx="169" cy="257" r="1.8"/><circle cx="278" cy="257" r="1.7"/></g>
      </g>`;
      labels = annotated ? `${svgText("尾刺 / ACULEUS", 292, 452, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    }

    const aria = `${esc(entry.name)}形态示意：${form === "puffer" ? "河豚的圆钝体形与鳍" : form === "cone" ? "芋螺的锥形壳与壳口" : form === "boxjelly" ? "箱水母的箱形伞体与触手" : form === "stonefish" ? "毒鲉的疣状体表与背棘" : form === "octopus" ? "蓝环章鱼的体形与蓝环" : "魟的菱形体盘与尾刺"}。程序生成，非实拍。`;
    return `<svg class="botanical marine-plate" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${entry._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">形态示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7"><path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/><path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/></g>
        <g fill="none" stroke="${LINE}" stroke-width=".5" opacity=".35"><path d="M55 448h20M68 455h10M336 445h24M354 452h10"/></g>
        ${specimen}${labels}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.body}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">体</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.fin}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">鳍</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.accent}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">纹</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${entry._no}</text>
      </g>
    </svg>`;
  }

  function arthropodSVG(entry, options = {}) {
    const art = entry.art || {};
    const palette = art.palette || { body: "#3E352B", accent: "#A0432B", shadow: "#6C5D4D" };
    const form = art.form || "spider";
    const annotated = Boolean(options.annotated);
    let specimen = "";
    let labels = "";

    if (form === "beetle") {
      specimen = `<g>
        <path d="M219 219 C219 196 230 181 247 181 C264 181 275 196 275 219 C275 238 263 249 247 249 C231 249 219 238 219 219Z" fill="${palette.body}" fill-opacity=".62" stroke="${INK}" stroke-width="1.1"/>
        <path d="M205 251 C205 225 221 207 246 207 C272 207 288 225 288 251 L288 312 C288 352 271 382 246 390 C221 382 205 352 205 312Z" fill="${palette.body}" fill-opacity=".48" stroke="${INK}" stroke-width="1.2"/>
        <path d="M246 209 L246 382" fill="none" stroke="${INK}" stroke-width=".85" opacity=".5"/>
        <path d="M215 228 C222 217 232 211 246 211 M277 228 C270 217 260 211 246 211" fill="none" stroke="${palette.accent}" stroke-width=".8" opacity=".5"/>
        <path d="M219 252 C201 241 189 224 179 203 M273 252 C291 241 303 224 313 203" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>
        <g fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".8">
          <path d="M213 278 C181 271 159 258 139 240"/><path d="M211 304 C176 301 147 299 119 299"/><path d="M213 329 C183 338 159 350 139 369"/>
          <path d="M279 278 C311 271 333 258 353 240"/><path d="M281 304 C316 301 345 299 373 299"/><path d="M279 329 C309 338 333 350 353 369"/>
        </g>
        <path d="M246 207 C246 190 253 178 266 172 M246 207 C246 190 239 178 226 172" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>
        <path d="M246 391 C236 404 226 415 216 426 M246 391 C256 404 266 415 276 426" fill="none" stroke="${INK}" stroke-width=".9" opacity=".6"/>
        <g fill="${palette.accent}" opacity=".55"><circle cx="225" cy="248" r="2.2"/><circle cx="268" cy="274" r="1.6"/><circle cx="230" cy="337" r="2"/><circle cx="262" cy="351" r="1.4"/></g>
      </g>`;
      labels = annotated ? `${svgText("鞘翅 / ELYTRA", 300, 356, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    } else if (form === "scorpion") {
      specimen = `<g>
        <path d="M185 301 C185 271 204 252 232 252 C261 252 281 271 281 301 C281 330 260 348 232 348 C204 348 185 330 185 301Z" fill="${palette.body}" fill-opacity=".56" stroke="${INK}" stroke-width="1.2"/>
        <path d="M207 263 C202 245 210 229 224 219 C233 232 232 249 225 263Z" fill="${palette.body}" fill-opacity=".4" stroke="${INK}" stroke-width=".8"/>
        <g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".82">
          <path d="M198 292 C170 275 143 251 119 223"/><path d="M193 309 C159 303 126 304 95 313"/>
          <path d="M269 292 C297 275 324 251 348 223"/><path d="M271 309 C305 303 338 304 369 313"/>
          <path d="M200 328 C172 345 151 369 137 397"/><path d="M264 328 C292 345 313 369 327 397"/>
        </g>
        <g transform="translate(132 282) rotate(-17)">
          <path d="M0 0 C-13 -15 -35 -14 -43 0 C-51 15 -35 27 -18 23 C-6 20 1 11 0 0Z" fill="${palette.body}" fill-opacity=".55" stroke="${INK}" stroke-width="1.1"/>
          <path d="M-43 0 C-56 -6 -68 -2 -70 9 C-71 19 -61 25 -51 20 C-43 16 -40 8 -43 0Z" fill="${palette.body}" fill-opacity=".45" stroke="${INK}" stroke-width=".9"/>
          <path d="M-12 -7 C-24 -14 -38 -12 -47 -2" fill="none" stroke="${INK}" stroke-width=".7" opacity=".45"/>
        </g>
        <g transform="translate(332 282) rotate(17) scale(-1 1)">
          <path d="M0 0 C-13 -15 -35 -14 -43 0 C-51 15 -35 27 -18 23 C-6 20 1 11 0 0Z" fill="${palette.body}" fill-opacity=".55" stroke="${INK}" stroke-width="1.1"/>
          <path d="M-43 0 C-56 -6 -68 -2 -70 9 C-71 19 -61 25 -51 20 C-43 16 -40 8 -43 0Z" fill="${palette.body}" fill-opacity=".45" stroke="${INK}" stroke-width=".9"/>
          <path d="M-12 -7 C-24 -14 -38 -12 -47 -2" fill="none" stroke="${INK}" stroke-width=".7" opacity=".45"/>
        </g>
        <path d="M274 309 C296 286 308 256 302 225 C297 197 277 181 259 189 C242 197 239 217 251 229 C262 240 277 233 278 220" fill="none" stroke="${INK}" stroke-width="5.2" stroke-linecap="round" opacity=".82"/>
        <g fill="none" stroke="${INK}" stroke-width="1.1" opacity=".7">
          <path d="M296 279 l14 7"/><path d="M303 254 l14 7"/><path d="M302 229 l14 4"/><path d="M289 207 l10 10"/>
        </g>
        <path d="M278 220 C290 211 304 207 313 213 C313 225 300 235 286 235Z" fill="${palette.accent}" fill-opacity=".85" stroke="${INK}" stroke-width=".8"/>
        <path d="M298 210 C307 202 315 198 322 199" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="221" cy="286" r="3.5" fill="${INK}"/><circle cx="244" cy="286" r="3.5" fill="${INK}"/>
        <g fill="${palette.accent}" opacity=".42"><circle cx="206" cy="311" r="2"/><circle cx="257" cy="319" r="2"/><circle cx="230" cy="334" r="1.6"/></g>
      </g>`;
      labels = annotated ? `${svgText("尾针 / ACULEUS", 326, 194, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    } else if (form === "funnelweb") {
      specimen = `<g>
        <path d="M195 267 C195 238 217 219 247 219 C279 219 301 240 301 269 C301 302 278 320 247 320 C216 320 195 301 195 267Z" fill="${palette.body}" fill-opacity=".62" stroke="${INK}" stroke-width="1.1"/>
        <path d="M227 237 C227 211 241 198 259 198 C278 198 292 213 292 238" fill="none" stroke="${INK}" stroke-width="1.1" opacity=".5"/>
        <path d="M227 238 C219 223 207 210 195 201 M266 238 C276 219 288 207 301 198" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".6"/>
        <g fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" opacity=".85">
          <path d="M205 277 C166 257 138 231 115 201"/><path d="M201 293 C162 282 127 275 92 273"/><path d="M204 309 C170 320 143 338 120 360"/><path d="M215 323 C193 350 180 378 173 409"/>
          <path d="M289 277 C328 257 356 231 379 201"/><path d="M293 293 C332 282 367 275 402 273"/><path d="M290 309 C324 320 351 338 374 360"/><path d="M279 323 C301 350 314 378 321 409"/>
        </g>
        <path d="M231 293 C226 306 227 319 235 331 M263 293 C268 306 267 319 259 331" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="237" cy="256" r="3" fill="${PAPER}"/><circle cx="258" cy="256" r="3" fill="${PAPER}"/><circle cx="247" cy="251" r="2.2" fill="${PAPER}"/>
        <g fill="none" stroke="${LINE}" stroke-width=".7" opacity=".55"><path d="M84 170 C130 205 174 231 215 247 M400 170 C354 205 310 231 279 247 M65 334 C113 325 161 335 203 351 M419 334 C371 325 323 335 291 351"/></g>
      </g>`;
      labels = annotated ? `${svgText("螯肢 / CHELICERAE", 330, 326, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    } else {
      const mark = art.mark || "hourglass";
      specimen = `<g>
        <path d="M195 279 C195 249 217 230 247 230 C279 230 301 250 301 280 C301 313 278 332 247 332 C216 332 195 312 195 279Z" fill="${palette.body}" fill-opacity=".58" stroke="${INK}" stroke-width="1.1"/>
        <path d="M225 236 C225 209 239 195 257 195 C277 195 291 211 291 237" fill="none" stroke="${INK}" stroke-width="1.05" opacity=".5"/>
        <g fill="none" stroke="${INK}" stroke-width="2.7" stroke-linecap="round" opacity=".8">
          <path d="M206 274 C168 252 141 225 120 194"/><path d="M201 290 C163 279 129 272 94 270"/><path d="M203 306 C169 316 143 333 120 356"/><path d="M214 321 C192 349 181 377 174 410"/>
          <path d="M288 274 C326 252 353 225 374 194"/><path d="M293 290 C331 279 365 272 400 270"/><path d="M291 306 C325 316 351 333 374 356"/><path d="M280 321 C302 349 313 377 320 410"/>
        </g>
        <path d="M231 287 C225 301 226 315 235 326 M263 287 C269 301 268 315 259 326" fill="none" stroke="${INK}" stroke-width="2.1" stroke-linecap="round"/>
        <circle cx="237" cy="255" r="3.2" fill="${PAPER}"/><circle cx="258" cy="255" r="3.2" fill="${PAPER}"/><circle cx="247" cy="250" r="2.2" fill="${PAPER}"/>
        ${mark === "fiddle" ? `<path d="M232 302 C238 289 254 289 260 302 C254 314 238 314 232 302Z" fill="none" stroke="${palette.accent}" stroke-width="1.2" opacity=".8"/><path d="M244 291 C247 300 247 305 246 311 M238 298 C241 301 249 301 254 298" fill="none" stroke="${palette.accent}" stroke-width=".8" opacity=".7"/>` : mark === "none" ? "" : `<path d="M235 300 L247 289 L259 300 L247 314Z" fill="${palette.accent}" opacity=".75"/>`}
        <g fill="${palette.accent}" opacity=".5"><circle cx="222" cy="270" r="2"/><circle cx="271" cy="270" r="2"/><circle cx="247" cy="318" r="1.8"/></g>
      </g>`;
      const markLabel = mark === "fiddle" ? "提琴斑 / FIDDLE" : mark === "none" ? "眼列 / OCELLI" : "沙漏斑 / HOURGLASS";
      labels = annotated ? `${svgText(markLabel, 318, 324, { size: 7.2, tracking: ".03em", opacity: .65 })}` : "";
    }

    const aria = `${esc(entry.name)}形态示意：${form === "scorpion" ? "蝎的螯肢、体节与尾针" : form === "funnelweb" ? "漏斗网蛛的体形、螯肢与漏斗状网" : form === "beetle" ? "甲虫的鞘翅、触角与六足" : "蜘蛛的体形、八足与腹部斑纹"}。程序生成，非实拍。`;
    return `<svg class="botanical arthropod-plate" viewBox="0 0 440 540" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">
      <g>
        <text x="26" y="31" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="7.2" letter-spacing=".1em">PLATE ${entry._no}</text>
        <text x="414" y="31" fill="${INK}" opacity=".48" font-family="Menlo, monospace" font-size="7" letter-spacing=".13em" text-anchor="end">形态示意</text>
        <g fill="none" stroke="${LINE}" stroke-width=".6" opacity=".7"><path d="M26 46h12M32 40v12"/><path d="M402 46h12M408 40v12"/><path d="M26 478h12M32 472v12"/><path d="M402 478h12M408 472v12"/></g>
        <g fill="none" stroke="${LINE}" stroke-width=".5" opacity=".35"><path d="M54 446h20M68 453h10M338 446h22M356 453h10"/></g>
        ${specimen}${labels}
        <g transform="translate(26 517)">
          <text x="0" y="4" fill="${INK}" opacity=".5" font-family="Menlo, monospace" font-size="6.8" letter-spacing=".08em">COLOR</text>
          <rect x="37" y="-6" width="9" height="9" fill="${palette.body}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="50" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">体</text>
          <rect x="68" y="-6" width="9" height="9" fill="${palette.accent}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="81" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">纹</text>
          <rect x="99" y="-6" width="9" height="9" fill="${palette.shadow}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/><text x="112" y="3" fill="${INK}" opacity=".52" font-family="Menlo, monospace" font-size="6.6">影</text>
        </g>
        <text x="414" y="521" text-anchor="end" fill="${INK}" opacity=".36" font-family="Menlo, monospace" font-size="6.5" letter-spacing=".08em">POISON &amp; PATHOGEN ATLAS · ${entry._no}</text>
      </g>
    </svg>`;
  }

  function entryArtSVG(entry, options = {}) {
    if (entry.kind === "plant") return botanicalSVG(entry, options);
    if (entry.kind === "snake") return snakeSVG(entry, options);
    if (entry.kind === "fungus") return entry.art && entry.art.form === "ergot" ? ergotSVG(entry, options) : fungusSVG(entry, options);
    if (entry.kind === "marine") return marineSVG(entry, options);
    if (entry.kind === "arthropod") return arthropodSVG(entry, options);
    return pathogenSVG(entry, options);
  }

  function artCaption(entry) {
    return isPathogen(entry) ? "结构示意" : "形态示意";
  }

  /* =========================================================
     Rendering the index
     ========================================================= */

  function shorten(text, max = 42) {
    const value = String(text || "");
    return value.length > max ? `${value.slice(0, max)}…` : value;
  }

  function getProfileFields(entry) {
    if (Array.isArray(entry.profile) && entry.profile.length) return entry.profile;
    if (entry.kind === "plant") {
      return [
        { label: "生境", value: entry.habitat },
        { label: "分布", value: entry.distribution },
        { label: "株高", value: entry.height },
        { label: "花期", value: entry.bloom },
        { label: "叶形", value: entry.morphology.leaf },
        { label: "花形", value: entry.morphology.flower },
        { label: "果形", value: entry.morphology.fruit },
        { label: "花色", value: entry.morphology.flowerColor },
        { label: "叶色", value: entry.morphology.leafColor },
        { label: "茎色", value: entry.morphology.stemColor },
        { label: "气味", value: entry.smell }
      ];
    }
    return [];
  }

  function getCardFacts(entry) {
    if (entry.kind === "plant") {
      return [
        { label: "发作 · 参考", value: timelineText(entry) },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") },
        { label: "花期", value: entry.bloom },
        { label: "花色", value: entry.morphology.flowerColor }
      ];
    }
    if (entry.kind === "snake") {
      return [
        { label: "发作 · 参考", value: timelineText(entry) },
        { label: "体长", value: entry.length },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") },
        { label: "活动", value: entry.activity }
      ];
    }
    if (isFungus(entry)) {
      return [
        { label: "发作 · 参考", value: timelineText(entry) },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") },
        { label: "菌盖", value: shorten(entry.cap, 26) },
        { label: "孢子印", value: entry.sporePrint }
      ];
    }
    if (isMarine(entry) || isArthropod(entry)) {
      return [
        { label: "发作 · 参考", value: timelineText(entry) },
        { label: "体长", value: entry.length },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") },
        { label: "活动", value: shorten(entry.activity, 24) }
      ];
    }
    const typeField = (entry.profile || []).find((item) => item.label === "病原类型");
    return [
      { label: "潜伏 · 参考", value: timelineText(entry) },
      { label: "传播", value: (entry.routeTags || []).join(" / ") },
      { label: "病原", value: typeField ? shorten(typeField.value, 24) : entry._kind.label },
      { label: "分布", value: shorten(entry.distribution || "", 34) }
    ];
  }

  function getQuickFacts(entry) {
    if (entry.kind === "plant") {
      return [
        { label: "发作", value: timelineText(entry), ref: true },
        { label: "有毒部位", value: entry.hazard.source || entry.hazard.parts },
        { label: "药用", value: entry.medicinal ? (entry.medicinal.used ? "入药记载" : "未入常规药用") : "—" },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") }
      ];
    }
    if (entry.kind === "snake") {
      return [
        { label: "发作", value: timelineText(entry), ref: true },
        { label: "毒器", value: entry.hazard.source },
        { label: "体长", value: entry.length },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") }
      ];
    }
    if (isFungus(entry)) {
      return [
        { label: "发作", value: timelineText(entry), ref: true },
        { label: "有毒部位", value: entry.hazard.source },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") },
        { label: "分布", value: shorten(entry.distribution, 28) }
      ];
    }
    if (isMarine(entry) || isArthropod(entry)) {
      return [
        { label: "发作", value: timelineText(entry), ref: true },
        { label: "毒器", value: entry.hazard.source },
        { label: "体长", value: entry.length },
        { label: "生境", value: (entry.habitatTypes || []).join(" / ") }
      ];
    }
    return [
      { label: "潜伏", value: timelineText(entry), ref: true },
      { label: "传播", value: (entry.routeTags || []).join(" / ") },
      { label: "病原", value: entry._kind.label + " · " + shortPathogenFamily(entry.family) },
      { label: "环境", value: (entry.habitatTypes || []).join(" / ") }
    ];
  }

  function shortPathogenFamily(family) {
    return String(family || "").split(" ")[0] || String(family || "");
  }

  function renderHero() {
    const heroEntry = entryMap.get("hydrophis-cyanocinctus") || catalog[0];
    if (!heroEntry) return;
    dom.heroEntryCount.textContent = totalEntries;
    dom.heroKindCount.textContent = META.categories.length;
    dom.heroSymptomCount.textContent = META.symptoms.length;
    dom.totalCount.textContent = totalEntries;
    dom.heroFigureName.textContent = heroEntry.name;
    dom.heroFigureLatin.textContent = heroEntry.latin;
    if (dom.heroFigureKind) dom.heroFigureKind.textContent = `${heroEntry._kind.label} · ${shortPathogenFamily(heroEntry.family)}`;
    dom.heroPlate.innerHTML = entryArtSVG(heroEntry, { annotated: true });
    const plateNo = $(".hero-figure .plate-head span:last-child");
    if (plateNo) plateNo.textContent = `NO. ${heroEntry._no} / ${totalEntries}`;
    if (dom.indexUpdated) {
      const updated = String(META.updated || "").replace(/[^\d]/g, ".");
      dom.indexUpdated.textContent = updated ? `MMXXVI / ${updated.split(".").filter(Boolean).pop() || "11"}` : "MMXXVI / 11";
    }
  }

  function renderKindTabs() {
    if (!dom.kindTabs) return;
    const tabs = [
      { key: "all", label: "全部", count: totalEntries },
      ...META.categories.map((category) => ({ key: category.key, label: category.label, count: kindCounts[category.key] || 0 }))
    ];
    dom.kindTabs.innerHTML = tabs.map((tab) => `
      <button class="kind-tab" type="button" data-kind="${esc(tab.key)}" aria-pressed="${state.kind === tab.key ? "true" : "false"}">
        <span>${esc(tab.label)}</span><small>${tab.count}</small>
      </button>`).join("");
  }

  function syncKindTabs() {
    if (!dom.kindTabs) return;
    $$("[data-kind]", dom.kindTabs).forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.kind === state.kind ? "true" : "false");
    });
  }

  function renderSymptomGrid() {
    dom.symptomGrid.innerHTML = CORE_SYMPTOMS.map((symptom, index) => {
      const count = countForSymptom(symptom.zh);
      const plantCount = countPlantsForSymptom(symptom.zh);
      return `<button class="symptom-button" type="button" data-symptom="${esc(symptom.zh)}" aria-pressed="false" aria-label="${esc(symptom.zh)}，全库 ${count} 条，植物 ${plantCount} 条" title="${esc(symptom.en)} · ${esc(symptom.hint)}；全库 ${count} 条，植物 ${plantCount} 条">
        <span class="symptom-number">${pad2(index + 1)}</span>
        <span class="symptom-copy">
          <span class="symptom-zh">${esc(symptom.zh)}</span>
          <span class="symptom-en">${esc(symptom.en)}</span>
        </span>
        <span class="symptom-count"><span class="symptom-total"><strong>${count}</strong><span class="symptom-count-unit">种</span></span><small class="symptom-plant-count">植物 ${plantCount}</small></span>
      </button>`;
    }).join("");

    if (dom.symptomExtraGrid) {
      dom.symptomExtraGrid.innerHTML = EXTENDED_SYMPTOMS.map((symptom, index) => {
        const count = countForSymptom(symptom.zh);
        const plantCount = countPlantsForSymptom(symptom.zh);
        return `<button class="symptom-pill" type="button" data-symptom="${esc(symptom.zh)}" aria-pressed="false" aria-label="${esc(symptom.zh)}，全库 ${count} 条，植物 ${plantCount} 条" title="${esc(symptom.en)} · ${esc(symptom.hint)}；全库 ${count} 条，植物 ${plantCount} 条">
          <span class="symptom-pill-index">${pad2(CORE_SYMPTOMS.length + index + 1)}</span>
          <span class="symptom-pill-name">${esc(symptom.zh)}</span>
          <span class="symptom-pill-count">${count}</span>
        </button>`;
      }).join("");
    }
  }

  function syncSymptomButtons() {
    if (!dom.symptomBoard) return;
    $$("[data-symptom]", dom.symptomBoard).forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.symptom === state.symptom ? "true" : "false");
    });
  }

  function renderSymptomOutput() {
    if (!state.symptom) {
      dom.symptomOutput.innerHTML = `<div class="symptom-idle">
        <span class="symptom-idle-mark" aria-hidden="true">索</span>
        <div>
          <p class="mini-label">Triage desk / 待选</p>
          <p class="symptom-idle-title">若不知从何写起，<br>就从角色最先说出口的不适开始。</p>
          <p>口唇发麻、幻觉、心跳失序、发热或出血——症状可能是植物毒、蛇毒，也可能是感染。选一项，这里会列出对应毒物、时间线索与危险等级。</p>
        </div>
      </div>`;
      return;
    }

    const symptomMeta = symptomLookup(state.symptom);
    const matches = catalog
      .filter((entry) => (entry.hazard.symptoms || []).includes(state.symptom))
      .sort((a, b) => b.hazard.level - a.hazard.level || a._index - b._index);
    const shown = matches.slice(0, 6);

    if (!matches.length) {
      dom.symptomOutput.innerHTML = `<div class="triage-empty">目前没有收录与「${esc(state.symptom)}」对应的毒物。</div>`;
      return;
    }

    const rows = shown.map((entry) => {
      const level = levelInfo(entry.hazard.level);
      return `<a class="triage-row" href="#${esc(entry.id)}" aria-label="查看${esc(entry.name)}标本卡，${esc(entry._kind.label)}">
        <span class="triage-plant"><strong>${esc(entry.name)}</strong><em>${esc(entry.latin)}</em><span class="triage-kind">${esc(entry._kind.label)}</span></span>
        <span class="triage-onset"><span class="triage-inline-label">${esc(timingLabel(entry))} / </span>${esc(timelineText(entry))}</span>
        <span class="triage-danger">${dangerMeter(entry.hazard.level)}
          <span class="level-word">${esc(level.numeral)} · ${esc(hazardLabel(entry))}</span>
        </span>
        <span class="triage-arrow" aria-hidden="true">↗</span>
      </a>`;
    }).join("");

    dom.symptomOutput.innerHTML = `<div class="symptom-result-card">
      <div class="triage-header">
        <div>
          <p class="mini-label">Triage desk / 症状索引</p>
          <div class="triage-title-row">
            <h3 class="triage-title">${esc(state.symptom)}</h3>
            <span class="triage-title-en">${esc(symptomMeta ? symptomMeta.en : "")}</span>
          </div>
          <p class="triage-count">共 ${matches.length} 种相关毒物 · 按危险等级排序，先列 ${shown.length} 种</p>
        </div>
        <button class="triage-clear" type="button" data-clear-symptom>取消选择 ×</button>
      </div>
      <div class="triage-table">
        <div class="triage-table-head" aria-hidden="true">
          <span>毒物 / Agent</span><span>发作 / 潜伏</span><span>危险级 / Danger</span><span></span>
        </div>
        ${rows}
      </div>
      <div class="triage-footer">
        <p class="triage-note">所有时间、症状与危险级均为「参考」资料，个体差异极大。</p>
        <a class="triage-cta" href="#library">在标本目录中查看同症状条目 ↓</a>
      </div>
    </div>`;
  }

  function renderDangerScale() {
    if (!dom.dangerScale) return;
    dom.dangerScale.innerHTML = META.dangerScale.map((item) => {
      const ticks = Array.from({ length: 5 }, (_, index) =>
        `<span class="scale-tick${index < item.level ? " is-filled" : " is-muted"}"></span>`
      ).join("");
      return `<li>
        <span class="scale-num">${esc(item.numeral)} / LEVEL ${item.level} · ${esc(item.filterLabel.split(" ").slice(1).join(" ") || item.label)}</span>
        <span class="scale-ticks" aria-hidden="true">${ticks}</span>
        <strong>${esc(item.poisonLabel)} <i>/</i> ${esc(item.pathogenLabel)}</strong>
        <p>${esc(item.range)}</p>
      </li>`;
    }).join("");
  }

  function renderFilterControls() {
    dom.hazardFilters.innerHTML = META.dangerGroups.map((group) => {
      const item = levelInfo(group.levels[0]);
      return `<button class="filter-chip" type="button" data-hazard="${esc(group.key)}" aria-pressed="false" title="${esc(item.filterLabel)} · 毒物：${esc(item.poisonLabel)}；病原：${esc(item.pathogenLabel)}。${esc(item.range)}">
        <span class="chip-roman">${esc(item.numeral)}</span><span>${esc(item.label)}</span>
      </button>`;
    }).join("");

    dom.routeFilters.innerHTML = META.routeTypes.map((route) =>
      `<button class="filter-chip" type="button" data-route="${esc(route)}" aria-pressed="false">${esc(route)}</button>`
    ).join("");

    dom.habitatFilters.innerHTML = META.habitatTypes.map((habitat) =>
      `<button class="filter-chip" type="button" data-habitat="${esc(habitat)}" aria-pressed="false">${esc(habitat)}</button>`
    ).join("");

    dom.colorFilters.innerHTML = META.flowerColors.map((color) =>
      `<button class="filter-chip" type="button" data-color="${esc(color.key)}" aria-pressed="false">
        <span class="chip-dot" style="background:${esc(color.dot)}" aria-hidden="true"></span>${esc(color.key)}
      </button>`
    ).join("");
  }

  function syncFilterControls() {
    syncKindTabs();
    $$("[data-hazard]", dom.hazardFilters).forEach((button) => {
      button.setAttribute("aria-pressed", state.hazardGroups.has(button.dataset.hazard) ? "true" : "false");
    });
    $$("[data-route]", dom.routeFilters).forEach((button) => {
      button.setAttribute("aria-pressed", state.routes.has(button.dataset.route) ? "true" : "false");
    });
    $$("[data-habitat]", dom.habitatFilters).forEach((button) => {
      button.setAttribute("aria-pressed", state.habitats.has(button.dataset.habitat) ? "true" : "false");
    });
    $$("[data-color]", dom.colorFilters).forEach((button) => {
      button.setAttribute("aria-pressed", state.colors.has(button.dataset.color) ? "true" : "false");
    });
    $$("[data-medicinal]", dom.medicinalFilters).forEach((button) => {
      const selected = button.dataset.medicinal === "yes" ? state.medicinal === true : state.medicinal === false;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    const facetCount = state.hazardGroups.size + state.routes.size + state.habitats.size + state.colors.size +
      (state.medicinal === null ? 0 : 1) + (state.symptom ? 1 : 0) + (state.kind !== "all" ? 1 : 0);
    dom.filterCount.hidden = facetCount === 0;
    dom.filterCount.textContent = facetCount;
    dom.clearFilters.hidden = facetCount === 0 && !state.query;
    dom.searchClear.hidden = !state.query;
    dom.filterToggle.setAttribute("aria-expanded", dom.filtersPanel.classList.contains("is-open") ? "true" : "false");
    syncSymptomButtons();
    renderActiveFilters();
  }

  function renderActiveFilters() {
    const chips = [];
    if (state.kind !== "all") {
      chips.push({ type: "kind", value: state.kind, label: `类群 · ${kindInfo(state.kind).label}` });
    }
    if (state.symptom) chips.push({ type: "symptom", value: state.symptom, label: `症状 · ${state.symptom}` });
    state.hazardGroups.forEach((key) => {
      const group = DANGER_GROUP_MAP.get(key);
      if (group) chips.push({ type: "hazard", value: key, label: `危险 · ${group.label}` });
    });
    state.routes.forEach((route) => chips.push({ type: "route", value: route, label: `暴露 · ${route}` }));
    state.habitats.forEach((habitat) => chips.push({ type: "habitat", value: habitat, label: `环境 · ${habitat}` }));
    state.colors.forEach((color) => chips.push({ type: "color", value: color, label: `外观 · ${color}` }));
    if (state.medicinal !== null) {
      chips.push({ type: "medicinal", value: state.medicinal ? "yes" : "no", label: state.medicinal ? "药用 · 入药" : "药用 · 未入药" });
    }
    if (state.query) {
      const short = state.query.length > 18 ? `${state.query.slice(0, 18)}…` : state.query;
      chips.push({ type: "query", value: state.query, label: `检索 · ${short}` });
    }

    if (!chips.length) {
      dom.activeFilters.innerHTML = "";
      return;
    }

    dom.activeFilters.innerHTML = chips.map((chip) =>
      `<span class="active-filter">${esc(chip.label)}<button type="button" data-remove-filter="${chip.type}" data-value="${esc(chip.value)}" aria-label="移除${esc(chip.label)}">×</button></span>`
    ).join("") + `<button class="active-filter-clear" type="button" data-clear-all>清除全部</button>`;
  }

  function matchesSearch(entry) {
    if (!state.query) return true;
    return entry._search.includes(normalize(state.query));
  }

  function matchesKind(entry) {
    return state.kind === "all" || entry.kind === state.kind;
  }

  function matchesHazard(entry) {
    if (!state.hazardGroups.size) return true;
    return Array.from(state.hazardGroups).some((key) => {
      const group = DANGER_GROUP_MAP.get(key);
      return group && group.levels.includes(entry.hazard.level);
    });
  }

  function matchesRoute(entry) {
    if (!state.routes.size) return true;
    return (entry.routeTags || []).some((route) => state.routes.has(route));
  }

  function matchesHabitat(entry) {
    if (!state.habitats.size) return true;
    return (entry.habitatTypes || []).some((habitat) => state.habitats.has(habitat));
  }

  function matchesColor(entry) {
    if (!state.colors.size) return true;
    return (entry.colorTags || []).some((color) => state.colors.has(color));
  }

  function matchesMedicinal(entry) {
    if (state.medicinal === null) return true;
    return entry.kind === "plant" && entry.medicinal && entry.medicinal.used === state.medicinal;
  }

  function getFilteredEntries() {
    return catalog.filter((entry) => {
      if (state.symptom && !(entry.hazard.symptoms || []).includes(state.symptom)) return false;
      return matchesSearch(entry) && matchesKind(entry) && matchesHazard(entry) &&
        matchesRoute(entry) && matchesHabitat(entry) && matchesColor(entry) && matchesMedicinal(entry);
    });
  }

  function dangerMeter(level, large = false) {
    const info = levelInfo(level);
    const ticks = Array.from({ length: 5 }, (_, index) =>
      `<span class="tox-meter-seg${index < level ? " is-filled" : ""}"></span>`
    ).join("");
    return `<span class="tox-meter${large ? " is-large" : ""}" role="img" aria-label="危险等级 ${level} 级，共 5 级，${esc(info.label)}">${ticks}</span>`;
  }

  function dangerStamp(entry) {
    const info = levelInfo(entry.hazard.level);
    return `<span class="tox-stamp"><span class="stamp-roman">${esc(info.numeral)}</span><span class="stamp-level-label">${esc(hazardPrefix(entry))} · ${esc(hazardLabel(entry))}</span></span>`;
  }

  function lethalSummary(lethal) {
    const value = String(lethal || "");
    if (/^否/.test(value)) return "通常不致死";
    if (/^较低|致死性低|罕见致死/.test(value)) return "致死性较低";
    if (/^是|有致死风险|可致死亡/.test(value)) return "有致死风险";
    if (/可能|少数|可致死|风险更高/.test(value)) return "可能致死";
    return "资料不足";
  }

  function symptomTags(entry, limit) {
    const all = entry.hazard.symptoms || [];
    const tags = limit ? all.slice(0, limit) : all;
    const remaining = limit ? all.length - tags.length : 0;
    return tags.map((symptom) => `<span class="symptom-tag">${esc(symptom)}</span>`).join("") +
      (remaining > 0 ? `<span class="symptom-tag is-extra">+${remaining}</span>` : "");
  }

  function renderEntry(entry) {
    const level = levelInfo(entry.hazard.level);
    const kind = entry._kind;
    const aliases = (entry.aliases || []).slice(0, 3).join(" · ");
    const family = shortPathogenFamily(entry.family);
    const medLabel = entry.kind === "plant" && entry.medicinal
      ? (entry.medicinal.used ? "入药记载" : "未入常规药用")
      : "";
    const facts = getCardFacts(entry);
    const label = hazardLabel(entry);

    return `<a class="specimen-entry kind-${esc(entry.kind)}" href="#${esc(entry.id)}" aria-label="查看${esc(entry.name)}，${esc(kind.label)}，危险级${level.numeral}，${esc(label)}">
      <div class="entry-folio" aria-hidden="true">
        <span class="entry-no">${esc(entry._no)}</span>
        <span class="entry-no-sub">/ ${pad2(totalEntries)}</span>
        <span class="entry-folio-rule"></span>
        <span class="entry-folio-roman">${esc(level.numeral)}</span>
      </div>
      <figure class="entry-figure">
        <div class="entry-plate-art">${entryArtSVG(entry)}</div>
        <figcaption><span>${esc(artCaption(entry))}</span><span>Fig. ${esc(entry._no)}</span></figcaption>
      </figure>
      <div class="entry-body">
        <div class="entry-kicker">
          <span>Plate ${esc(entry._no)}</span>
          <span class="entry-kind kind-mark-${esc(entry.kind)}">${esc(kind.label)}</span>
          <span>${esc(family)}</span>
          ${medLabel ? `<span class="entry-badge ${entry.medicinal.used ? "" : "is-unused"}">${esc(medLabel)}</span>` : ""}
        </div>
        <div class="entry-title">
          <div>
            <h3>${esc(entry.name)}</h3>
            <p class="entry-en">${esc(entry.en)}</p>
            <p class="entry-latin">${esc(entry.latin)}</p>
          </div>
        </div>
        ${aliases ? `<p class="entry-aliases">别名 <span>${esc(aliases)}</span></p>` : ""}
        <div class="entry-tox">
          ${dangerStamp(entry)}
          ${dangerMeter(entry.hazard.level)}
          <span class="tox-note">${esc(lethalSummary(entry.hazard.lethal))}</span>
        </div>
        <div class="entry-symptoms">${symptomTags(entry, 4)}</div>
        <dl class="entry-facts">
          ${facts.map((fact) => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join("")}
        </dl>
        <span class="entry-more">翻开档案 <span class="entry-arrow" aria-hidden="true">↗</span></span>
      </div>
    </a>`;
  }

  function renderPagination(total, pages) {
    if (pages <= 1) {
      dom.pagination.hidden = true;
      dom.pagination.innerHTML = "";
      return;
    }
    dom.pagination.hidden = false;
    const from = (state.page - 1) * state.perPage + 1;
    const to = Math.min(state.page * state.perPage, total);
    const pageButtons = Array.from({ length: pages }, (_, index) => {
      const page = index + 1;
      return `<button class="page-button" type="button" data-page="${page}" ${page === state.page ? 'aria-current="page"' : ""} aria-label="第 ${page} 页">${page}</button>`;
    }).join("");

    dom.pagination.innerHTML = `<span class="pagination-info">Page ${state.page} / ${pages} · ${from}–${to} of ${total}</span>
      <div class="pagination-pages">
        <button class="page-button page-arrow" type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="上一页">←</button>
        ${pageButtons}
        <button class="page-button page-arrow" type="button" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""} aria-label="下一页">→</button>
      </div>`;
  }

  function renderCatalogue() {
    const filtered = getFilteredEntries();
    const pages = Math.max(1, Math.ceil(filtered.length / state.perPage));
    if (state.page > pages) state.page = pages;
    if (state.page < 1) state.page = 1;

    const start = (state.page - 1) * state.perPage;
    const shown = filtered.slice(start, start + state.perPage);

    dom.resultCount.textContent = filtered.length;
    dom.totalCount.textContent = totalEntries;
    dom.specimenList.setAttribute("aria-busy", "false");
    dom.specimenList.hidden = filtered.length === 0;
    dom.emptyState.hidden = filtered.length !== 0;
    dom.specimenList.innerHTML = shown.map(renderEntry).join("");
    renderPagination(filtered.length, pages);
    syncFilterControls();
  }

  /* =========================================================
     Drawer + deep links
     ========================================================= */

  function setPageInert(value) {
    [dom.topbar, dom.main, dom.footer].forEach((node) => {
      if (!node) return;
      if (value) node.setAttribute("inert", "");
      else node.removeAttribute("inert");
    });
  }

  function renderDetailGrid(items, extraClass = "") {
    return `<div class="detail-grid ${extraClass}">
      ${items.map((item) => `<div class="${item.wide ? "span-two" : ""}"><dt>${esc(item.label)}</dt><dd>${item.html || esc(item.value)}</dd></div>`).join("")}
    </div>`;
  }

  function renderPaletteStrip(entry) {
    let items = [];
    if (entry.kind === "plant" && entry.palette) {
      items = [
        { label: "花", value: entry.palette.flower },
        { label: "叶", value: entry.palette.leaf },
        { label: "茎", value: entry.palette.stem }
      ];
      if (entry.palette.fruit) items.push({ label: "果", value: entry.palette.fruit });
    } else if (entry.kind === "snake" && entry.art && entry.art.palette) {
      items = [
        { label: "背", value: entry.art.palette.body },
        { label: "纹", value: entry.art.palette.band },
        { label: "腹", value: entry.art.palette.belly }
      ];
    } else if (isFungus(entry) && entry.art && entry.art.palette) {
      items = [
        { label: "盖", value: entry.art.palette.cap },
        { label: "褶", value: entry.art.palette.gills },
        { label: "柄", value: entry.art.palette.stem }
      ];
    } else if ((isMarine(entry) || isArthropod(entry)) && entry.art && entry.art.palette) {
      items = [
        { label: "体", value: entry.art.palette.body },
        { label: "纹", value: entry.art.palette.accent },
        { label: "影", value: entry.art.palette.shadow }
      ];
    } else if (entry.art && entry.art.palette) {
      items = [
        { label: "主", value: entry.art.palette.main },
        { label: "膜", value: entry.art.palette.membrane },
        { label: "染", value: entry.art.palette.accent }
      ];
    }
    if (!items.length) return "";
    return `<div class="palette-strip">
      <span class="mini-label">配色 / Palette</span>
      <div class="palette-items">
        ${items.map((item) => `<span class="palette-item"><i class="palette-chip" aria-hidden="true" style="background:${esc(item.value)}"></i>${esc(item.label)} <code>${esc(item.value)}</code></span>`).join("")}
      </div>
    </div>
    <p class="detail-small" style="margin-top:9px">配色为创作示意，取自页面剪影的色域，不是标准色卡，也不替代实物观察。</p>`;
  }

  function renderComparisonFeature(entry) {
    const mapping = PLANT_COMPARE_MAP[entry.id];
    const target = mapping ? COMPARE_MAP.get(mapping.targetId) : null;
    if (!mapping || !target) return "";
    return `<div class="compare-feature">
      <div class="compare-feature-head">
        <span class="mini-label">Toxic vs edible / common</span>
        <span class="compare-status">${esc(target.status)}</span>
      </div>
      <button class="compare-card" type="button" data-compare-id="${esc(target.id)}" data-compare-from="${esc(entry.id)}" aria-haspopup="dialog" aria-label="打开 ${esc(entry.name)} 与 ${esc(target.name)} 的对照条目">
        <span class="compare-card-line">
          <span class="compare-label is-toxic">有毒 · ${esc(entry.name)}</span>
          <span class="compare-vs">vs</span>
          <span class="compare-label is-common">${esc(target.status)} · ${esc(target.name)}</span>
        </span>
        <span class="compare-card-diff">${esc(mapping.diff)}</span>
        <span class="compare-card-link">打开对照条目 <span aria-hidden="true">↗</span></span>
      </button>
    </div>`;
  }

  function renderLookalikes(entry) {
    const items = entry.lookalikes || [];
    if (!items.length) return "";
    return `<div>${items.map((item) => `<div class="lookalike"><strong>${esc(item.name)}</strong><p>${esc(item.diff)}</p></div>`).join("")}</div>`;
  }

  function renderStorySection(entry) {
    const legendHeading = isPathogen(entry) ? "历史 / History" : "传说与记录 / Legend";
    return `<section class="detail-section" aria-labelledby="detail-story">
      <div class="detail-section-head"><h3 id="detail-story">创作笺</h3><span class="mini-label">Notes for fiction</span></div>
      <div class="story-grid">
        <div class="story-block"><h4>${esc(legendHeading)}</h4><p>${esc(entry.legend)}</p></div>
        <div class="story-block"><h4>创作提示 / Prompt</h4><p>${esc(entry.creative)}</p></div>
        <div class="story-block"><h4>常见误用 / Misuse</h4><p>${esc(entry.misuse)}</p></div>
        <div class="story-block"><h4>冷知识 / Trivia</h4><p>${esc(entry.trivia)}</p></div>
      </div>
    </section>`;
  }

  function renderDataReference(entry) {
    let note = "";
    if (entry.kind === "plant") {
      note = `学名、科属与形态参考 POWO、中国植物志及公开植物学资料。剪影由叶形（${entry.silhouette.leaf}）、花形（${entry.silhouette.flower}）、果形（${entry.silhouette.fruit}）参数程序生成，仅作形态示意。`;
    } else if (entry.kind === "snake") {
      note = "分类与形态参考《中国动物志》、爬行动物数据库与公开毒理综述；蛇形、体纹、头尾比例和花纹数量均为示意，不按比例。毒液与咬伤资料为概括，标「参考」。";
    } else if (isFungus(entry)) {
      note = "真菌分类、毒理与中毒资料参考 CDC、NCBI Bookshelf 与公开真菌学资料；菌盖、菌褶、菌托与斑点均为程序化示意，不按比例，不能用于采食或物种鉴定。";
    } else if (isMarine(entry) || isArthropod(entry)) {
      note = "分类、生态与毒理资料参考 CDC、NCBI Bookshelf、澳大利亚与新西兰公共卫生资料及公开综述；体形、附肢、棘刺与斑纹均为示意，不按比例，不能用于捕捉或现场鉴定。";
    } else if (isPathogen(entry)) {
      note = "病原分类、传播与公共卫生资料参考 WHO、CDC 及公开教材的概括性内容；显微结构图为教学化的 SVG 示意，非照片、非按比例。所有时间线、致死性与症状均需结合具体情境理解。";
    }
    return `<p class="drawer-reference"><strong>资料说明</strong> · ${esc(note)}</p>`;
  }

  function renderDisclaimer(entry) {
    let body = "";
    if (entry.kind === "plant") {
      body = "仅用于创作参考，不构成医疗建议。不要采食、栽培或自行使用任何有毒植物。如有接触或误食，请立即就医或联系当地急救；保留植物样本或清晰照片供专业鉴定。";
    } else if (entry.kind === "snake") {
      body = "仅用于创作参考，不构成急救建议。不要捕捉或徒手处理野生蛇类；如被咬伤，立即联系急救并尽快就医。抗蛇毒血清的使用由医疗机构决定。";
    } else if (isFungus(entry)) {
      body = "仅用于创作参考，不构成采食、鉴定或医疗建议。不要采食野生蘑菇，也不要用“煮熟、虫咬、银针”判断安全。如误食，请立即联系急救或毒物中心并保留样本或照片。";
    } else if (isMarine(entry) || isArthropod(entry)) {
      body = "仅用于创作参考，不构成捕捉、饲养或急救建议。不要徒手接触野生海洋生物或节肢动物；如被蜇伤、刺伤或咬伤，请立即联系急救并尽快就医。";
    } else {
      body = "仅用于创作参考，不构成医疗建议，也不提供培养、分离、扩增、传播、释放或规避检测的方法。如怀疑暴露或感染，请联系当地急救、疾控或正规医疗机构，不要自行用药或隐瞒接触史。";
    }
    return `<div class="drawer-disclaimer"><strong>免责声明</strong> · ${esc(body)}</div>`;
  }

  function renderHazardSection(entry) {
    const info = levelInfo(entry.hazard.level);
    const extra = entry.hazard.mechanism
      ? `<p class="detail-paragraph">${esc(entry.hazard.mechanism)}</p>`
      : "";
    return `<section class="detail-section" aria-labelledby="detail-tox">
      <div class="detail-section-head"><h3 id="detail-tox">危险档案</h3><span class="mini-label">Hazard · 参考</span></div>
      <div class="detail-notice"><strong>注意</strong><span>下列信息仅供创作参考，不是诊断、急救或防护指南。真实表现与进程会因个体、暴露方式、病原株型与救治条件而显著不同。${esc(entry.hazard.note)}</span></div>
      ${renderDetailGrid([
        { label: "危险等级", value: `${info.numeral} / 5 · ${hazardLabel(entry)}` },
        { label: "是否可致死", value: entry.hazard.lethal },
        { label: sourceLabel(entry), value: entry.hazard.source || entry.hazard.parts, wide: true },
        { label: timingLabelLong(entry), value: `${timelineText(entry)}（参考）` },
        { label: "症状标签", value: (entry.hazard.symptoms || []).join(" / ") }
      ])}
      ${extra}
    </section>`;
  }

  function renderPlantDetail(entry) {
    const med = entry.medicinal || {};
    const medStatus = med.used ? "入药记载" : "未入常规药用";
    return `${renderHazardSection(entry)}
      <section class="detail-section" aria-labelledby="detail-med">
        <div class="detail-section-head"><h3 id="detail-med">药用档案</h3><span class="medicinal-status ${med.used ? "is-yes" : "is-no"}">${esc(medStatus)}</span></div>
        ${renderDetailGrid([
          { label: "是否入药", value: med.used ? "是，须专业指导" : "否，无常规药用记录" },
          { label: "药用部位", value: med.parts || "不适用" },
          { label: "用途", value: med.uses || "资料不足", wide: true },
          { label: "禁忌", value: med.contraindications || "资料不足", wide: true }
        ])}
        <p class="detail-notice"><strong>切记</strong><span>药用记载不等于可自行使用。本谱不提供剂量、炮制、煎服或任何制备方法。</span></p>
      </section>
      <section class="detail-section" aria-labelledby="detail-habitat">
        <div class="detail-section-head"><h3 id="detail-habitat">生境与形态</h3><span class="mini-label">Habitat & morphology</span></div>
        ${renderDetailGrid([
          { label: "生境", value: entry.habitat },
          { label: "分布", value: entry.distribution },
          { label: "株高", value: entry.height },
          { label: "花期", value: entry.bloom },
          { label: "叶形", value: entry.morphology.leaf },
          { label: "花形", value: entry.morphology.flower },
          { label: "果形", value: entry.morphology.fruit },
          { label: "花色", value: entry.morphology.flowerColor },
          { label: "叶色", value: entry.morphology.leafColor },
          { label: "茎色", value: entry.morphology.stemColor },
          { label: "气味", value: entry.smell },
          { label: "剪影参数", value: `${entry.silhouette.leaf} / ${entry.silhouette.flower} / ${entry.silhouette.fruit}` }
        ])}
        ${renderPaletteStrip(entry)}
      </section>
      <section class="detail-section" aria-labelledby="detail-safety">
        <div class="detail-section-head"><h3 id="detail-safety">相似植物与安全</h3><span class="mini-label">Lookalikes & safety</span></div>
        <div class="detail-notice"><strong>辨识</strong><span>相似植物仅列形态差异，不可作为野外食用或药用的判断依据。</span></div>
        ${renderComparisonFeature(entry)}
        ${renderLookalikes(entry)}
        ${renderDetailGrid([
          { label: "接触防护", value: entry.protection, wide: true },
          { label: "误食处理", value: entry.firstAid, wide: true }
        ])}
      </section>`;
  }

  function renderSnakeDetail(entry) {
    const profile = getProfileFields(entry);
    const sectionFields = profile.map((item) => ({ label: item.label, value: item.value }));
    if (!sectionFields.some((item) => item.label === "分布")) {
      sectionFields.push({ label: "分布", value: entry.distribution });
    }
    return `${renderHazardSection(entry)}
      <section class="detail-section" aria-labelledby="detail-ecology">
        <div class="detail-section-head"><h3 id="detail-ecology">生态与识别</h3><span class="mini-label">Ecology & identification</span></div>
        ${renderDetailGrid(sectionFields)}
        ${renderPaletteStrip(entry)}
        <p class="detail-small" style="margin-top:9px">长度、体纹与头尾比例均为创作示意；不要用插图作野外鉴定或捕捉依据。</p>
      </section>
      <section class="detail-section" aria-labelledby="detail-safety">
        <div class="detail-section-head"><h3 id="detail-safety">相似蛇类与安全</h3><span class="mini-label">Lookalikes & safety</span></div>
        <div class="detail-notice"><strong>辨识</strong><span>相似蛇类仅列形态差异，不是现场鉴定或捕捉指南；不要接近、触碰或试图移动野生蛇。</span></div>
        ${renderLookalikes(entry)}
        ${renderDetailGrid([
          { label: "避免咬伤", value: entry.protection, wide: true },
          { label: "咬伤处理", value: entry.firstAid, wide: true }
        ])}
      </section>`;
  }

  function renderPathogenDetail(entry) {
    const profile = getProfileFields(entry);
    const fields = profile.map((item) => ({ label: item.label, value: item.value }));
    return `${renderHazardSection(entry)}
      <section class="detail-section" aria-labelledby="detail-pathogen">
        <div class="detail-section-head"><h3 id="detail-pathogen">传播与防治</h3><span class="mini-label">Transmission & public health</span></div>
        ${renderDetailGrid(fields)}
        ${renderPaletteStrip(entry)}
        <p class="detail-small" style="margin-top:9px">病原结构为教学化示意图，非真实显微照片、非按比例；传播与防治信息为公共卫生概述，不构成个人诊疗方案。</p>
      </section>
      <section class="detail-section" aria-labelledby="detail-safety">
        <div class="detail-section-head"><h3 id="detail-safety">鉴别与防护</h3><span class="mini-label">Differential & protection</span></div>
        <div class="detail-notice"><strong>提示</strong><span>这些疾病与中毒在外行视角下可能相似；页面不是自诊工具。出现症状时，专业检测与暴露史比“按图索骥”更重要。</span></div>
        ${renderLookalikes(entry)}
        ${renderDetailGrid([
          { label: "日常防护", value: entry.protection, wide: true },
          { label: "暴露 / 发病", value: entry.firstAid, wide: true }
        ])}
      </section>`;
  }

  function renderCreatureDetail(entry) {
    const profile = getProfileFields(entry);
    const fields = profile.map((item) => ({ label: item.label, value: item.value }));
    if (!fields.some((item) => item.label === "分布")) {
      fields.push({ label: "分布", value: entry.distribution });
    }
    const isFungusEntry = isFungus(entry);
    const ecologyHeading = isFungusEntry ? "生境与形态" : "生态与识别";
    const ecologyLabel = isFungusEntry ? "Habitat & morphology" : "Ecology & identification";
    const safetyHeading = isFungusEntry
      ? "相似菌类与安全"
      : isMarine(entry) ? "相似海洋毒物与安全" : "相似节肢动物与安全";
    const safetyLabel = isFungusEntry
      ? "Lookalikes & safety"
      : isMarine(entry) ? "Lookalikes & safety" : "Lookalikes & safety";
    const safetyNotice = isFungusEntry
      ? "相似菌类仅列形态差异，不可作为采食、鉴定或“处理去毒”的依据。"
      : isMarine(entry)
        ? "相似海洋生物仅列形态差异，不是捕捞、触摸或急救指南；活体与脱落结构都可能危险。"
        : "相似节肢动物仅列形态差异，不是捕捉、饲养或现场鉴定指南；不要徒手接触。";
    const protectionLabel = isFungusEntry ? "避免采食" : "避免接触";
    const exposureLabel = isFungusEntry
      ? "误食处理"
      : isMarine(entry) ? "蜇伤 / 刺伤处理" : "咬伤 / 蜇伤处理";
    const artNote = isFungusEntry
      ? "菌盖、菌褶、菌柄与菌托为程序化示意，不按比例；不能用于野外采食或物种鉴定。"
      : isMarine(entry)
        ? "体形、鳍、棘与触手为程序化示意，不按比例；不能用于捕捞、触摸或现场鉴定。"
        : "体形、附肢与斑纹为程序化示意，不按比例；不能用于捕捉、饲养或现场鉴定。";
    return `${renderHazardSection(entry)}
      <section class="detail-section" aria-labelledby="detail-ecology">
        <div class="detail-section-head"><h3 id="detail-ecology">${ecologyHeading}</h3><span class="mini-label">${ecologyLabel}</span></div>
        ${renderDetailGrid(fields)}
        ${renderPaletteStrip(entry)}
        <p class="detail-small" style="margin-top:9px">${artNote}</p>
      </section>
      <section class="detail-section" aria-labelledby="detail-safety">
        <div class="detail-section-head"><h3 id="detail-safety">${safetyHeading}</h3><span class="mini-label">${safetyLabel}</span></div>
        <div class="detail-notice"><strong>辨识</strong><span>${safetyNotice}</span></div>
        ${renderLookalikes(entry)}
        ${renderDetailGrid([
          { label: protectionLabel, value: entry.protection, wide: true },
          { label: exposureLabel, value: entry.firstAid, wide: true }
        ])}
      </section>`;
  }

  function renderDrawer(entry) {
    const kind = entry._kind;
    const aliases = (entry.aliases || []).join("、");
    const quickFacts = getQuickFacts(entry);
    const categorySpecific = entry.kind === "plant"
      ? renderPlantDetail(entry)
      : entry.kind === "snake"
        ? renderSnakeDetail(entry)
        : isPathogen(entry) ? renderPathogenDetail(entry) : renderCreatureDetail(entry);
    const summary = entry.summary ? `<p class="drawer-summary">${esc(entry.summary)}</p>` : "";

    dom.drawerPlateNo.textContent = `PLATE ${entry._no}`;
    dom.drawerContent.innerHTML = `
      <header class="drawer-hero">
        <div class="drawer-hero-meta">
          <span class="drawer-label">Specimen & archive</span>
          <span>No. ${esc(entry._no)} / ${pad2(totalEntries)}</span>
          <span>ID / ${esc(entry.id)}</span>
        </div>
        <div class="drawer-headline">
          <div>
            <div class="drawer-title-line"><h2 id="drawerTitle" tabindex="-1">${esc(entry.name)}</h2><span class="drawer-kind kind-mark-${esc(entry.kind)}">${esc(kind.label)}</span></div>
            <p class="drawer-en">${esc(entry.en)}</p>
            <p class="drawer-latin">${esc(entry.latin)}</p>
            <p class="drawer-family">${esc(entry.family)} · ${esc(entry.genus)}</p>
            <p class="drawer-aliases"><span>别名</span> ${esc(aliases || "—")}</p>
          </div>
          ${dangerStamp(entry)}
        </div>
        ${summary}
      </header>

      <div class="drawer-sheet">
        <figure class="drawer-figure">
          <div class="drawer-figure-art">${entryArtSVG(entry, { annotated: true })}</div>
          <figcaption><span>${esc(artCaption(entry))} · 非实拍</span><span>SVG study / ${esc(entry._no)}</span></figcaption>
        </figure>
        <div class="drawer-side">
          <div class="drawer-tox-block">
            <p class="mini-label">${isPathogen(entry) ? "病原危险档案 / Pathogen risk" : isSnake(entry) ? "蛇毒档案 / Venom profile" : "危险档案 / Hazard profile"}</p>
            <div class="drawer-tox-line">
              ${dangerMeter(entry.hazard.level, true)}
              <span class="drawer-tox-word">${esc(levelInfo(entry.hazard.level).numeral)} · ${esc(hazardLabel(entry))}</span>
              <span class="drawer-lethal">可致死：${esc(entry.hazard.lethal)}</span>
            </div>
            <p class="drawer-tox-caption">五级刻度 · 资料标「参考」 · ${esc(levelInfo(entry.hazard.level).range)}</p>
            <div class="drawer-symptom-tags">${symptomTags(entry)}</div>
          </div>
          <dl class="drawer-quickfacts">
            ${quickFacts.map((fact) => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}${fact.ref ? '<span class="ref-mark">参考</span>' : ""}</dd></div>`).join("")}
          </dl>
          <div class="drawer-actions">
            <button class="button button-dark" type="button" data-action="print">打印 A5 标本卡</button>
            <button class="button button-outline" type="button" data-action="copy-link">复制深链接</button>
          </div>
        </div>
      </div>

      ${categorySpecific}
      ${renderStorySection(entry)}
      ${renderDataReference(entry)}
      ${renderDisclaimer(entry)}

      <div class="drawer-bottom-actions">
        <button class="button button-dark" type="button" data-action="print">打印 A5 标本卡</button>
        <button class="button button-outline" type="button" data-action="close-drawer">收起标本卡</button>
      </div>
    `;

    renderPrintSheet(entry);
  }

  function renderPrintSheet(entry) {
    if (!entry) return;
    const kind = entry._kind;
    const level = levelInfo(entry.hazard.level);
    const lookalike = (entry.lookalikes || [])[0];
    const info = getQuickFacts(entry);
    let lowerLeft = "";
    let lowerRight = "";
    let typeLine = "";

    if (entry.kind === "plant") {
      lowerLeft = `<section class="print-section print-morph">
        <h4>形态记录 / Morphology</h4>
        <dl>
          <dt>叶</dt><dd>${esc(entry.morphology.leaf)}</dd>
          <dt>花</dt><dd>${esc(entry.morphology.flower)}</dd>
          <dt>果</dt><dd>${esc(entry.morphology.fruit)}</dd>
          <dt>色</dt><dd>花 ${esc(entry.morphology.flowerColor)}；叶 ${esc(entry.morphology.leafColor)}；茎 ${esc(entry.morphology.stemColor)}</dd>
          <dt>气味</dt><dd>${esc(entry.smell)}</dd>
        </dl>
      </section>
      <section class="print-section">
        <h4>生境与分布 / Habitat & range</h4>
        <p>${esc(entry.habitat)}</p><p class="muted">${esc(entry.distribution)}</p>
      </section>`;
      lowerRight = `<section class="print-section"><h4>相似植物 / Lookalikes</h4>${lookalike ? `<p><strong>${esc(lookalike.name)}</strong>：${esc(lookalike.diff)}</p>` : ""}</section>
        <section class="print-section"><h4>接触防护 / Protection</h4><p>${esc(entry.protection)}</p></section>
        <section class="print-section"><h4>误食处理 / Exposure</h4><p>${esc(entry.firstAid)}</p></section>`;
    } else if (entry.kind === "snake") {
      const fields = getProfileFields(entry).slice(0, 5);
      typeLine = "蛇类 · 蛇毒标本卡";
      lowerLeft = `<section class="print-section print-morph">
        <h4>识别与生态 / Identification</h4>
        <dl>${fields.map((field) => `<dt>${esc(field.label)}</dt><dd>${esc(field.value)}</dd>`).join("")}<dt>分布</dt><dd>${esc(entry.distribution)}</dd></dl>
      </section>`;
      lowerRight = `<section class="print-section"><h4>相似蛇类 / Similar species</h4>${lookalike ? `<p><strong>${esc(lookalike.name)}</strong>：${esc(lookalike.diff)}</p>` : ""}</section>
        <section class="print-section"><h4>避免咬伤 / Protection</h4><p>${esc(entry.protection)}</p></section>
        <section class="print-section"><h4>咬伤处理 / Exposed</h4><p>${esc(entry.firstAid)}</p></section>`;
    } else if (!isPathogen(entry)) {
      const fields = getProfileFields(entry).slice(0, 5);
      const isFungusEntry = isFungus(entry);
      typeLine = `${kind.label} · 毒物标本卡`;
      lowerLeft = `<section class="print-section print-morph">
        <h4>${isFungusEntry ? "生境与形态 / Habitat & morphology" : "识别与生态 / Identification"}</h4>
        <dl>${fields.map((field) => `<dt>${esc(field.label)}</dt><dd>${esc(field.value)}</dd>`).join("")}<dt>分布</dt><dd>${esc(entry.distribution)}</dd></dl>
      </section>`;
      lowerRight = `<section class="print-section"><h4>${isFungusEntry ? "相似菌类 / Lookalikes" : "相似毒物 / Lookalikes"}</h4>${lookalike ? `<p><strong>${esc(lookalike.name)}</strong>：${esc(lookalike.diff)}</p>` : ""}</section>
        <section class="print-section"><h4>${isFungusEntry ? "避免采食 / Protection" : "避免接触 / Protection"}</h4><p>${esc(entry.protection)}</p></section>
        <section class="print-section"><h4>${isFungusEntry ? "误食处理 / Exposure" : "蜇伤 / 咬伤处理 / Exposure"}</h4><p>${esc(entry.firstAid)}</p></section>`;
    } else {
      const fields = getProfileFields(entry).slice(0, 4);
      typeLine = "病原 · " + kind.label;
      lowerLeft = `<section class="print-section print-morph">
        <h4>病原与传播 / Pathogen</h4>
        <dl>${fields.map((field) => `<dt>${esc(field.label)}</dt><dd>${esc(field.value)}</dd>`).join("")}</dl>
      </section>`;
      lowerRight = `<section class="print-section"><h4>鉴别 / Differential</h4>${lookalike ? `<p><strong>${esc(lookalike.name)}</strong>：${esc(lookalike.diff)}</p>` : ""}</section>
        <section class="print-section"><h4>日常防护 / Protection</h4><p>${esc(entry.protection)}</p></section>
        <section class="print-section"><h4>暴露 / 发病 / Action</h4><p>${esc(entry.firstAid)}</p></section>`;
    }

    const quickRows = info.map((item) => `<div class="print-quick-row"><span>${esc(item.label)}</span><span>${esc(item.value)}</span></div>`).join("");
    let disclaimer = "仅作创作参考，不构成医疗建议。";
    if (entry.kind === "plant") {
      disclaimer = "仅作创作参考，不构成医疗建议，也不要采食野生植物。毒性数据标「参考」。如有接触或误食，请立即就医并保留样本。";
    } else if (entry.kind === "snake") {
      disclaimer = "仅作创作参考，不构成急救建议。不要捕捉或徒手处理野生蛇类。如被咬伤，请立即联系急救并尽快就医。";
    } else if (isFungus(entry)) {
      disclaimer = "仅作创作参考，不构成采食、鉴定或医疗建议。不要采食野生蘑菇；如误食，请立即联系急救或毒物中心并保留样本。";
    } else if (isMarine(entry) || isArthropod(entry)) {
      disclaimer = "仅作创作参考，不构成捕捉、饲养或急救建议。不要徒手接触野生海洋生物或节肢动物；如受伤，请立即就医。";
    } else if (isPathogen(entry)) {
      disclaimer = "仅作创作参考，不构成医疗建议，也不提供培养、扩增或传播方法。如怀疑暴露，请联系当地疾控或医疗机构。";
    }

    dom.printSheet.innerHTML = `<div class="print-page">
      <div class="print-card">
        <header class="print-head">
          <div class="print-brand">
            <span class="print-brand-seal">毒</span>
            <div><strong>毒物谱</strong><small>Poisons &amp; Pathogens</small></div>
          </div>
          <div class="print-head-meta">
            <strong>A5 · 标本卡</strong><br>
            No. ${esc(entry._no)} / ${pad2(totalEntries)} · ${esc(typeLine)}<br>
            ${esc(artCaption(entry))} · 非实拍
          </div>
        </header>

        <div class="print-main">
          <div class="print-left">
            <figure class="print-art">
              ${entryArtSVG(entry)}
              <figcaption class="print-caption"><span>${esc(artCaption(entry))}</span><span>SVG / ${esc(entry._no)}</span></figcaption>
            </figure>
          </div>
          <div class="print-info">
            <p class="print-kicker">${esc(kind.label)} · ${esc(entry.family)}</p>
            <h2 class="print-name">${esc(entry.name)}</h2>
            <p class="print-en">${esc(entry.en)}</p>
            <p class="print-latin">${esc(entry.latin)}</p>
            <p class="print-family">别名：${esc((entry.aliases || []).join("、"))}</p>
            <div class="print-tox-line">
              ${dangerMeter(entry.hazard.level)}
              <span class="print-tox-word">${esc(level.numeral)} · ${esc(hazardLabel(entry))}</span>
              <span class="print-tox-context">可致死：${esc(entry.hazard.lethal)}</span>
            </div>
            <div class="print-tags">${(entry.hazard.symptoms || []).map((symptom) => `<span class="print-tag">${esc(symptom)}</span>`).join("")}</div>
            <div class="print-quick">${quickRows}</div>
          </div>
        </div>

        <div class="print-lower">
          <div>${lowerLeft}</div>
          <div>${lowerRight}</div>
        </div>

        <footer class="print-footer">
          <p class="print-disclaimer"><strong>免责声明</strong> · ${esc(disclaimer)}</p>
          <p class="print-credit"><img class="print-logo" src="assets/simon-workshop-logo.png" alt=""><span class="print-credit-text">${esc(artCaption(entry))} · 程序绘制<br><span>Simon Workshop™ · 毒物谱</span></span></p>
        </footer>
      </div>
    </div>`;
  }

  let compareTrigger = null;

  function openComparison(targetId, fromId) {
    const target = COMPARE_MAP.get(targetId);
    const source = entryMap.get(fromId);
    const mapping = PLANT_COMPARE_MAP[fromId];
    if (!target || !source) return;
    compareTrigger = document.activeElement;
    dom.compareContent.innerHTML = `
      <div class="compare-dialog-head">
        <div>
          <p class="mini-label">对照种 / ${esc(target.status)}</p>
          <h2 id="compareTitle">${esc(target.name)}</h2>
          <p class="compare-dialog-en">${esc(target.en || "")}</p>
          <p class="compare-dialog-latin">${esc(target.latin || "")}</p>
          <p class="compare-dialog-family">${esc(target.family || "")}</p>
        </div>
        <span class="compare-dialog-seal" aria-hidden="true">对照</span>
      </div>
      <p class="compare-dialog-source">与 <strong>${esc(source.name)}</strong> 对照</p>
      <div class="compare-dialog-diff">
        <span class="mini-label">关键区别 / Difference</span>
        <p>${esc(mapping ? mapping.diff : "")}</p>
      </div>
      <p class="compare-dialog-summary">${esc(target.summary || "")}</p>
      <div class="compare-dialog-note"><strong>注意</strong><span>对照种资料只用于形态区分，不代表可自行采食、药用或加工。可食植物也可能有过敏、加工与个体风险。</span></div>
      <div class="compare-dialog-actions">
        <button class="button button-dark" type="button" data-compare-close>返回标本卡</button>
        <button class="button button-outline" type="button" data-compare-close>关闭对照</button>
      </div>`;
    if (typeof dom.compareDialog.showModal === "function") {
      if (!dom.compareDialog.open) dom.compareDialog.showModal();
    } else {
      dom.compareDialog.setAttribute("open", "");
    }
    window.requestAnimationFrame(() => {
      if (dom.compareClose) dom.compareClose.focus({ preventScroll: true });
    });
  }

  function closeComparison() {
    if (!dom.compareDialog) return;
    if (typeof dom.compareDialog.close === "function") dom.compareDialog.close();
    else dom.compareDialog.removeAttribute("open");
    const target = compareTrigger;
    compareTrigger = null;
    if (target && target.isConnected) window.setTimeout(() => target.focus({ preventScroll: true }), 30);
  }

  function openDrawer(id, options = {}) {
    const entry = entryMap.get(id);
    if (!entry) return;
    const wasOpen = dom.drawer.classList.contains("is-open");
    if (!wasOpen) {
      let focusTarget = null;
      if (!options.initial) {
        const active = document.activeElement;
        if (active && active !== document.body && !dom.drawer.contains(active) && active.isConnected) {
          focusTarget = active;
        }
        if (!focusTarget) {
          focusTarget = Array.from(document.querySelectorAll(".specimen-entry, .triage-row"))
            .find((link) => link.getAttribute("href") === `#${id}`) || null;
        }
      }
      state.lastFocus = options.initial ? document.querySelector(".brand") : (focusTarget || document.querySelector(".brand"));
    }
    state.currentEntry = entry;
    renderDrawer(entry);
    dom.drawerPlateNo.textContent = `PLATE ${entry._no}`;
    dom.drawerScroll.scrollTop = 0;
    dom.drawer.removeAttribute("inert");
    dom.drawer.setAttribute("aria-hidden", "false");
    dom.backdrop.hidden = false;
    requestAnimationFrame(() => {
      dom.drawer.classList.add("is-open");
      dom.backdrop.classList.add("is-open");
    });
    document.body.classList.add("drawer-open");
    setPageInert(true);
    document.title = `${entry.name} · 毒物谱`;
    window.setTimeout(() => {
      const title = $("#drawerTitle", dom.drawerContent);
      if (title) title.focus({ preventScroll: true });
    }, wasOpen ? 0 : 80);
  }

  function clearHashFor(id) {
    if (location.hash !== `#${id}`) return;
    try {
      window.history.replaceState(null, "", location.pathname + location.search);
    } catch (error) {
      location.hash = "";
    }
  }

  function closeDrawer(options = {}) {
    if (!dom.drawer.classList.contains("is-open")) return;
    const currentId = state.currentEntry ? state.currentEntry.id : "";
    dom.drawer.classList.remove("is-open");
    dom.backdrop.classList.remove("is-open");
    dom.drawer.setAttribute("aria-hidden", "true");
    dom.drawer.setAttribute("inert", "");
    document.body.classList.remove("drawer-open");
    setPageInert(false);
    document.title = "毒物谱 · 原创角色毒物、蜇伤与感染速查";
    window.setTimeout(() => { dom.backdrop.hidden = true; }, 320);
    state.currentEntry = null;
    if (!options.fromHash && currentId) clearHashFor(currentId);

    const focusTarget = state.lastFocus;
    state.lastFocus = null;
    window.setTimeout(() => {
      if (focusTarget && document.contains(focusTarget) && !focusTarget.hasAttribute("inert")) {
        focusTarget.focus({ preventScroll: true });
      } else {
        const brand = document.querySelector(".brand");
        if (brand) brand.focus({ preventScroll: true });
      }
    }, 30);
  }

  function readPlantId() {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch (error) {
      return raw;
    }
  }

  function openFromUI(id) {
    if (location.hash === `#${id}`) {
      openDrawer(id);
    } else {
      location.hash = id;
    }
  }

  function pickRandomEntry() {
    const filtered = getFilteredEntries();
    const pool = filtered.length ? filtered : catalog;
    const currentId = state.currentEntry ? state.currentEntry.id : null;
    const candidates = pool.length > 1 ? pool.filter((entry) => entry.id !== currentId) : pool;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) openFromUI(pick.id);
  }

  function trapDrawerFocus(event) {
    if (event.key !== "Tab") return;
    const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', dom.drawer)
      .filter((element) => !element.disabled && element.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function showToast(message) {
    window.clearTimeout(showToast.timer);
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    showToast.timer = window.setTimeout(() => {
      dom.toast.classList.remove("is-visible");
    }, 2400);
  }

  function copyDeepLink() {
    if (!state.currentEntry) return;
    const url = new URL(location.href);
    url.hash = state.currentEntry.id;
    const value = url.href;
    const done = () => showToast("深链接已复制");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done));
    } else {
      fallbackCopy(value, done);
    }
  }

  function fallbackCopy(value, done) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      if (document.execCommand("copy")) done();
      else showToast(`链接：${value}`);
    } catch (error) {
      showToast(`链接：${value}`);
    }
    textarea.remove();
  }

  function printCurrent() {
    if (!state.currentEntry) return;
    renderPrintSheet(state.currentEntry);
    window.print();
  }

  function setSearchQuery(value) {
    state.query = value;
    dom.searchInput.value = value;
    state.page = 1;
    syncFilterControls();
    renderCatalogue();
  }

  function clearAll() {
    state.kind = "all";
    state.query = "";
    state.symptom = null;
    state.hazardGroups.clear();
    state.routes.clear();
    state.habitats.clear();
    state.colors.clear();
    state.medicinal = null;
    state.page = 1;
    dom.searchInput.value = "";
    syncSymptomButtons();
    renderSymptomOutput();
    syncFilterControls();
    renderCatalogue();
  }

  function closeMobileFilters() {
    if (!dom.filtersPanel.classList.contains("is-open")) return;
    dom.filtersPanel.classList.remove("is-open");
    dom.filterToggle.setAttribute("aria-expanded", "false");
    if (dom.filterClose) dom.filterClose.focus({ preventScroll: true });
  }

  function scrollToResults() {
    const toolbar = $(".results-toolbar");
    if (!toolbar) return;
    const top = toolbar.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  }

  /* =========================================================
     Events + init
     ========================================================= */

  function bindEvents() {
    dom.searchInput.addEventListener("input", () => {
      window.clearTimeout(bindEvents.searchTimer);
      bindEvents.searchTimer = window.setTimeout(() => {
        state.query = dom.searchInput.value.trim();
        state.page = 1;
        syncFilterControls();
        renderCatalogue();
      }, 70);
    });

    dom.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dom.searchInput.value) {
        event.preventDefault();
        setSearchQuery("");
        dom.searchInput.focus({ preventScroll: true });
      }
    });

    dom.searchClear.addEventListener("click", () => {
      setSearchQuery("");
      dom.searchInput.focus({ preventScroll: true });
    });

    dom.searchHints.addEventListener("click", (event) => {
      const button = event.target.closest("[data-query]");
      if (!button) return;
      setSearchQuery(button.dataset.query);
      dom.searchInput.focus({ preventScroll: true });
    });

    if (dom.kindTabs) {
      dom.kindTabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-kind]");
        if (!button) return;
        state.kind = button.dataset.kind || "all";
        state.page = 1;
        renderCatalogue();
      });
    }

    if (dom.symptomBoard) {
      dom.symptomBoard.addEventListener("click", (event) => {
        const button = event.target.closest("[data-symptom]");
        if (!button) return;
        state.symptom = state.symptom === button.dataset.symptom ? null : button.dataset.symptom;
        state.page = 1;
        syncSymptomButtons();
        renderSymptomOutput();
        renderCatalogue();
        if (state.symptom && window.innerWidth < 760) {
          window.setTimeout(() => {
            const outputTop = dom.symptomOutput.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: Math.max(0, outputTop - 82),
              behavior: prefersReducedMotion.matches ? "auto" : "smooth"
            });
          }, 50);
        }
      });
    }

    dom.symptomOutput.addEventListener("click", (event) => {
      const clearButton = event.target.closest("[data-clear-symptom]");
      if (!clearButton) return;
      state.symptom = null;
      state.page = 1;
      syncSymptomButtons();
      renderSymptomOutput();
      renderCatalogue();
    });

    dom.filtersPanel.addEventListener("click", (event) => {
      const target = event.target.closest("[data-hazard], [data-route], [data-habitat], [data-color], [data-medicinal]");
      if (!target) return;

      if (target.dataset.hazard) {
        const value = target.dataset.hazard;
        if (state.hazardGroups.has(value)) state.hazardGroups.delete(value);
        else state.hazardGroups.add(value);
      } else if (target.dataset.route) {
        const value = target.dataset.route;
        if (state.routes.has(value)) state.routes.delete(value);
        else state.routes.add(value);
      } else if (target.dataset.habitat) {
        const value = target.dataset.habitat;
        if (state.habitats.has(value)) state.habitats.delete(value);
        else state.habitats.add(value);
      } else if (target.dataset.color) {
        const value = target.dataset.color;
        if (state.colors.has(value)) state.colors.delete(value);
        else state.colors.add(value);
      } else if (target.dataset.medicinal) {
        const selected = target.dataset.medicinal === "yes";
        state.medicinal = state.medicinal === selected ? null : selected;
      }

      state.page = 1;
      syncFilterControls();
      renderCatalogue();
    });

    dom.clearFilters.addEventListener("click", clearAll);
    dom.emptyReset.addEventListener("click", clearAll);

    dom.activeFilters.addEventListener("click", (event) => {
      if (event.target.closest("[data-clear-all]")) {
        clearAll();
        return;
      }
      const remove = event.target.closest("[data-remove-filter]");
      if (!remove) return;
      const type = remove.dataset.removeFilter;
      const value = remove.dataset.value;
      if (type === "symptom") state.symptom = null;
      else if (type === "kind") state.kind = "all";
      else if (type === "hazard") state.hazardGroups.delete(value);
      else if (type === "route") state.routes.delete(value);
      else if (type === "habitat") state.habitats.delete(value);
      else if (type === "color") state.colors.delete(value);
      else if (type === "medicinal") state.medicinal = null;
      else if (type === "query") {
        state.query = "";
        dom.searchInput.value = "";
      }
      state.page = 1;
      if (type === "symptom") renderSymptomOutput();
      syncFilterControls();
      renderCatalogue();
    });

    dom.pagination.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page]");
      if (!button || button.disabled) return;
      const page = Number(button.dataset.page);
      if (!Number.isFinite(page) || page < 1) return;
      state.page = page;
      renderCatalogue();
      scrollToResults();
      const current = $('.page-button[aria-current="page"]', dom.pagination);
      if (current) current.focus({ preventScroll: true });
    });

    dom.filterToggle.addEventListener("click", () => {
      const open = !dom.filtersPanel.classList.contains("is-open");
      dom.filtersPanel.classList.toggle("is-open", open);
      dom.filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        window.requestAnimationFrame(() => {
          dom.filtersPanel.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
          if (dom.filterClose) dom.filterClose.focus({ preventScroll: true });
        });
      }
    });

    if (dom.filterClose) {
      dom.filterClose.addEventListener("click", () => {
        closeMobileFilters();
        dom.filterToggle.focus({ preventScroll: true });
      });
    }

    dom.randomButton.addEventListener("click", pickRandomEntry);
    dom.heroRandom.addEventListener("click", pickRandomEntry);

    dom.drawerClose.addEventListener("click", () => closeDrawer());
    if (dom.compareClose) dom.compareClose.addEventListener("click", closeComparison);
    if (dom.compareDialog) {
      dom.compareDialog.addEventListener("click", (event) => {
        if (event.target === dom.compareDialog || event.target.closest("[data-compare-close]")) closeComparison();
      });
      dom.compareDialog.addEventListener("close", () => {
        if (compareTrigger && compareTrigger.isConnected) {
          const target = compareTrigger;
          compareTrigger = null;
          window.setTimeout(() => target.focus({ preventScroll: true }), 20);
        }
      });
    }
    if (dom.drawerContent) {
      dom.drawerContent.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-compare-id]");
        if (!trigger) return;
        openComparison(trigger.dataset.compareId, trigger.dataset.compareFrom);
      });
    }
    dom.printButton.addEventListener("click", printCurrent);
    dom.backdrop.addEventListener("click", () => closeDrawer());

    dom.drawer.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]");
      if (!action) return;
      if (action.dataset.action === "print") printCurrent();
      else if (action.dataset.action === "copy-link") copyDeepLink();
      else if (action.dataset.action === "close-drawer") closeDrawer();
    });

    dom.drawer.addEventListener("keydown", trapDrawerFocus);

    window.addEventListener("hashchange", () => {
      const id = readPlantId();
      if (id && entryMap.has(id)) {
        openDrawer(id);
      } else if (dom.drawer.classList.contains("is-open")) {
        closeDrawer({ fromHash: true });
      }
    });

    window.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      );

      if (event.key === "Escape") {
        if (dom.compareDialog && dom.compareDialog.open) return;
        if (dom.drawer.classList.contains("is-open")) {
          event.preventDefault();
          closeDrawer();
          return;
        }
        if (dom.filtersPanel.classList.contains("is-open")) {
          closeMobileFilters();
          dom.filterToggle.focus({ preventScroll: true });
          return;
        }
        if (state.query || document.activeElement === dom.searchInput) {
          event.preventDefault();
          setSearchQuery("");
          dom.searchInput.blur();
          return;
        }
      }

      if (event.key === "/" && !isTyping && !dom.drawer.classList.contains("is-open") && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        dom.searchInput.focus({ preventScroll: true });
        const searchBlock = $(".search-block");
        if (searchBlock) {
          const top = searchBlock.getBoundingClientRect().top + window.scrollY - 96;
          window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
        }
      }
    });

    window.addEventListener("pagehide", () => {
      clearTimeout(bindEvents.searchTimer);
    });
  }

  function init() {
    cacheDom();
    if (!dom.specimenList) return;
    dom.drawer.setAttribute("inert", "");
    dom.filtersPanel.setAttribute("tabindex", "-1");
    renderHero();
    renderKindTabs();
    renderSymptomGrid();
    renderDangerScale();
    renderFilterControls();
    syncFilterControls();
    renderSymptomOutput();
    renderCatalogue();
    bindEvents();

    const initialId = readPlantId();
    if (initialId && entryMap.has(initialId)) {
      window.setTimeout(() => openDrawer(initialId, { initial: true }), 40);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
