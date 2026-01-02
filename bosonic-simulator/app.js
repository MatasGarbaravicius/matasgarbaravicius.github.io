const API = "https://YOUR-REPLIT-URL.replit.app";

let state = null;

function encode() {
  return btoa(JSON.stringify(state));
}

function decode(s) {
  return JSON.parse(atob(s));
}

function init() {
  state = {
    num_wires: 4,
    terms: [
      { coeff: [1,0], gates: [] },
      { coeff: [1,0], gates: [] }
    ],
    global_gates: []
  };
  sync();
}

function sync() {
  const enc = encode();
  location.hash = enc;
  document.getElementById("stateBox").value = enc;
  draw();
}

function draw() {
  const sel = document.getElementById("target");
  sel.innerHTML = `<option value="global">Global</option>`;
  state.terms.forEach((_,i)=>{
    sel.innerHTML += `<option value="${i}">Term ${i}</option>`;
  });
}

async function render(target) {
  const res = await fetch(API+"/render", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({state: encode(), target})
  });
  return res.blob();
}

async function addGate() {
  const t = document.getElementById("target").value;
  const g = document.getElementById("gateType").value;
  const p = JSON.parse(document.getElementById("params").value);

  const gate = {type:g, ...p};

  if (t === "global") state.global_gates.push(gate);
  else state.terms[t].gates.push(gate);

  sync();
}

function deleteLast() {
  const t = document.getElementById("target").value;
  if (t === "global") state.global_gates.pop();
  else state.terms[t].gates.pop();
  sync();
}

async function simulate() {
  const wires = JSON.parse(document.getElementById("wires").value);
  const ampl = JSON.parse(document.getElementById("ampl").value);

  const r = await fetch(API+"/simulate", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      state: encode(),
      wires,
      amplitude: ampl
    })
  });
  document.getElementById("out").innerText = JSON.stringify(await r.json(),null,2);
}

if (location.hash.length > 1) {
  state = decode(location.hash.slice(1));
  sync();
}
