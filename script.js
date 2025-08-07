// Matrix-Hintergrund
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');
let cols, drops, width, height;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  cols = Math.floor(width / 18);
  drops = Array(cols).fill(1);
}
resize();
window.addEventListener('resize', resize);

function drawMatrix() {
  ctx.fillStyle = "rgba(13,15,18,0.13)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#3ba866";
  ctx.font = "15px JetBrains Mono, monospace";
  for (let i = 0; i < drops.length; i++) {
    let text = String.fromCharCode(0x30A0 + Math.random() * 96);
    ctx.fillText(text, i * 18, drops[i] * 18);
    drops[i]++;
    if (drops[i] * 18 > height || Math.random() > 0.963) drops[i] = 0;
  }
}
setInterval(drawMatrix, 44);

// --- GitHub-Projekte automatisch anzeigen ---
fetch("https://api.github.com/users/c377um/repos?sort=updated&per_page=5")
  .then(r => r.json())
  .then(repos => {
    const list = document.querySelector(".github-list");
    if (!Array.isArray(repos) || repos.length === 0) {
      list.innerHTML = "<div>Keine Projekte gefunden.</div>";
      return;
    }
    list.innerHTML = "";
    repos.forEach(repo => {
      if (repo.fork) return;
      const item = document.createElement("div");
      item.className = "repo-item";
      item.innerHTML = `
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-link">
          <strong>${repo.name}</strong>
        </a>
        <div class="repo-desc">${repo.description ? repo.description : "<i>Keine Beschreibung</i>"}</div>
      `;
      list.appendChild(item);
    });
  })
  .catch(e => {
    const list = document.querySelector(".github-list");
    list.innerHTML = "<div>Fehler beim Laden der Projekte.</div>";
  });

// --- Besucherstatistik (PHP-Backend) ---
fetch("counter.php")
  .then(r => r.json())
  .then(data => {
    document.getElementById('visit-stats').innerHTML =
      `👁 Heute: <b>${data.day}</b> &middot; Diese Woche: <b>${data.week}</b> &middot; Dieser Monat: <b>${data.month}</b> &middot; Gesamt: <b>${data.total}</b>`;
  })
  .catch(() => {
    document.getElementById('visit-stats').textContent = "👁 Besucherstatistik nicht verfügbar.";
  });