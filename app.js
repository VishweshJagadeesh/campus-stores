(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);

  // ---------------------------------------------------------------------------
  // Sample records
  // ---------------------------------------------------------------------------

  // Desk time is counted in hours from Friday midnight so that due times can be
  // compared with the shift clock (e.g. Sat 9 am = 24 + 9 = 33).
  const dueTimes = [
    ["Fri 8 pm", 20],
    ["Sat 9 am", 33],
    ["Sat 10 am", 34],
    ["Sat noon", 36],
    ["Sat 6 pm", 42],
    ["Mon 10 am", 82],
  ];
  const dueAt = (label) => (dueTimes.find(([l]) => l === label) || [])[1];

  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
      authorised: [
        ["Isha Rao", "Filed the request"],
        ["Kabir Sen", "Named by Isha Rao in the desk book · Fri 3:20 pm"],
      ],
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
      authorised: [["Tara Shah", "Filed the request"]],
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
      authorised: [["Dev Menon", "Filed the request"]],
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    { id: "PR-06", type: "HDMI projector", model: "Epson EB-X49", bin: "A2" },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      at: 15.75,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      at: 19.5,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      at: 33,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  // Messages that clubs leave in the desk book during the story.
  const messages = [
    {
      at: 15.33,
      time: "Friday · 3:20 pm",
      author: "Isha Rao · Film Society",
      text: "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
    },
    {
      at: 15.5,
      time: "Friday · 3:30 pm",
      author: "Tara Shah · Debate Union",
      text: "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
    },
    {
      at: 19.5,
      phase: 1,
      time: "Friday · 7:30 pm",
      author: "Kabir Sen · Film Society",
      text: "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
    },
  ];
  const pages = [
    ["Today", "clock"],
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];

  const original = () => ({
    version: 2,
    tab: "Today",
    phase: 0,
    selected: "",
    filter: "All items",
    onlyOpen: true,
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        holder: "Tara Shah",
        due: "Sat 10 am",
        issuedAt: "Friday · 1:30 pm",
        back: false,
        history: [],
      },
    ],
    repair: ["PR-06"],
    log: [],
    notice: "Sample shift · All records are fictional.",
    undo: null,
  });
  let s = original();

  // ---------------------------------------------------------------------------
  // Lookups
  // ---------------------------------------------------------------------------

  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const now = () => shifts[s.phase];
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const inRepair = (id) => s.repair.includes(id);
  const onShelf = (a) => !inRepair(a.id) && !out(a.id);
  const unitsOf = (type) => assets.filter((a) => a.type === type);
  const loansFor = (reqId) => s.loans.filter((l) => l.req === reqId);
  const openLoans = () =>
    s.loans
      .filter((l) => !l.back)
      .sort((a, b) => dueAt(a.due) - dueAt(b.due) || a.num - b.num);
  // The most recent slip for one approved item on a request, if any.
  const slipFor = (reqId, type) =>
    loansFor(reqId)
      .filter((l) => getAsset(l.asset).type === type)
      .pop();
  const pendingTypes = (r) => r.items.filter((t) => !slipFor(r.id, t));

  function dueState(l) {
    if (l.back) return ["Returned", "good"];
    const left = dueAt(l.due) - now().at;
    if (left < 0) return ["Overdue", "warn"];
    if (left === 0) return ["Due now", "warn"];
    if (left <= 1) return ["Due within the hour", "soon"];
    return ["Due " + l.due, ""];
  }

  function requestState(r) {
    const slips = r.items.map((t) => slipFor(r.id, t));
    const issued = slips.filter(Boolean);
    const outNow = issued.filter((l) => !l.back);
    if (!issued.length) return ["Ready for pickup", ""];
    if (issued.length < r.items.length)
      return [issued.length + " of " + r.items.length + " issued", "soon"];
    if (!outNow.length) return ["All returned", "good"];
    if (outNow.length === r.items.length) return ["Out", ""];
    const holders = [...new Set(outNow.map((l) => l.holder))].join(", ");
    return [
      outNow.length +
        " of " +
        r.items.length +
        " still out · with " +
        holders,
      "soon",
    ];
  }

  // ---------------------------------------------------------------------------
  // HTML helpers
  // ---------------------------------------------------------------------------

  const esc = (x) =>
    String(x).replace(
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
  const opts = (list, selected = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === selected ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    esc(title) +
    "</h2><small>" +
    esc(sub) +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right, extra = "") =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small>" +
    extra +
    "</div><div class=\"rowend\">" +
    right +
    "</div></div>";
  const badge = (t, kind = "") =>
    '<span class="tag' + (kind ? " " + kind : "") + '">' + esc(t) + "</span>";
  const unitName = (a) => a.id + " · " + a.model;
  const historyLine = (l) =>
    l.history.length
      ? '<small class="history">' +
        l.history.map((h) => esc(h.time + " · " + h.text)).join("<br>") +
        "</small>"
      : "";
  const sub = (title) => '<h3 class="subhead">' + esc(title) + "</h3>";
  const dueSelect = (name, selected) =>
    '<select name="' +
    esc(name) +
    '">' +
    opts(
      dueTimes.map(([d]) => [d, d]),
      selected,
    ) +
    "</select>";

  // A loan row that is the same wherever an outstanding slip is shown.
  function loanRow(l, withOpen = true) {
    const a = getAsset(l.asset);
    const r = getReq(l.req);
    const [state, kind] = dueState(l);
    const who =
      l.holder === l.who
        ? "With " + l.holder
        : "With " + l.holder + " (collected by " + l.who + ")";
    return row(
      a.type + " · " + a.id,
      a.model +
        " · L-" +
        l.num +
        " · " +
        r.club +
        " · " +
        (l.back ? "Returned " + l.returnedAt : who + " · due " + l.due),
      badge(state, kind) + (withOpen ? btn("Open kit", "open", r.id) : ""),
      historyLine(l),
    );
  }

  // ---------------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------------

  function today() {
    const t = now();
    let html = head("Shift overview", t.time + " · what needs you at the counter");
    const loans = openLoans();
    html += sub("Expected back");
    html += loans.length
      ? loans.map((l) => loanRow(l)).join("")
      : '<p class="empty">Nothing is out on loan.</p>';

    const waiting = requests.filter((r) => pendingTypes(r).length);
    html += sub("Waiting for pickup");
    html += waiting.length
      ? waiting
          .map((r) =>
            row(
              r.event,
              r.club +
                " · " +
                pendingTypes(r).length +
                " approved item" +
                (pendingTypes(r).length > 1 ? "s" : "") +
                " · return by " +
                r.due,
              btn("Open kit", "open", r.id, "primary"),
            ),
          )
          .join("")
      : '<p class="empty">Every approved request has been issued.</p>';

    const notes = deskEntries().filter((e) => e.handover);
    if (notes.length) {
      html += sub("Handover from earlier shifts");
      html += notes
        .slice(-3)
        .reverse()
        .map(
          (e) =>
            '<article class="record compact"><small>' +
            esc(e.time + " · " + e.author) +
            "</small><p>" +
            esc(e.text) +
            "</p></article>",
        )
        .join("");
    }
    return html;
  }

  function requestPage() {
    if (s.selected) return kitPage(getReq(s.selected));
    return (
      head("Approved requests", "Student Activities Office · 3 approved forms") +
      requests
        .map((r) => {
          const [state, kind] = requestState(r);
          return row(
            r.event,
            r.id + " · " + r.club + " · return by " + r.due,
            badge(state, kind) + btn("Open kit", "open", r.id),
          );
        })
        .join("")
    );
  }

  function kitPage(r) {
    const [state, kind] = requestState(r);
    let html =
      btn("Back to requests", "close") +
      '<div class="record"><small>' +
      esc(r.id) +
      " · Approved</small><h3>" +
      esc(r.event) +
      "</h3><p>" +
      esc(r.club) +
      " · Filed by " +
      esc(r.owner) +
      " · <b>Return by</b> " +
      esc(r.due) +
      "</p><p>" +
      esc(r.note) +
      "</p><p>" +
      badge(state, kind) +
      "</p></div>";

    html += sub("Kit");
    for (const type of r.items) {
      const l = slipFor(r.id, type);
      if (l) html += loanRow(l, false);
      else
        html += row(
          type,
          "Not issued · " +
            unitsOf(type).filter(onShelf).length +
            " on the shelf",
          badge("To issue"),
        );
    }

    const pending = pendingTypes(r);
    if (pending.length) html += issueForm(r, pending);
    const outNow = loansFor(r.id).filter((l) => !l.back);
    if (outNow.length) html += checkInForm(r, outNow);
    return html;
  }

  // One form issues the whole kit: collector and due time are entered once,
  // and each item already has the first unit on the shelf picked.
  function issueForm(r, pending) {
    const single = r.authorised.length === 1;
    const collectors = r.authorised
      .map(
        ([name, why]) =>
          '<label class="choice"><input type="radio" name="who" value="' +
          esc(name) +
          '"' +
          (single ? " checked" : "") +
          " required> <span><b>" +
          esc(name) +
          "</b><small>" +
          esc(why) +
          "</small></span></label>",
      )
      .join("");
    const items = pending
      .map((type, i) => {
        const free = unitsOf(type).filter(onShelf);
        if (!free.length)
          return (
            '<div class="itemline"><span><b>' +
            esc(type) +
            "</b><small>None on the shelf. Issue the rest now and this item later.</small></span></div>"
          );
        return (
          '<div class="itemline"><label class="choice"><input type="checkbox" name="take-' +
          i +
          '" value="' +
          esc(type) +
          '" checked> <b>' +
          esc(type) +
          "</b></label><label><span>Unit</span><select name=\"unit-" +
          i +
          '">' +
          opts(free.map((a) => [a.id, unitName(a) + " · shelf " + a.bin])) +
          "</select></label></div>"
        );
      })
      .join("");
    return (
      '<form data-issue data-req="' +
      esc(r.id) +
      '" class="panel">' +
      sub("Issue the kit") +
      '<fieldset><legend>Collected by</legend><div class="choices">' +
      collectors +
      "</div><small>Only people the club has authorised can collect. Clubs add people through the desk book.</small></fieldset>" +
      '<fieldset><legend>Items leaving the desk</legend>' +
      items +
      "</fieldset>" +
      '<div class="form"><label><span>Return by</span>' +
      dueSelect("due", r.due) +
      "</label></div>" +
      '<button type="submit" class="primary">Issue selected items</button></form>'
    );
  }

  // One form takes back whatever came back, checks the label on each unit and
  // records who holds anything that is still out.
  function checkInForm(r, outNow) {
    const rows = outNow
      .map((l) => {
        const a = getAsset(l.asset);
        return (
          '<fieldset class="checkin"><legend><b>' +
          esc(a.type) +
          "</b> · slip L-" +
          l.num +
          " is for <b>" +
          esc(unitName(a)) +
          "</b> · shelf " +
          esc(a.bin) +
          '</legend><div class="form three"><label><span>Label on the unit at the counter</span><select name="label-' +
          l.num +
          '"><option value="">Not back yet</option>' +
          // Every unit of the type is listed, so the choice only matches the
          // slip if someone reads the label. Units in repair stay in the list
          // (one turning up at the counter is worth knowing) but are marked.
          opts(
            unitsOf(a.type).map((u) => [
              u.id,
              unitName(u) + (inRepair(u.id) ? " · recorded in repair" : ""),
            ]),
          ) +
          "</select></label><label class=\"ifout\"><span>If not back, who has it?</span><select name=\"holder-" +
          l.num +
          '">' +
          opts(
            people.map((p) => [p, p]),
            l.holder,
          ) +
          "</select></label><label class=\"ifout\"><span>Expected back</span>" +
          dueSelect("due-" + l.num, l.due) +
          '</label></div><label class="choice"><input type="checkbox" name="dmg-' +
          l.num +
          '"> Returned damaged. Send to the workshop.</label></fieldset>'
        );
      })
      .join("");
    return (
      '<form data-checkin data-req="' +
      esc(r.id) +
      '" class="panel">' +
      sub("Check in and hand over") +
      "<p><small>Read the ID label on each unit that comes back. Leave the rest as “Not back yet” and say who has them, so the next shift knows who to expect.</small></p>" +
      rows +
      '<button type="submit" class="primary">Save check-in</button></form>'
    );
  }

  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
        s.filter,
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const l = out(a.id);
      const status = inRepair(a.id) ? "In repair" : l ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model +
          " · shelf " +
          a.bin +
          (l ? " · with " + l.holder + " · due " + l.due : ""),
        badge(status, status === "On shelf" ? "good" : ""),
      );
    }
    return html;
  }

  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit · issue and check in from a request’s kit page",
      btn("Issue equipment", "tab", "Requests", "primary"),
    );
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.onlyOpen
      ? openLoans()
      : s.loans.slice().sort((a, b) => b.num - a.num);
    if (!shown.length) html += '<p class="empty">No outstanding slips.</p>';
    return html + shown.map((l) => loanRow(l)).join("");
  }

  function deskEntries() {
    return [
      ...messages.filter((m) => !m.phase || s.phase >= m.phase),
      ...s.log,
    ].sort((a, b) => a.at - b.at);
  }

  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    html += deskEntries()
      .slice()
      .reverse()
      .map(
        (e) =>
          '<article class="record"><small>' +
          esc(e.time) +
          "</small><h3>" +
          esc(e.author) +
          "</h3><p>" +
          esc(e.text) +
          "</p></article>",
      )
      .join("");
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }

  const screens = {
    Today: today,
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };

  // ---------------------------------------------------------------------------
  // Rendering and persistence
  // ---------------------------------------------------------------------------

  function paint() {
    const phase = now();
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    const overdue = openLoans().filter((l) => dueState(l)[1] === "warn").length;
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          (n === "Today" && overdue
            ? ' <span class="count" aria-label="' +
              overdue +
              ' due now or overdue">' +
              overdue +
              "</span>"
            : "") +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    q("[data-status]").textContent = s.notice;
    q('[data-action="undo"]').hidden = !s.undo;
  }

  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }

  // Errors appear at the top of the form that caused them, without clearing
  // what the user has already chosen.
  function showError(form, text) {
    let box = form.querySelector(".alert");
    if (!box) {
      box = document.createElement("p");
      box.className = "alert";
      box.setAttribute("role", "alert");
      box.tabIndex = -1;
      form.prepend(box);
    }
    box.textContent = text;
    box.focus();
  }

  // Every change to the records can be undone once, so a misclick never has to
  // be "fixed" by recording a return that did not happen.
  const snapshot = (label) => {
    s.undo = {
      label,
      loans: structuredClone(s.loans),
      repair: s.repair.slice(),
      log: structuredClone(s.log),
    };
  };

  const record = (author, text, handover = true) =>
    s.log.push({
      at: now().at + s.log.length / 1000,
      time: now().time,
      author,
      text,
      handover,
    });

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        if (
          !window.confirm(
            "Restart the sample shift? Every slip and note from this shift will be cleared.",
          )
        )
          return;
        s = original();
        break;
      case "advance":
        if (s.phase < shifts.length - 1) s.phase++;
        s.undo = null;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.selected = "";
        break;
      case "open":
        s.tab = "Requests";
        s.selected = v;
        break;
      case "close":
        s.selected = "";
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "undo": {
        if (!s.undo) return;
        const { label, loans, repair, log } = s.undo;
        Object.assign(s, { loans, repair, log, undo: null });
        s.notice = "Undone: " + label;
        break;
      }
    }
    commit();
    if (b.dataset.action === "open" || b.dataset.action === "close")
      q("[data-page]").scrollIntoView({ block: "nearest" });
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      record("Counter handover", text);
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-issue]")) issue(f, form);
    if (f.matches("[data-checkin]")) checkIn(f, form);
  });

  function issue(f, form) {
    const r = getReq(f.dataset.req);
    const who = form.get("who");
    const due = form.get("due");
    if (!r.authorised.some(([name]) => name === who))
      return showError(f, "Choose who is collecting the kit.");
    if (dueAt(due) === undefined)
      return showError(f, "Choose when the kit is due back.");
    const picks = [];
    pendingTypes(r).forEach((type, i) => {
      if (form.get("take-" + i) !== type) return;
      picks.push([type, getAsset(form.get("unit-" + i))]);
    });
    if (!picks.length)
      return showError(f, "Tick at least one item to issue.");
    const chosen = picks.map(([, a]) => a && a.id);
    for (const [type, a] of picks)
      if (!a || a.type !== type || !onShelf(a) || chosen.indexOf(a.id) !== chosen.lastIndexOf(a.id))
        return showError(f, "A unit for " + type + " is no longer on the shelf. Pick another unit.");

    snapshot("issue to " + who);
    let num = Math.max(...s.loans.map((l) => l.num));
    const nums = [];
    for (const [, a] of picks) {
      num++;
      nums.push("L-" + num);
      s.loans.push({
        num,
        req: r.id,
        asset: a.id,
        who,
        holder: who,
        due,
        issuedAt: now().time,
        back: false,
        history: [],
      });
    }
    commit(
      "Issued " +
        picks.map(([, a]) => a.id).join(", ") +
        " to " +
        who +
        " on " +
        nums.join(", ") +
        ". Due " +
        due +
        ".",
    );
  }

  function checkIn(f, form) {
    const r = getReq(f.dataset.req);
    const outNow = loansFor(r.id).filter((l) => !l.back);
    const returns = [];
    const moves = [];
    for (const l of outNow) {
      const a = getAsset(l.asset);
      const label = form.get("label-" + l.num);
      if (label) {
        if (label !== l.asset) {
          const other = getAsset(label);
          if (inRepair(label))
            return showError(
              f,
              other.id +
                " is recorded as in repair, not on loan. Don’t shelve it. Check with the workshop, and leave slip L-" +
                l.num +
                " open until " +
                a.id +
                " comes back.",
            );
          const where = out(label)
            ? " It is out on slip L-" + out(label).num + "."
            : " It should be on shelf " + other.bin + ".";
          return showError(
            f,
            unitName(other) +
              " is not the unit on slip L-" +
              l.num +
              ". That slip is for " +
              unitName(a) +
              "." +
              where +
              " Check the label, or leave the slip open and ask the borrower.",
          );
        }
        returns.push([l, form.get("dmg-" + l.num) === "on"]);
        continue;
      }
      const holder = form.get("holder-" + l.num);
      const due = form.get("due-" + l.num);
      if (!people.includes(holder) || dueAt(due) === undefined)
        return showError(f, "Choose who has " + a.id + " and when it is due back.");
      if (holder !== l.holder || due !== l.due) moves.push([l, holder, due]);
    }
    if (!returns.length && !moves.length)
      return showError(
        f,
        "Nothing changed. Pick the label of a returned unit, or update who has an item.",
      );

    snapshot("check-in for " + r.event);
    const said = [];
    for (const [l, damaged] of returns) {
      l.back = true;
      l.returnedAt = now().time;
      if (damaged) {
        s.repair.push(l.asset);
        record(
          "Counter",
          l.asset + " came back damaged from " + r.club + " and went to the workshop.",
        );
      }
      said.push(l.asset + (damaged ? " to the workshop" : " back on the shelf"));
    }
    for (const [l, holder, due] of moves) {
      const parts = [];
      if (holder !== l.holder) parts.push("now with " + holder + " (was " + l.holder + ")");
      if (due !== l.due) parts.push("due " + due + " (was " + l.due + ")");
      const text = l.asset + " " + parts.join(", ");
      l.history.push({ time: now().time, text: parts.join(", ") });
      l.holder = holder;
      l.due = due;
      record("Counter · " + r.club, text + ". Slip L-" + l.num + " stays open.");
      said.push(text);
    }
    commit(said.join(". ") + ".");
  }

  // ---------------------------------------------------------------------------
  // Restore a saved shift
  // ---------------------------------------------------------------------------

  const validLoans = (loans) =>
    Array.isArray(loans) &&
    loans.length > 0 &&
    loans.every(
      (l) =>
        l &&
        Number.isInteger(l.num) &&
        getReq(l.req) &&
        getAsset(l.asset) &&
        people.includes(l.who) &&
        people.includes(l.holder) &&
        dueAt(l.due) !== undefined &&
        Array.isArray(l.history),
    );
  const validLog = (log) =>
    Array.isArray(log) &&
    log.every(
      (n) =>
        n &&
        typeof n.at === "number" &&
        typeof n.text === "string" &&
        typeof n.author === "string" &&
        typeof n.time === "string",
    );
  const validRepair = (list) =>
    Array.isArray(list) && list.every((id) => getAsset(id));

  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !validLoans(d.loans) ||
      !validLog(d.log) ||
      !validRepair(d.repair)
    )
      return;
    const undo =
      d.undo &&
      typeof d.undo.label === "string" &&
      validLoans(d.undo.loans) &&
      validLog(d.undo.log) &&
      validRepair(d.undo.repair)
        ? d.undo
        : null;
    s = { ...original(), ...d, undo };
    paint();
  }

  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
