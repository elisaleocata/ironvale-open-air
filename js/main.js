"use strict";

/* ---------- Data: one source of truth for the line up and the timetable ---------- */

const DAYS = ["thursday", "friday", "saturday", "sunday"];
const STAGES = ["main stage", "the cavern"];

// name | genre | day | stage | start time | "h" for headliners
const LINEUP = `
ashen cathedral|doom metal|thursday|main stage|22:30|h
vantablack saints|post-metal|thursday|main stage|20:30
rust prophets|stoner rock|thursday|main stage|18:30
cold furnace|industrial metal|thursday|the cavern|21:00
ghoul parade|horror punk|thursday|the cavern|19:00
hammerhead choir|heavy metal|friday|main stage|22:30|h
sable rivers|alternative rock|friday|main stage|20:30
burning lanterns|hard rock|friday|main stage|18:30
throne of static|black metal|friday|the cavern|21:00
velvet gallows|gothic rock|friday|the cavern|19:00
steel ravens|thrash metal|saturday|main stage|22:30|h
dust serpents|grunge|saturday|main stage|20:30
nine mile thunder|southern rock|saturday|main stage|18:30
black orchid riot|punk|saturday|the cavern|21:00
the marrow kings|blues rock|saturday|the cavern|19:00
leviathan rising|progressive metal|sunday|main stage|22:30|h
pale horizon burns|metalcore|sunday|main stage|20:30
wrecking parade|hardcore|sunday|main stage|18:30
obsidian choir|symphonic metal|sunday|the cavern|21:00
echo chamber zero|noise rock|sunday|the cavern|19:00`
  .trim()
  .split("\n")
  .map((row) => {
    const [name, genre, day, stage, time, top] = row.split("|");
    return { name, genre, day, stage, time, headliner: top === "h" };
  });

// Real concert photos from Unsplash (free licence), chosen to match each band's style.
// name: [Unsplash image id, photo page id, photographer]
const PHOTOS = {
  "ashen cathedral": ["photo-1501962679900-bea61483313b", "nEX8iFBPPko", "Greyson Joralemon"],
  "vantablack saints": ["photo-1604514288114-3851479df2f2", "eiY4KJ62P5Q", "Tim Toomey"],
  "rust prophets": ["photo-1760092190035-c29f5b9d5531", "EiO7_aLaMX4", "Vitalii Onyshchuk"],
  "cold furnace": ["photo-1598214015728-bc73871186d8", "0gaYQpOMNpc", "Sam Moghadam"],
  "ghoul parade": ["photo-1629276301687-be2af9fd6ba8", "lds8U6yTP9w", "Diane Picchiottino"],
  "hammerhead choir": ["photo-1499364615650-ec38552f4f34", "sqJ4tLBiurw", "Matthew Kalapuch"],
  "sable rivers": ["photo-1499424017184-418f6808abf9", "MD3rdOB5pxk", "bobby hendry"],
  "burning lanterns": ["photo-1524368535928-5b5e00ddc76b", "m1WZS5ye404", "Vishnu R Nair"],
  "throne of static": ["photo-1515890326200-a07ce46010a1", "KazZtMYsPGs", "Diego Ornelas-Tapia"],
  "velvet gallows": ["photo-1629276301820-0f3eedc29fd0", "6F5ct471oRk", "Diane Picchiottino"],
  "steel ravens": ["photo-1672230648752-7b23ac296052", "LKv19Pdbz2I", "Evgeniy Smersh"],
  "dust serpents": ["photo-1498038432885-c6f3f1b912ee", "iIWDt0fXa84", "Hector Bermudez"],
  "nine mile thunder": ["photo-1503528108408-87b0d1c2b785", "YaYcCW1nlqc", "Quilia"],
  "black orchid riot": ["photo-1506091403742-e3aa39518db5", "2rxgWHby5mo", "Luuk Wouters"],
  "the marrow kings": ["photo-1504960868016-9a59a5172321", "jmmTlAPtNw8", "Daniel Wirtz"],
  "leviathan rising": ["photo-1609800029525-b91fdea39774", "eXb2qYOcnys", "Hugo L. Casanova"],
  "pale horizon burns": ["photo-1565035010268-a3816f98589a", "So6YckShOVA", "Tijs van Leur"],
  "wrecking parade": ["photo-1603190287605-e6ade32fa852", "Qnlp3FCO2vc", "Tijs van Leur"],
  "obsidian choir": ["photo-1542813813-1f873f401e9b", "DWHSc8o8K9Y", "Glenn van de Wiel"],
  "echo chamber zero": ["photo-1549223565-49541e8416dc", "2_Cd38NYXwE", "Madhu Balakrishna"],
};
const HERO_PHOTO = ["photo-1546708770-589dab7b22c7", "uCZVEo8iT9Q", "Sebastian Ervi"];

const unsplash = (id, width) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;

const TICKETS = [
  { name: "4-day pass", price: "195 €", notes: ["Thursday to Sunday, all stages", "Free e-train ticket for public transport in Belgium", "Camping not included"] },
  { name: "day ticket", price: "89 €", notes: ["Valid for one day of your choice", "Free e-train ticket for public transport in Belgium"] },
  { name: "camping", price: "35 €", notes: ["Wednesday 2 pm to Monday noon", "Showers and charging points on site"] },
  { name: "drink tokens", price: "2.50 € / token", notes: ["Sold in sets of 20, 40 or 60", "Cashless payment on the festival site"] },
];

/* ---------- Helpers ---------- */

const $ = (selector) => document.querySelector(selector);
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

/* Fallback artwork, used only if a photo cannot load (offline): the same name always gives the same picture. */
function hash(text) {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

function random(seed) { // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function artwork(name) {
  const rand = random(hash(name));
  const hue = 6 + Math.floor(rand() * 30);
  const peaks = Array.from({ length: 8 }, (_, i) => `${i * 90},${Math.floor(240 + rand() * 120)}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 60% 8%)"/><stop offset="1" stop-color="hsl(${hue + 8} 85% 40%)"/>
    </linearGradient></defs>
    <rect width="600" height="450" fill="url(#g)"/>
    <circle cx="${Math.floor(150 + rand() * 300)}" cy="${Math.floor(150 + rand() * 60)}" r="${Math.floor(70 + rand() * 50)}" fill="hsl(${hue + 14} 100% 62%)" opacity=".85"/>
    <polygon points="0,450 ${peaks.join(" ")} 600,450" fill="#0e0d0c"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function photo(artist) {
  const entry = PHOTOS[artist.name];
  const width = artist.headliner ? 1200 : 640;
  const img = el("img", { alt: "", loading: "lazy", decoding: "async", width: 600, height: 450 });
  if (!entry) { img.src = artwork(artist.name); return img; }
  img.src = unsplash(entry[0], width);
  img.srcset = `${unsplash(entry[0], width)} 1x, ${unsplash(entry[0], width * 2)} 2x`;
  img.addEventListener("error", () => { img.removeAttribute("srcset"); img.src = artwork(artist.name); }, { once: true });
  return img;
}

/* ---------- Line up: cards, filtered by day ---------- */

const cards = [...LINEUP].sort((a, b) => b.headliner - a.headliner).map((artist) => {
  const card = el("li", { className: artist.headliner ? "card top" : "card" },
    el("article", {},
      photo(artist),
      el("div", { className: "info" },
        el("h3", { textContent: artist.name }),
        el("p", { className: "genre", textContent: artist.genre }),
        el("p", { className: "when", textContent: `${artist.day} · ${artist.time} · ${artist.stage}` }))));
  $("#lineup-list").append(card);
  return { card, day: artist.day };
});

function filterLineup(day) {
  for (const item of cards) item.card.hidden = day !== "all" && item.day !== day;
  for (const button of $("#day-filters").children) {
    button.setAttribute("aria-pressed", String(button.dataset.day === day));
  }
}

for (const day of ["all", ...DAYS]) {
  const button = el("button", { type: "button", className: "chip", textContent: day });
  button.dataset.day = day;
  button.addEventListener("click", () => filterLineup(day));
  $("#day-filters").append(button);
}
filterLineup("all");

/* ---------- Timetable: built from the same data, with accessible tabs ---------- */

function showDay(day) {
  $("#stages").replaceChildren(...STAGES.map((stage) => {
    const shows = LINEUP.filter((a) => a.day === day && a.stage === stage).sort((a, b) => a.time.localeCompare(b.time));
    return el("section", {},
      el("h3", { textContent: stage }),
      el("ol", {}, ...shows.map((a) => el("li", {}, el("time", { textContent: a.time }), a.name))));
  }));
  for (const tab of $("#day-tabs").children) {
    const selected = tab.dataset.day === day;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
}

for (const day of DAYS) {
  const tab = el("button", { type: "button", className: "chip", textContent: day });
  tab.setAttribute("role", "tab");
  tab.dataset.day = day;
  tab.addEventListener("click", () => showDay(day));
  tab.addEventListener("keydown", (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = DAYS[(DAYS.indexOf(day) + step + DAYS.length) % DAYS.length];
    showDay(next);
    $(`#day-tabs [data-day="${next}"]`).focus();
  });
  $("#day-tabs").append(tab);
}
showDay(DAYS[0]);

/* ---------- Tickets and demo payment dialog ---------- */

const dialog = $("#pay");

for (const ticket of TICKETS) {
  const buy = el("button", { type: "button", className: "buy", textContent: "Buy" });
  buy.addEventListener("click", () => {
    $("#pay-item").textContent = `${ticket.name} – ${ticket.price}`;
    $("#pay-status").textContent = "";
    dialog.showModal();
  });
  $("#ticket-list").append(
    el("li", {}, el("article", {},
      el("h3", { textContent: ticket.name }),
      el("p", { className: "price", textContent: ticket.price }),
      el("ul", {}, ...ticket.notes.map((note) => el("li", { textContent: note }))),
      buy)));
}

$("#pay-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }); // click on the backdrop
$("#pay-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#pay-status").textContent = "Thanks! This is a demo, so no payment was made.";
  event.target.reset();
});

/* ---------- Photo credits (Unsplash licence) ---------- */

const credit = (label, [, page, author]) => el("li", {}, `${label}: `,
  el("a", { href: `https://unsplash.com/photos/${page}`, textContent: author, rel: "noopener" }));
$("#credits").append(
  credit("Main image", HERO_PHOTO),
  ...LINEUP.filter((a) => PHOTOS[a.name]).map((a) => credit(a.name, PHOTOS[a.name])));
