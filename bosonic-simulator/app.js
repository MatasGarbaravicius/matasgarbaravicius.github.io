document.getElementById("addOperator").addEventListener("click", function() {
  const operator = document.getElementById("operator").value;
  if (operator) {
    // Send the color number to the backend to update the image
    fetch(`https://bosonic-simulator--MatasGarba.replit.app/update_circuit?color=${operator}`, {
      method: 'GET'
    }).then(response => response.blob())
      .then(imageBlob => {
        const imageUrl = URL.createObjectURL(imageBlob);
        document.getElementById("circuitImage").src = imageUrl;
      });
  }
});

document.getElementById("simulate").addEventListener("click", function() {
  fetch(`https://bosonic-simulator--MatasGarba.replit.app/simulate_circuit`, {
    method: 'GET'
  }).then(response => response.json())
    .then(data => {
      document.getElementById("simulationResult").textContent = JSON.stringify(data, null, 2);
    });
});
