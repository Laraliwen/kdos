// ---- CONFIG ----
const API_URL = "https://script.google.com/macros/s/AKfycbzjv_ni1daK2kIAXnAIxwAGIQxNGnFWbYd97tSlpMR0tU1UXfns5F7DUGots8kAs16-/exec";

// ---- UTIL ----
async function apiFetch(method, body) {
  const opts = { method };
  if (body) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API_URL, opts);
  if (!res.ok) throw new Error("Erreur API: " + res.status);
  return res.text();
}

// ---- GESTION DES TUILES ----
async function refreshState() {
  try {
    const dataRaw = await apiFetch("GET");
    const data = JSON.parse(dataRaw);
    const map = {};
    data.forEach(d => {
      map[d.id] = { reserved: (d.reserved === true || d.reserved === "true"), by: d.reservedby || "" };
    });

    document.querySelectorAll(".cadeau").forEach(tile => {
      const id = tile.dataset.id;
      if (!id) return;

      const info = map[id];
      const existingLabel = tile.querySelector(".reserved-label");
      if (info.reserved) {
        tile.classList.add("reserved");
        if (existingLabel) {
          existingLabel.textContent = `Réservé par ${info.by}`;
        } else {
          const label = document.createElement("div");
          label.className = "reserved-label";
          label.textContent = `Réservé par ${info.by}`;
          label.style.marginTop = "5px";
          tile.appendChild(label);
        }
      } else {
        tile.classList.remove("reserved");
        if (existingLabel) existingLabel.remove();
      }
    });
  } catch (err) {
    console.warn("Impossible de rafraîchir l'état:", err);
  }
}

async function reserve(id) {
  const name = prompt("Indique ton prénom pour réserver ce cadeau :");
  if (!name) return;

  try {
    await apiFetch("POST", { id, reservedby: name });
    refreshState();
  } catch (err) {
    alert("Erreur réservation");
    console.error(err);
  }
}

async function free(id) {
  try {
    await apiFetch("DELETE", { id });
    refreshState();
  } catch (err) {
    alert("Erreur annulation");
    console.error(err);
  }
}

// ---- INIT TUILES ----
function initReservationButtons() {
  document.querySelectorAll(".cadeau").forEach(tile => {
    const id = tile.dataset.id;
    if (!id) return;

    // Bouton réserver
    const btnReserve = document.createElement("button");
    btnReserve.textContent = "Réserver";
    btnReserve.className = "btn-reservation";
    btnReserve.style.backgroundColor = window.pageColor;
    btnReserve.addEventListener("click", () => reserve(id));

    // Bouton annuler
    const btnFree = document.createElement("button");
    btnFree.textContent = "Annuler";
    btnFree.className = "btn-reservation";
    btnFree.addEventListener("click", () => free(id));

    tile.appendChild(btnReserve);
    tile.appendChild(btnFree);
  });
}

// ---- STYLE RESERVÉ ----
const style = document.createElement("style");
style.textContent = `
.cadeau.reserved { filter: grayscale(100%); opacity:0.6; }
.btn-reservation {
  display:inline-block; margin-top:5px; padding:5px 10px; border-radius:5px; cursor:pointer;
  font-weight:600; text-decoration:none; color:white; background-color:inherit; border:none;
}
.reserved-label {
  font-weight:600; color:white; font-size:14px; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}
`;
document.head.appendChild(style);

// ---- AUTO REFRESH ----
setInterval(refreshState, 5000);

// ---- DEMARRAGE ----
window.addEventListener("load", () => {
  initReservationButtons();
  refreshState();
});
