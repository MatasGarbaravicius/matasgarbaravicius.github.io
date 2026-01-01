const BACKEND = "https://bosonic-simulator--matasgarba.replit.app";

let state = {
  num_wires: 4,
  gates: [],
  measurement: {
    wires: [0],
    amplitude: [[1, 0]]
  }
};

/* ---------- URL ---------- */

function saveURL() {
  location.hash = btoa(JSON.stringify(state));
}

function loadURL() {
  if (!location.hash) return;
  state = JSON.parse(atob(location.hash.slice(1)));
  document.getElementById("numModes").value = state.num_wires;
  render();
}

/* ---------- Gates ---------- */

function setModes() {
  state.num_wires = parseInt(document.getElementById("numModes").value);
  state.gates = [];
  saveURL();
  render();
}

function addPhase() {
  state.gates.push({
    type: "F",
    mode: parseInt(fMode.value),
    phi: parseFloat(fAngle.value)
  });
  saveURL();
  render();
}

function addSqueezing() {
  state.gates.push({
    type: "S",
    mode: parseInt(sMode.value),
    z: parseFloat(sZ.value)
  });
  saveURL();
  render();
}

/* ---------- Backend ---------- */

async function render() {
  const res = await fetch(BACKEND + "/render", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(state)
  });
  document.getElementById("circuitImage").src =
    URL.createObjectURL(await res.blob());
}

async function simulate() {
  state.measurement.wires =
    document.getElementById("mWires").value.split(",").map(Number);

  state.measurement.amplitude =
    document.getElementById("mAmp").value.split(",").map(s => {
      const [re, im] = s.replace("i","").split("+");
      return [parseFloat(re), parseFloat(im)];
    });

  saveURL();

  const res = await fetch(BACKEND + "/simulate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(state)
  });

  const data = await res.json();
  output.textContent =
    data.error ? data.error : "Probability = " + data.probability;
}

loadURL();
