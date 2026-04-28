const graph = {
  "Gate 1":              ["Admin Building", "Elementary Building"],
  "Gate 2":              ["Admin Building", "Old Valentine"],
  "Gate 3":              ["Old Valentine", "Mary Thomas"],
  "Gate 4":              ["Mary Thomas", "LEB"],
  "Gate 6":              ["CHM", "Weston Hall"],
  "Gate 7":              ["Kindergarten", "University Gym"],
  "Gate 8":              ["Swimming Pool", "University Gym"],
  "Admin Building":      ["Gate 1", "Gate 2", "Elementary Building", "Promenade"],
  "Elementary Building": ["Gate 1", "Admin Building", "CHM", "Promenade"],
  "CHM":                 ["Gate 6", "Elementary Building", "Weston Hall"],
  "Weston Hall":         ["Gate 6", "CHM", "LDT Building", "Promenade"],
  "Promenade":           ["Admin Building", "Elementary Building", "Weston Hall", "New Valentine", "Roblee", "Big Field"],
  "Old Valentine":       ["Gate 2", "Gate 3", "New Valentine", "Mary Thomas"],
  "New Valentine":       ["Old Valentine", "Promenade", "Roblee", "Lopez Hall"],
  "Mary Thomas":         ["Gate 3", "Gate 4", "Old Valentine", "Lopez Hall"],
  "LDT Building":        ["Weston Hall", "Henry Luce", "Big Field"],
  "Henry Luce":          ["LDT Building", "RMA", "Big Field", "Swimming Pool"],
  "RMA":                 ["Henry Luce", "University Gym", "Engineering Building", "Big Field"],
  "Swimming Pool":       ["Gate 8", "Henry Luce", "University Gym"],
  "University Gym":      ["Gate 7", "Gate 8", "RMA", "Kindergarten"],
  "Kindergarten":        ["Gate 7", "University Gym", "University Church"],
  "University Church":   ["Kindergarten", "Engineering Building", "Big Field"],
  "Big Field":           ["Promenade", "LDT Building", "Henry Luce", "RMA", "University Church", "Franklin Hall", "Engineering Building"],
  "Engineering Building":["RMA", "University Church", "Big Field", "Franklin Hall", "PKGE"],
  "Franklin Hall":       ["Big Field", "Engineering Building", "Roblee", "UY Building", "PKGE"],
  "Roblee":              ["Promenade", "New Valentine", "Franklin Hall", "UY Building", "Lopez Hall"],
  "UY Building":         ["Franklin Hall", "Roblee", "PKGE", "Junior High Building"],
  "PKGE":                ["Franklin Hall", "Engineering Building", "UY Building", "Junior High Building"],
  "Lopez Hall":          ["New Valentine", "Mary Thomas", "Roblee", "LEB", "Junior High Building"],
  "LEB":                 ["Gate 4", "Lopez Hall", "Junior High Building", "Senior High Building"],
  "Junior High Building":["UY Building", "PKGE", "Lopez Hall", "LEB", "Senior High Building"],
  "Senior High Building":["LEB", "Junior High Building"]
};

//travel time
const SPEEDS = {
  walking: 90,  
  running: 30,  
  driving: 12    
};

const SPEED_ICONS = { walking: "🚶", running: "🏃", driving: "🚗" };

//node positions
const pos = {
  "Gate 1":              { x: 60,  y: 230 },
  "Gate 2":              { x: 60,  y: 280 },
  "Gate 3":              { x: 60,  y: 360 },
  "Gate 4":              { x: 60,  y: 430 },
  "Gate 6":              { x: 290, y: 45  },
  "Gate 7":              { x: 700, y: 195 },
  "Gate 8":              { x: 630, y: 55  },
  "Admin Building":      { x: 165, y: 255 },
  "Elementary Building": { x: 200, y: 185 },
  "CHM":                 { x: 290, y: 120 },
  "Weston Hall":         { x: 355, y: 155 },
  "Promenade":           { x: 310, y: 240 },
  "Old Valentine":       { x: 175, y: 340 },
  "New Valentine":       { x: 300, y: 320 },
  "Mary Thomas":         { x: 150, y: 420 },
  "LDT Building":        { x: 430, y: 160 },
  "Henry Luce":          { x: 530, y: 160 },
  "RMA":                 { x: 615, y: 160 },
  "Swimming Pool":       { x: 565, y: 75  },
  "University Gym":      { x: 680, y: 145 },
  "Kindergarten":        { x: 690, y: 240 },
  "University Church":   { x: 660, y: 295 },
  "Big Field":           { x: 500, y: 255 },
  "Engineering Building":{ x: 640, y: 330 },
  "Franklin Hall":       { x: 530, y: 340 },
  "Roblee":              { x: 375, y: 355 },
  "UY Building":         { x: 480, y: 400 },
  "PKGE":                { x: 590, y: 400 },
  "Lopez Hall":          { x: 355, y: 430 },
  "LEB":                 { x: 340, y: 490 },
  "Junior High Building":{ x: 530, y: 460 },
  "Senior High Building":{ x: 480, y: 545 }
};

let currentPath  = null;
let blockedNodes = new Set();
let stops        = [];     
let travelMode   = "walking";

//bfs shortest path
function bfsShortestPath(start, end, blocked) {
  if (start === end) return [start];
  const queue   = [[start]];
  const visited = new Set();
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === end) return path;
    if (!visited.has(node)) {
      visited.add(node);
      for (const nb of graph[node] || []) {
        if (!blocked.has(nb) || nb === end)
          queue.push([...path, nb]);
      }
    }
  }
  return null;
}

//multi-stop route builder
function buildMultiStopRoute(waypoints, blocked) {
  let full = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const seg = bfsShortestPath(waypoints[i], waypoints[i + 1], blocked);
    if (!seg) return null;
    full = i === 0 ? seg : full.concat(seg.slice(1));
  }
  return full;
}

//time format
function formatTime(hops, mode) {
  const secs = hops * SPEEDS[mode];
  const m    = Math.floor(secs / 60);
  const s    = secs % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}

function initDropdowns() {
  const nodes = Object.keys(graph);

  ["start", "end", "stop-select", "block-select"].forEach(id => {
    const el = document.getElementById(id);
    nodes.forEach(n => el.innerHTML += `<option value="${n}">${n}</option>`);
  });
  document.getElementById("end").value = "Henry Luce";

  //travel mode buttons
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      travelMode = btn.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (currentPath) renderResult();
    });
  });

  document.getElementById("add-stop-btn").addEventListener("click", addStop);
  document.getElementById("clear-stops-btn").addEventListener("click", clearStops);
  document.getElementById("apply-block-btn").addEventListener("click", applyBlock);
  document.getElementById("clear-block-btn").addEventListener("click", clearBlock);
}

function addStop() {
  const val = document.getElementById("stop-select").value;
  if (!val || stops.includes(val)) return;
  stops.push(val);
  renderStopsList();
}

function removeStop(idx) {
  stops.splice(idx, 1);
  renderStopsList();
}

function clearStops() {
  stops = [];
  renderStopsList();
}

function renderStopsList() {
  const list = document.getElementById("stops-list");
  if (stops.length === 0) {
    list.innerHTML = `<span class="empty-note">No intermediate stops added</span>`;
    return;
  }
  list.innerHTML = stops.map((s, i) => `
    <div class="stop-tag">
      <span class="stop-num">${i + 1}</span>${s}
      <button class="remove-stop" onclick="removeStop(${i})">✕</button>
    </div>`).join("");
}

function applyBlock() {
  const sel = document.getElementById("block-select");
  blockedNodes = new Set(Array.from(sel.selectedOptions).map(o => o.value));
  renderBlockedTags();
  if (currentPath) findPath();
}

function clearBlock() {
  blockedNodes = new Set();
  document.getElementById("block-select").selectedIndex = -1;
  renderBlockedTags();
  if (currentPath) findPath();
}

function renderBlockedTags() {
  const el = document.getElementById("blocked-tags");
  if (blockedNodes.size === 0) {
    el.innerHTML = `<span class="empty-note">No blocked buildings</span>`;
    return;
  }
  el.innerHTML = [...blockedNodes].map(b =>
    `<span class="blocked-tag">🚫 ${b}</span>`).join("");
}

//main pathfinding function
function findPath() {
  const start = document.getElementById("start").value;
  const end   = document.getElementById("end").value;
  const waypoints = [start, ...stops, end];

  if (start === end && stops.length === 0) {
    showMsg("Start and end cannot be the same.");
    currentPath = null; drawMap(); return;
  }
  for (const b of blockedNodes) {
    if (waypoints.includes(b)) {
      showMsg(`"${b}" is blocked but is in your route. Remove it or unblock it.`);
      currentPath = null; drawMap(); return;
    }
  }

  const path = buildMultiStopRoute(waypoints, blockedNodes);
  currentPath = path;

  if (!path) {
    showMsg("No path found. Try removing blocked buildings or changing stops.");
    drawMap(); return;
  }

  renderResult();
  drawMap();
}

function renderResult() {
  const path  = currentPath;
  const hops  = path.length - 1;
  const icon  = SPEED_ICONS[travelMode];
  const label = travelMode.charAt(0).toUpperCase() + travelMode.slice(1);
  const time  = formatTime(hops, travelMode);

  document.getElementById("result").innerHTML = `
    <div class="result-meta">
      <span class="result-badge">${hops} hop${hops !== 1 ? "s" : ""}</span>
      <span class="result-badge">${icon} ${label}: ~${time}</span>
    </div>
    <div class="result-path">${path.join(" → ")}</div>`;
}

function showMsg(msg) {
  document.getElementById("result").innerHTML =
    `<span class="result-error">${msg}</span>`;
}

//check if node is a gate
function isGate(n) { return n.startsWith("Gate"); }

//footsteps
function footstepsAlongEdge(x1, y1, x2, y2, edgeIndex) {
  const dx    = x2 - x1;
  const dy    = y2 - y1;
  const dist  = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const step  = 22;
  const count = Math.max(1, Math.floor(dist / step) - 1);
  const dur   = 1.6;
  let out = "";

  for (let i = 1; i <= count; i++) {
    const t     = i / (count + 1);
    const fx    = Math.round(x1 + dx * t);
    const fy    = Math.round(y1 + dy * t);
    const begin = ((edgeIndex * 0.6 + i * 0.2) % dur).toFixed(2) + "s";
    const rot   = angle + 90;

    out += `<g transform="rotate(${rot},${fx},${fy})">
      <circle cx="${fx}" cy="${fy}" r="9" fill="white" opacity="0">
        <animate attributeName="opacity" values="0;0;0.85;0.85;0"
          keyTimes="0;0.1;0.3;0.7;1"
          dur="${dur}s" begin="${begin}" repeatCount="indefinite"/>
      </circle>
      <text x="${fx}" y="${fy}" text-anchor="middle" dominant-baseline="middle"
        font-size="12" opacity="0">👣
        <animate attributeName="opacity" values="0;0;1;1;0"
          keyTimes="0;0.1;0.3;0.7;1"
          dur="${dur}s" begin="${begin}" repeatCount="indefinite"/>
      </text>
    </g>`;
  }
  return out;
}

function drawMap() {
  const svg  = document.getElementById("campus-svg");
  const path = currentPath;
  const pathSet    = new Set();
  const pathEdges  = [];  

  if (path) {
    for (let i = 0; i < path.length - 1; i++) {
      pathSet.add(path[i] + ">" + path[i + 1]);
      pathSet.add(path[i + 1] + ">" + path[i]);
      pathEdges.push([path[i], path[i + 1]]);
    }
  }

  const stopSet = new Set(stops);
  let html = "";

  html += `<defs>
    <style>
      @keyframes stepFade {
        0%   { opacity: 0;   transform: scale(0.6); }
        30%  { opacity: 1;   transform: scale(1.1); }
        70%  { opacity: 0.8; transform: scale(1);   }
        100% { opacity: 0;   transform: scale(0.6); }
      }
    </style>
  </defs>`;

  //big field
  html += `<rect x="410" y="215" width="175" height="95" rx="6" fill="#1a3a1a" opacity="0.7"/>`;
  html += `<text x="497" y="266" text-anchor="middle" fill="#2d6a2d" font-size="11" font-family="Arial" font-weight="bold">BIG FIELD</text>`;

  //edges
  const drawn = new Set();
  Object.entries(graph).forEach(([n, neighbors]) => {
    neighbors.forEach(nb => {
      const key = [n, nb].sort().join("|");
      if (drawn.has(key)) return;
      drawn.add(key);
      const p1 = pos[n], p2 = pos[nb];
      const inPath    = pathSet.has(n + ">" + nb);
      const isBlocked = blockedNodes.has(n) || blockedNodes.has(nb);

      if (!inPath) {
        html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
          stroke="${isBlocked ? "#7f1d1d" : "#1e3a5f"}"
          stroke-width="1" stroke-linecap="round"
          ${isBlocked ? 'stroke-dasharray="5 4"' : ""}/>`;
      }
    });
  });

  //paths wd footsteps
  pathEdges.forEach(([a, b], idx) => {
    const p1 = pos[a], p2 = pos[b];
    html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
      stroke="#1d4ed8" stroke-width="5" stroke-linecap="round" opacity="0.35"/>`;
    html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
      stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>`;
    html += footstepsAlongEdge(p1.x, p1.y, p2.x, p2.y, idx);
  });

  //nodes
  Object.keys(graph).forEach(n => {
    const { x, y } = pos[n];
    const inPath    = path && path.includes(n);
    const isStart   = path && n === path[0];
    const isEnd     = path && n === path[path.length - 1];
    const isStop    = stopSet.has(n) && inPath;
    const isBlocked = blockedNodes.has(n);
    const gate      = isGate(n);

    let fill, stroke, sw, tc;
    if      (isBlocked)      { fill="#450a0a"; stroke="#dc2626"; sw=2;   tc="#fca5a5"; }
    else if (isStart||isEnd) { fill="#166534"; stroke="#4ade80"; sw=2.5; tc="#86efac"; }
    else if (isStop)         { fill="#713f12"; stroke="#f59e0b"; sw=2;   tc="#fcd34d"; }
    else if (inPath)         { fill="#1e3a8a"; stroke="#2563eb"; sw=2;   tc="#93c5fd"; }
    else if (gate)           { fill="#374151"; stroke="#84cc16"; sw=1.5; tc="#d9f99d"; }
    else                     { fill="#1e293b"; stroke="#334155"; sw=1;   tc="#94a3b8"; }

    if (gate) {
      const sz = 12;
      html += `<polygon points="${x},${y+sz} ${x-sz},${y-sz} ${x+sz},${y-sz}"
        fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      html += `<text x="${x}" y="${y+sz+11}" text-anchor="middle" fill="${tc}"
        font-size="8" font-family="Arial" font-weight="bold">${n.toUpperCase()}</text>`;
    } else {
      const words = n.split(" ");
      const half  = Math.ceil(words.length / 2);
      const lines = words.length <= 2 ? [n] : [words.slice(0, half).join(" "), words.slice(half).join(" ")];
      const bw    = Math.max(56, n.length * 5.2);
      const bh    = lines.length > 1 ? 34 : 22;

      html += `<rect x="${x-bw/2}" y="${y-bh/2}" width="${bw}" height="${bh}"
        rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

      if (isBlocked) {
        html += `<text x="${x}" y="${y+5}" text-anchor="middle" fill="#fca5a5" font-size="12" font-family="Arial">🚫</text>`;
      } else if (lines.length === 1) {
        html += `<text x="${x}" y="${y+4}" text-anchor="middle" fill="${tc}"
          font-size="8" font-family="Arial" font-weight="${inPath?"bold":"normal"}">${lines[0]}</text>`;
      } else {
        html += `<text x="${x}" y="${y-4}" text-anchor="middle" fill="${tc}"
          font-size="7.5" font-family="Arial" font-weight="${inPath?"bold":"normal"}">${lines[0]}</text>`;
        html += `<text x="${x}" y="${y+9}" text-anchor="middle" fill="${tc}"
          font-size="7.5" font-family="Arial" font-weight="${inPath?"bold":"normal"}">${lines[1]}</text>`;
      }

      //waypoint number badge
      if (isStop) {
        html += `<circle cx="${x+bw/2-4}" cy="${y-bh/2+4}" r="5" fill="#f59e0b"/>`;
        html += `<text x="${x+bw/2-4}" y="${y-bh/2+8}" text-anchor="middle" fill="#1c0a00" font-size="7" font-family="Arial" font-weight="bold">${stops.indexOf(n)+1}</text>`;
      }

      //pin markers for start and end
      if (isStart) {
        html += `<text x="${x}" y="${y-bh/2-4}" text-anchor="middle" font-size="14">📍</text>`;
      }
      if (isEnd) {
        html += `<text x="${x}" y="${y-bh/2-4}" text-anchor="middle" font-size="14">🏁</text>`;
      }
    }
  });

  svg.innerHTML = html;
}

window.onload = function () {
  initDropdowns();
  renderStopsList();
  renderBlockedTags();
  drawMap();
};