const BACKEND = "https://bosonic-simulator--matasgarba.replit.app";

let state = {
  num_wires: 4,
  superposition: [
    { coefficient: [1, 0], gates: [] }
  ],
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
  if (location.hash) {
    state = JSON.parse(atob(location.hash.slice(1)));
  }
  renderUI();
  renderAllCircuits();
}

/* ---------- UI ---------- */

function setModes() {
  state.num_wires = parseInt(numModes.value);
  state.superposition.forEach(t => t.gates = []);
  saveURL();
  renderUI();
  renderAllCircuits();
}

function addTerm() {
  state.superposition.push({ coefficient: [0, 0], gates: [] });
  saveURL();
  renderUI();
}

function renderUI() {
  numModes.value = state.num_wires;
  const div = document.getElementById("terms");
  div.innerHTML = "";

  state.superposition.forEach((term, i) => {
    const el = document.createElement("div");
    el.className = "term";
    el.innerHTML = `
      <h3>Term ${i}</h3>

      <img id="circuit${i}">

      Coefficient:
      <input value="${term.coefficient[0]}+${term.coefficient[1]}i"
        onchange="setCoeff(${i}, this.value)">

      <br><br>

      Phase F:
      mode <input id="fMode${i}" size="2">
      angle <input id="fAngle${i}" size="4">
      <button onclick="addGate(${i}, 'F')">Add</button>

      <br>

      Squeeze S:
      mode <input id="sMode${i}" size="2">
      z <input id="sZ${i}" size="4">
      <button onclick="addGate(${i}, 'S')">Add</button>

      <br>

      Displacement D:
      α (comma complex)
      <input id="dAlpha${i}" value="0+0i">
      <button onclick="addGate(${i}, 'D')">Add</button>
    `;
    div.appendChild(el);
  });
}

/* ---------- Gates ---------- */

function setCoeff(i, v) {
  const [re, im] = v.replace("i","").split("+");
  state.superposition[i].coefficient = [parseFloat(re), parseFloat(im)];
  saveURL();
}

function addGate(i, type) {
  if (type === "F") {
    state.superposition[i].gates.push({
      type: "F",
      mode: parseInt(document.getElementById(`fMode${i}`).value),
      phi: parseFloat(document.getElementById(`fAngle${i}`).value)
    });
  }
  if (type === "S") {
    state.superposition[i].gates.push({
      type: "S",
      mode: parseInt(document.getElementById(`sMode${i}`).value),
      z: parseFloat(document.getElementById(`sZ${i}`).value)
    });
  }
  if (type === "D") {
    const parts = document.getElementById(`dAlpha${i}`).value.split(",");
    state.superposition[i].gates.push({
      type: "D",
      alpha: parts.map(p => {
        const [re, im] = p.replace("i","").split("+");
        return [parseFloat(re), parseFloat(im)];
      })
    });
  }
  saveURL();
  renderTerm(i);
}

/* ---------- Rendering ---------- */

async function renderTerm(i) {
  const res = await fetch(BACKEND + "/render_term", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      index: i,
      num_wires: state.num_wires,
      term: state.superposition[i]
    })
  });
  document.getElementById(`circuit${i}`).src =
    URL.createObjectURL(await res.blob());
}

function renderAllCircuits() {
  state.superposition.forEach((_, i) => renderTerm(i));
}

/* ---------- Simulation ---------- */

async function simulate() {
  state.measurement.wires =
    mWires.value.split(",").map(Number);

  state.measurement.amplitude =
    mAmp.value.split(",").map(p => {
      const [re, im] = p.replace("i","").split("+");
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
