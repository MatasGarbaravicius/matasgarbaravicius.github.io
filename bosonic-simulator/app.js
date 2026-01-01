const BACKEND = "https://bosonic-simulator--matasgarba.replit.app";

let circuit = {
  wires: 4,
  gates: []
};

/* ---------- URL STATE ---------- */

function saveURL() {
  const encoded = btoa(JSON.stringify(circuit));
  window.location.hash = encoded;
}

function loadURL() {
  if (!location.hash) return;
  try {
    circuit = JSON.parse(atob(location.hash.slice(1)));
    document.getElementById("wireCount").value = circuit.wires;
    if (circuit.gates.length > 0) {
      document.getElementById("wireControls").style.display = "none";
    }
    renderCircuit();
  } catch {
    alert("Invalid circuit link");
  }
}

/* ---------- CIRCUIT MODIFICATION ---------- */

function setWires() {
  if (circuit.gates.length > 0) return;
  circuit.wires = parseInt(document.getElementById("wireCount").value);
  saveURL();
  renderCircuit();
}

function addGate(type) {
  const angle = parseFloat(document.getElementById(type.toLowerCase() + "Angle").value);
  const wire = parseInt(document.getElementById(type.toLowerCase() + "Wire").value);
  circuit.gates.push({ type, wire, angle });
  document.getElementById("wireControls").style.display = "none";
  saveURL();
  renderCircuit();
}

function addMeasurement() {
  const wire = parseInt(document.getElementById("mWire").value);
  circuit.gates.push({ type: "MEASURE", wire });
  document.getElementById("wireControls").style.display = "none";
  saveURL();
  renderCircuit();
}

/* ---------- BACKEND CALLS ---------- */

async function renderCircuit() {
  const res = await fetch(BACKEND + "/render", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(circuit)
  });
  const blob = await res.blob();
  document.getElementById("circuitImage").src = URL.createObjectURL(blob);
}

async function runSimulation() {
  const res = await fetch(BACKEND + "/simulate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(circuit)
  });
  const data = await res.json();
  document.getElementById("output").textContent =
    data.error ? "Error: " + data.error : JSON.stringify(data.counts, null, 2);
}

/* ---------- INIT ---------- */

loadURL();
