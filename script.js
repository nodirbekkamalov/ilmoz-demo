const views = {
  dashboard: { title: "Xayrli tong, Akmal", subtitle: "Bugungi markaz holati va asosiy ko‘rsatkichlar" },
  groups: { title: "Guruhlar", subtitle: "Faol guruhlar, o‘qituvchilar va dars jarayoni" },
  schedule: { title: "Dars jadvali", subtitle: "Haftalik darslar va xonalar bandligi" },
  finance: { title: "Moliya", subtitle: "To‘lovlar, tushum va qarzdorlik nazorati" },
  analytics: { title: "Tahlil", subtitle: "Markaz o‘sishi va o‘quvchilar dinamikasi" },
  ai: { title: "NexoGPT", subtitle: "Markazingiz ma’lumotlari bilan ishlaydigan AI yordamchi" },
};

const groups = [
  { name: "IELTS Advanced", course: "English", teacher: "Dilnoza Karimova", count: "18/20", status: "Faol", color: "#3b6bff" },
  { name: "Mathematics B1", course: "Mathematics", teacher: "Sardor Aliyev", count: "14/16", status: "Faol", color: "#8b5cf6" },
  { name: "Frontend 24", course: "Programming", teacher: "Aziz Rahimov", count: "12/15", status: "Faol", color: "#10b981" },
  { name: "Design Start", course: "UI/UX Design", teacher: "Malika Saidova", count: "9/12", status: "Yangi", color: "#f59e0b" },
];

const lessons = [
  ["09:00", "IELTS Advanced", "Room 3", "#3b6bff"],
  ["11:30", "Mathematics B1", "Room 1", "#8b5cf6"],
  ["14:00", "Frontend 24", "Lab 2", "#10b981"],
];

const calendarLessons = {
  "0-1": ["IELTS Advanced", "09:00–10:30", "#3b6bff"],
  "1-2": ["Mathematics B1", "11:30–13:00", "#8b5cf6"],
  "0-3": ["Frontend 24", "09:30–11:00", "#10b981"],
  "2-4": ["Design Start", "14:00–15:30", "#f59e0b"],
  "1-5": ["IELTS Advanced", "11:00–12:30", "#3b6bff"],
};

let activeView = "dashboard";
let toastTimer;

function stat(label, value, delta, icon, color) {
  return `<article class="surface mini-stat">
    <div class="stat-top"><span class="stat-icon" style="color:${color};background:${color}20">${icon}</span><span class="delta">${delta}</span></div>
    <h2>${value}</h2><p>${label}</p>
  </article>`;
}

function areaChart(id, color = "#5f90ff", growth = false) {
  const path = growth
    ? "M0 160 C38 151 63 155 100 132 S165 128 205 101 S278 109 315 76 S395 68 480 38"
    : "M0 97 C45 92 62 76 106 80 S175 63 214 68 S276 42 322 50 S390 22 480 26";
  const bottom = growth ? 190 : 120;
  const lines = (growth ? [25,65,105,145,185] : [20,50,80,110]).map(y => `<line x1="0" y1="${y}" x2="480" y2="${y}" stroke="rgba(255,255,255,.055)"/>`).join("");
  return `<svg viewBox="0 0 480 ${bottom}" class="area-chart" role="img" aria-label="Ko‘rsatkich o‘sish grafigi">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".3"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${lines}<path d="${path} L480 ${bottom} L0 ${bottom} Z" fill="url(#${id})" stroke="none"/><path d="${path}" fill="none" stroke="${color}" stroke-width="3"/>
  </svg>`;
}

function dashboardView() {
  return `<div class="view-stack">
    <div class="stats-grid">
      ${stat("Faol o‘quvchilar", "1 284", "+8.2%", "♙", "#5f90ff")}
      ${stat("Faol guruhlar", "48", "+4", "◎", "#8b5cf6")}
      ${stat("Oylik tushum", "148.2M", "+18%", "₿", "#10b981")}
      ${stat("Davomat", "94.8%", "+2.1%", "✓", "#f59e0b")}
    </div>
    <div class="dashboard-grid">
      <article class="surface surface-pad"><div class="card-heading"><div><h2>Tushum dinamikasi</h2><p>So‘nggi 6 oy</p></div><span class="trend-pill">+18.4%</span></div>${areaChart("revenue")}</article>
      <article class="surface surface-pad"><div class="card-heading"><h2>Bugungi darslar</h2><span class="trend-pill">12 ta</span></div><div class="lesson-list">${lessons.map(([time,name,room,color]) => `<div class="lesson"><span class="lesson-bar" style="background:${color}"></span><div><strong>${name}</strong><small>${time} · ${room}</small></div><span>›</span></div>`).join("")}</div></article>
    </div>
    <button class="nexo-strip" type="button" data-view="ai"><span>✦</span><span><strong>NexoGPT:</strong> 7 o‘quvchida davomat pasayishi aniqlandi.</span><span>→</span></button>
  </div>`;
}

function groupRows(items) {
  if (!items.length) return `<div class="empty-state">Mos guruh topilmadi</div>`;
  return items.map(group => `<div class="data-row">
    <span class="row-color" style="background:${group.color}"></span>
    <span class="row-main"><strong>${group.name}</strong><small>${group.course} · ${group.teacher}</small></span>
    <span class="row-count">${group.count} o‘quvchi</span><span class="status${group.status === "Yangi" ? " new" : ""}">${group.status}</span><span aria-hidden="true">•••</span>
  </div>`).join("");
}

function groupsView() {
  return `<div class="view-stack"><article class="surface">
    <div class="toolbar"><label class="search"><span>⌕</span><input id="group-search" type="search" placeholder="Guruhni qidirish..." aria-label="Guruhni qidirish"></label><button class="primary-button" type="button" data-toast="Yangi guruh oynasi demo rejimida">+ Yangi guruh</button></div>
    <div class="data-list" id="group-list">${groupRows(groups)}</div><div class="table-footer"><span>48 guruhdan 4 tasi</span><span>1 / 12</span></div>
  </article></div>`;
}

function scheduleView() {
  const days = ["Dush", "Sesh", "Chor", "Pay", "Juma"];
  const times = ["09:00", "11:00", "13:00", "15:00"];
  const cells = times.map((time,row) => `<div class="time">${time}</div>${days.map((_,day) => {
    const item = calendarLessons[`${row}-${day + 1}`];
    return `<div>${item ? `<div class="calendar-lesson" style="border-color:${item[2]}55;background:${item[2]}12"><strong style="color:${item[2]}">${item[0]}</strong><small>${item[1]}</small></div>` : ""}</div>`;
  }).join("")}`).join("");
  return `<div class="view-stack"><article class="surface surface-pad">
    <div class="schedule-controls"><div class="segmented" id="schedule-tabs">${["Bugun","Hafta","Oy"].map((v,i) => `<button type="button" class="${i===1?"active":""}" data-period="${v}">${v}</button>`).join("")}</div><strong id="schedule-range">3–8 Noyabr</strong></div>
    <div class="calendar-scroll"><div class="calendar"><div class="calendar-head"></div>${days.map(day => `<div class="calendar-head">${day}</div>`).join("")}${cells}</div></div>
  </article></div>`;
}

function financeView() {
  const heights = [42,58,52,72,65,86,78,94];
  const payments = [["M. Akramov","+1 200 000","To‘landi"],["D. Rustamova","+950 000","To‘landi"],["A. Karimov","1 100 000","Kutilmoqda"]];
  return `<div class="view-stack">
    <div class="stats-grid three-stats">${stat("Jami tushum","148.2M","+18%","₿","#10b981")}${stat("Kutilmoqda","24.6M","+4.1%","◷","#f59e0b")}${stat("Qarzdorlik","8.4M","−12%","!","#ef4444")}</div>
    <div class="finance-grid"><article class="surface surface-pad"><div class="card-heading"><h2>Tushum va xarajat</h2><span style="color:#6ee7b7">↗</span></div><div class="bars">${heights.map(h => `<span class="bar-pair"><i style="height:${h}%"></i><i style="height:${Math.max(20,h-24)}%"></i></span>`).join("")}</div></article>
    <article class="surface surface-pad"><div class="card-heading"><h2>So‘nggi to‘lovlar</h2></div><div class="payment-list">${payments.map(([name,value,status]) => `<div class="payment"><span class="payment-avatar">${name[0]}</span><span class="payment-copy"><strong>${name}</strong><small>Bugun</small></span><span class="payment-value${status !== "To‘landi" ? " pending" : ""}"><strong>${value}</strong><small>${status}</small></span></div>`).join("")}</div></article></div>
  </div>`;
}

function analyticsView() {
  const courses = [["IELTS",86],["Mathematics",74],["Frontend",63]];
  return `<div class="view-stack"><div class="analytics-grid">
    <article class="surface surface-pad"><div class="card-heading"><div><h2>O‘quvchilar o‘sishi</h2><p>Yanvar — Noyabr</p></div><span class="delta">+24.8%</span></div>${areaChart("growth","#10b981",true)}</article>
    <div class="analytics-side"><article class="surface surface-pad"><div class="card-heading"><p>Retention rate</p></div><h2 class="retention">92.4%</h2><div class="progress"><i style="width:92.4%"></i></div></article>
    <article class="surface surface-pad"><div class="card-heading"><h2>Top kurslar</h2></div><div class="course-list">${courses.map(([name,value]) => `<div class="course-row"><span>${name}</span><div class="progress"><i style="width:${value}%"></i></div><span>${value}%</span></div>`).join("")}</div></article></div>
  </div></div>`;
}

function aiView() {
  return `<div class="view-stack"><article class="surface chat">
    <div class="chat-header"><div class="chat-title"><span class="bot-mark">✦</span><span><strong>NexoGPT</strong><small>● Online · Orbit Academy</small></span></div><span class="model-pill">Fast model</span></div>
    <div class="messages" id="messages"><div class="message user">Qaysi o‘quvchilarning davomati pasaygan?</div><div class="message ai"><div class="ai-title">✦ Nexo tahlili</div>So‘nggi 30 kunda 7 o‘quvchining davomati 15% dan ko‘proq pasaydi. Eng katta o‘zgarish IELTS Advanced guruhida.<div class="ai-metrics"><div><strong>7</strong><small>Risk</small></div><div><strong>−18%</strong><small>Davomat</small></div><div><strong>3</strong><small>Guruh</small></div></div></div></div>
    <form class="chat-form" id="chat-form"><input id="chat-input" autocomplete="off" maxlength="240" placeholder="Markazingiz haqida so‘rang..." aria-label="NexoGPT uchun savol"><button class="send-button" type="submit" aria-label="Yuborish">➤</button></form>
  </article></div>`;
}

function renderView() {
  const meta = views[activeView];
  document.getElementById("page-title").textContent = meta.title;
  document.getElementById("page-subtitle").textContent = meta.subtitle;
  const reportButton = document.getElementById("report-button");
  reportButton.hidden = activeView === "ai";
  reportButton.style.display = activeView === "ai" ? "none" : "";
  const renderers = { dashboard: dashboardView, groups: groupsView, schedule: scheduleView, finance: financeView, analytics: analyticsView, ai: aiView };
  document.getElementById("view-root").innerHTML = renderers[activeView]();
  bindViewEvents();
}

function selectView(view, updateHash = true) {
  if (!views[view]) view = "dashboard";
  activeView = view;
  document.querySelectorAll("[data-view]").forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (updateHash) history.replaceState(null, "", `#${view}`);
  renderView();
}

function bindViewEvents() {
  document.querySelectorAll("#view-root [data-view]").forEach(button => button.addEventListener("click", () => selectView(button.dataset.view)));
  document.querySelectorAll("#view-root [data-toast]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.toast)));

  const search = document.getElementById("group-search");
  if (search) search.addEventListener("input", event => {
    const query = event.target.value.trim().toLocaleLowerCase("uz");
    const matches = groups.filter(group => `${group.name} ${group.course} ${group.teacher}`.toLocaleLowerCase("uz").includes(query));
    document.getElementById("group-list").innerHTML = groupRows(matches);
  });

  document.querySelectorAll("[data-period]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll("[data-period]").forEach(item => item.classList.toggle("active", item === button));
    const ranges = { Bugun: "7 Noyabr", Hafta: "3–8 Noyabr", Oy: "Noyabr 2026" };
    document.getElementById("schedule-range").textContent = ranges[button.dataset.period];
  }));

  const chatForm = document.getElementById("chat-form");
  if (chatForm) chatForm.addEventListener("submit", handleChat);
}

function handleChat(event) {
  event.preventDefault();
  const input = document.getElementById("chat-input");
  const value = input.value.trim();
  if (!value) return;
  const messages = document.getElementById("messages");
  const user = document.createElement("div");
  user.className = "message user";
  user.textContent = value;
  messages.appendChild(user);
  input.value = "";
  setTimeout(() => {
    if (!document.body.contains(messages)) return;
    const reply = document.createElement("div");
    reply.className = "message ai";
    reply.textContent = "Demo ma’lumotlari bo‘yicha tahlil tayyor. To‘liq javoblar real Ilmoz workspace ichida mavjud.";
    messages.appendChild(reply);
    messages.scrollTop = messages.scrollHeight;
  }, 450);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-list [data-view], .mobile-nav [data-view]").forEach(button => button.addEventListener("click", () => selectView(button.dataset.view)));
  document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.toast)));
  document.getElementById("report-button").addEventListener("click", () => showToast("Hisobot demo rejimida tayyorlandi"));
  selectView(location.hash.slice(1) || "dashboard", false);
});

window.addEventListener("hashchange", () => selectView(location.hash.slice(1), false));
