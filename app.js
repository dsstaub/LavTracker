let flights = JSON.parse(localStorage.getItem("flights")) || [];

function renderFlights() {
  const container = document.getElementById("flightContainer");
  container.innerHTML = "";
  flights.forEach((flight, index) => {
    const card = document.createElement("div");
    card.className = "flight-card";
    card.innerHTML = `
      <strong>${flight.flightNumber}</strong>
      <span>Tail: ${flight.tailNumber}</span>
      <span>Gate: ${flight.gate}</span>
      <button onclick="markServiced(${index})">Mark Serviced</button>
    `;
    container.appendChild(card);
  });
}

function markServiced(index) {
  flights[index].serviced = true;
  localStorage.setItem("flights", JSON.stringify(flights));
  renderFlights();
}

document.getElementById("fileInput").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split("\n").slice(1); // skip header
    lines.forEach(line => {
      const parts = line.split(",");
      const flightNumber = parts[0];
      const tailNumber = parts[1];
      const gate = parts[2];
      if (!flights.find(f => f.flightNumber === flightNumber)) {
        flights.push({ flightNumber, tailNumber, gate, serviced: false });
      }
    });
    localStorage.setItem("flights", JSON.stringify(flights));
    renderFlights();
  };
  reader.readAsText(file);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Clear all data?")) {
    localStorage.removeItem("flights");
    flights = [];
    renderFlights();
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const serviced = flights.filter(f => f.serviced);
  const summary = serviced.map(f => `${f.flightNumber},${f.tailNumber},${f.gate}`).join("\n");
  const blob = new Blob([summary], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "LavTracker_Summary.csv";
  a.click();
});

renderFlights();
