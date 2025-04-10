let cards = JSON.parse(localStorage.getItem("lavCards")) || [];

function saveCards() {
  localStorage.setItem("lavCards", JSON.stringify(cards));
}

function createCard(data) {
  const card = document.createElement("div");
  card.className = `card ${data.isRegional ? "regional" : ""} ${data.serviced ? "serviced" : ""}`;

  const info = document.createElement("div");
  info.innerHTML = `
    <strong>Flight ${data.flight}</strong><br/>
    <small>${data.arrType}</small>
  `;

  const tail = document.createElement("input");
  tail.value = data.tail;
  tail.placeholder = "Tail";
  tail.onchange = () => {
    data.tail = tail.value;
    saveCards();
  };

  const gate = document.createElement("input");
  gate.value = data.gate;
  gate.placeholder = "Gate";
  gate.onchange = () => {
    data.gate = gate.value;
    saveCards();
  };

  const button = document.createElement("button");
  button.textContent = data.serviced ? "Undo" : "Serviced";
  button.onclick = () => {
    data.serviced = !data.serviced;
    saveCards();
    render();
  };

  card.append(info, tail, gate, button);
  return card;
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  cards.forEach(card => board.appendChild(createCard(card)));
}

function parseCSV(text) {
  const rows = text.trim().split("\n").slice(1);
  rows.forEach(row => {
    const cols = row.split(",");
    const carrier = cols[1]?.trim();
    const arrType = cols[11]?.trim();
    const flight = cols[0]?.trim();
    const tail = cols[26]?.trim();
    const equip = cols[27]?.trim();
    const gate = cols[13]?.trim();

    const exists = cards.find(c => c.flight === flight);
    if (carrier === "AA" && arrType && !exists) {
      cards.push({
        flight,
        arrType,
        tail,
        gate,
        equip,
        serviced: false,
        isRegional: !["0001","2949","6300","6349"].some(r => flight >= r.split('-')[0] && flight <= r.split('-')[1])
      });
    }
  });
  saveCards();
  render();
}

document.getElementById("upload").addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = () => parseCSV(reader.result);
  reader.readAsText(e.target.files[0]);
});

document.getElementById("reset").addEventListener("click", () => {
  if (confirm("Clear all progress?")) {
    cards = [];
    localStorage.removeItem("lavCards");
    render();
  }
});

document.getElementById("export").addEventListener("click", () => {
  const serviced = cards.filter(c => c.serviced);
  const content = serviced.map(c => `${c.flight},${c.tail},${c.gate}`).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "LavTracker_Summary.csv";
  a.click();
});

render();
