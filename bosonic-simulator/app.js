const BACKEND = "https://bosonic-simulator--matasgarba.replit.app";

let state = {
  num_wires: 4,
  superposition: [
    { coefficient: [1, 0], gates: [] }
  ],
  global_gates: [],
  measurement: {
    wires: [0],
    amplitude: [[1, 0]]
  },
  plot: {
    wires: [0],
    resolution: 15
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
  renderInputs();
  renderAll();
}

/* ---------- UI ---------- */

function setModes() {
  state.num_wires = parseInt(numModes.value);
  state.superposition.forEach(t => t.gates = []);
  state.global_gates = [];
  saveURL();
  renderAll();
}

function addTerm() {
  state.superposition.push({ coefficient: [0, 0], gates: [] });
  saveURL();
  loadURL();
}

function removeTerm(i){
  state.superposition.splice(i,1);
  saveURL();
  loadURL();
}

function renderUI() {
  numModes.value = state.num_wires;
  const div = document.getElementById("terms");
  div.innerHTML = "";

  state.superposition.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "term";
    el.innerHTML = `
      <h3>Term ${i}</h3>
      <img id="term${i}">

      Coefficient:
      <input value="${t.coefficient[0]}+${t.coefficient[1]}i"
        onchange="setCoeff(${i}, this.value)">

      <br>

      Phase:
      <input id="fMode${i}" size="2">
      <input id="fAngle${i}" size="4">
      <button onclick="addGate(${i}, 'F')">Add</button>

      <br>

      Squeeze:
      <input id="sMode${i}" size="2">
      <input id="sZ${i}" size="4">
      <button onclick="addGate(${i}, 'S')">Add</button>

      <br>

      Displacement:
      <input id="dAlpha${i}" value="0+0i">
      <button onclick="addGate(${i}, 'D')">Add</button>

      <br>

      Beamsplitter:
      <input id="bModeJ${i}" size="2" placeholder="j">
      <input id="bModeK${i}" size="2" placeholder="k">
      <input id="bOmega${i}" size="4" placeholder="ω">
      <button onclick="addGate(${i}, 'B')">Add B</button>

      <br>

      <button onclick="deleteGate(${i})">Delete last gate</button>
      <button onclick="removeTerm(${i})">Remove Term</button>
    `;
    div.appendChild(el);
  });
}

function deleteGate(i) {
  state.superposition[i].gates.pop();
  saveURL();
  renderTerm(i);
}

function setCoeff(i, v) {
  const [re, im] = v.replace("i", "").split("+");
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
        const [re, im] = p.replace("i", "").split("+");
        return [parseFloat(re), parseFloat(im)];
      })
    });
  }

  if (type === "B") {
    state.superposition[i].gates.push({
      type: "B",
      j: parseInt(document.getElementById(`bModeJ${i}`).value),
      k: parseInt(document.getElementById(`bModeK${i}`).value),
      omega: parseFloat(document.getElementById(`bOmega${i}`).value)
    });
  }

  saveURL();
  renderTerm(i);
}

function addGlobalGate(type) {
  if (type === "F") {
    state.global_gates.push({
      type: "F",
      mode: parseInt(globalFMode.value),
      phi: parseFloat(globalFAngle.value)
    });
  }

  if (type === "S") {
    state.global_gates.push({
      type: "S",
      mode: parseInt(globalSMode.value),
      z: parseFloat(globalSZ.value)
    });
  }

  if (type === "D") {
    const parts = globalAlpha.value.split(",");
    state.global_gates.push({
      type: "D",
      alpha: parts.map(p => {
        const [re, im] = p.replace("i", "").split("+");
        return [parseFloat(re), parseFloat(im)];
      })
    });
  }

  if (type === "B") {
    state.global_gates.push({
      type: "B",
      j: parseInt(globalBJ.value),
      k: parseInt(globalBK.value),
      omega: parseFloat(globalBOmega.value)
    });
  }

  saveURL();
  renderGlobal();
}

function deleteGlobalGate() {
  state.global_gates.pop();
  saveURL();
  renderGlobal();
}

/* ---------- Rendering ---------- */

async function renderTerm(i) {
  const res = await fetch(BACKEND + "/render_term", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      index: i,
      num_wires: state.num_wires,
      gates: state.superposition[i].gates
    })
  });
  document.getElementById(`term${i}`).src =
    URL.createObjectURL(await res.blob());
}

async function renderGlobal() {
  const res = await fetch(BACKEND + "/render_global", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      num_wires: state.num_wires,
      gates: state.global_gates
    })
  });
  globalCircuit.src = URL.createObjectURL(await res.blob());
}

function renderInputs() {
  mWires.value = state.measurement.wires.join(",");
  mAmp.value = state.measurement.amplitude
    .map(([re, im]) => `${re}+${im}i`)
    .join(",");

  plotWires.value = state.plot.wires.join(",");
  plotResolution.value = state.plot.resolution;
}


function renderAll() {
  state.superposition.forEach((_, i) => renderTerm(i));
  renderGlobal();
}

/* ---------- Simulation ---------- */

async function simulate() {
  state.measurement.wires =
    mWires.value.split(",").map(Number);

  state.measurement.amplitude =
    mAmp.value.split(",").map(p => {
      const [re, im] = p.replace("i", "").split("+");
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
    data.error ? data.error : "Probability density value: " + data.probability;
}

async function generatePlots() {
  state.plot.wires = plotWires.value.split(",").map(Number);
  state.plot.resolution = parseInt(plotResolution.value);

  saveURL();

  const res = await fetch(BACKEND + "/plot", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(state)
  });

  const blobs = await res.json();

  const div = document.getElementById("plots");
  div.innerHTML = "";

  blobs.images.forEach((b64, i) => {
    const img = document.createElement("img");
    img.src = "data:image/png;base64," + b64;
    img.alt = `Plot for wire ${state.plot.wires[i]}`;
    div.appendChild(img);
  });

  div.scrollIntoView({ behavior: "smooth", block: "end" });
}

async function normalizeSuperposition() {
  const res = await fetch(BACKEND + "/normalize", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(state)
  });

  const data = await res.json();

  state.superposition = data.normalized_superposition;

  saveURL();

  loadURL();
}

/* ---------- Spinner ---------- */

function showSpinner() {
    document.getElementById("spinner").style.display = "block";
}

function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
}

// Store the original fetch function
const originalFetch = window.fetch;

// Override the global fetch
window.fetch = async function (...args) {
    showSpinner(); // Show spinner before the fetch starts

    try {
        const response = await originalFetch(...args);
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    } finally {
        hideSpinner(); // Hide spinner after the fetch ends (success or failure)
    }
};


loadURL();
