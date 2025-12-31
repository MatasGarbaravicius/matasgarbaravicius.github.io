const backend = "https://bosonic-simulator--matasgarba.replit.app";

let firstGateAdded = false;

// Set number of wires
document.getElementById("setWiresBtn").addEventListener("click", async () => {
    const numWires = parseInt(document.getElementById("numWires").value);
    const response = await fetch(`${backend}/set_wires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_wires: numWires })
    });
    const data = await response.json();
    if(data.error) alert(data.error);
    else alert(data.message);
});

// Add gate function
async function addGate(type) {
    let angle, wire;
    if(type === 'RX'){
        angle = parseFloat(document.getElementById("rxAngle").value);
        wire = parseInt(document.getElementById("rxWire").value);
    } else if(type === 'RY'){
        angle = parseFloat(document.getElementById("ryAngle").value);
        wire = parseInt(document.getElementById("ryWire").value);
    } else if(type === 'RZ'){
        angle = parseFloat(document.getElementById("rzAngle").value);
        wire = parseInt(document.getElementById("rzWire").value);
    }
    const response = await fetch(`${backend}/add_gate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gate: type, angle, wire })
    });
    if(response.ok){
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        document.getElementById("circuitImage").src = url;
        firstGateAdded = true;
        document.getElementById("wireDiv").style.display = "none"; // hide wire input
    } else {
        const data = await response.json();
        alert(data.error);
    }
}

// Add measurement
async function addMeasurement() {
    const wire = parseInt(document.getElementById("measWire").value);
    const response = await fetch(`${backend}/add_measurement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wire })
    });
    if(response.ok){
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        document.getElementById("circuitImage").src = url;
        firstGateAdded = true;
        document.getElementById("wireDiv").style.display = "none";
    } else {
        const data = await response.json();
        alert(data.error);
    }
}

// Run simulation
document.getElementById("runSimulation").addEventListener("click", async () => {
    const response = await fetch(`${backend}/simulate`);
    const data = await response.json();
    if(data.error){
        document.getElementById("simResult").textContent = "Error: " + data.error;
    } else {
        document.getElementById("simResult").textContent = JSON.stringify(data.counts, null, 2);
    }
});
