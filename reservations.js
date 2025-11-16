// ---- CONFIG ----
const API_URL = "https://script.google.com/macros/s/AKfycbwgR0sO2QRvKTXPXPz52FmszwH5ZOmzNc0KEUdyY6QDWFEKnzW2I1Cq904Jpqn-eAAB/exec";

// ---- UTIL ----
async function apiFetch(method, body){
  const opts = { method };
  if(body){
    opts.headers={'Content-Type':'application/json'};
    opts.body=JSON.stringify(body);
  }
  const res = await fetch(API_URL, opts);
  if(!res.ok) throw new Error("Erreur API: "+res.status);
  return res.text();
}

// ---- GESTION DES TUILES ----
async function refreshState(){
  try{
    const dataRaw = await apiFetch("GET");
    const data = JSON.parse(dataRaw);
    const map = {};
    data.forEach(d=>{ map[d.id] = (d.reserved === true || d.reserved === "true"); });

    document.querySelectorAll(".cadeau").forEach(tile=>{
      const id = tile.dataset.id;
      if(!id) return;
      if(map[id]){
        tile.classList.add("reserved");
      } else {
        tile.classList.remove("reserved");
      }
    });
  }catch(err){ console.warn("Impossible de rafraîchir l'état:",err); }
}

async function reserve(id){ try{ await apiFetch("POST",{id}); refreshState(); } catch(err){ alert("Erreur réservation"); console.error(err);} }
async function free(id){ try{ await apiFetch("DELETE",{id}); refreshState(); } catch(err){ alert("Erreur annulation"); console.error(err);} }

// ---- INIT TUILES ----
function initReservationButtons(){
  document.querySelectorAll(".cadeau").forEach(tile=>{
    const id = tile.dataset.id;
    if(!id) return;

    let btnReserve = document.createElement("button");
    btnReserve.textContent="Réserver";
    btnReserve.className="btn-reservation"; // copie le style du bouton retour
    btnReserve.addEventListener("click", ()=>reserve(id));

    let btnFree = document.createElement("button");
    btnFree.textContent="Annuler";
    btnFree.className="btn-reservation";
    btnFree.addEventListener("click", ()=>free(id));

    tile.appendChild(btnReserve);
    tile.appendChild(btnFree);
  });
}

// ---- STYLE RESERVÉ ----
const style = document.createElement("style");
style.textContent=`
.cadeau.reserved{ filter: grayscale(100%); opacity:0.5; }
.btn-reservation{
  display:inline-block; margin-top:5px; padding:5px 10px; border-radius:5px; cursor:pointer;
  font-weight:600; text-decoration:none; color:white; background-color:inherit; border:none;
}
`;
document.head.appendChild(style);

// ---- AUTO REFRESH ----
setInterval(()=>{ refreshState(); },5000);

// ---- DEMARRAGE ----
window.addEventListener("load", ()=>{
  initReservationButtons();
  refreshState();
});
