document.getElementById("csvUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
    complete: function (results) {
      const flights = results.data.filter(f =>
        (f["Carrier"] || "").trim() === "AA" ||
        (f["Arr. Type"] || "").toUpperCase().includes("TERM")
      ).map(f => {
        const values = Object.values(f);
        return {
          flight: values[2]?.trim() || "",
          eta: values[8]?.trim() || "",
          gate: values[13]?.trim() || "",
          tail: values[26]?.trim() || "",
          type: values[27]?.trim() || "",
          arrType: values[11]?.trim() || "",
          carrier: values[1]?.trim() || ""
        };
      });

      createHourBlocks();

      flights.forEach(f => {
        const labelClass = f.arrType.toUpperCase() === "TERM" ? "tf" : "qt";
        const carrierClass = f.carrier === "AA" ? "mainline" : "regional";
        let hourMatch = f.eta.match(/^(\d{1,2})/);
        let hour = hourMatch ? parseInt(hourMatch[1], 10) : null;
        if (hour === 0) hour = 24;

        const card = document.createElement("div");
        card.className = `flight-card ${carrierClass}`;

        card.innerHTML = `
          <div class="color-bar ${labelClass}"></div>
          <div class="card-content">
            <div class="flight-info">
              <span>${f.flight} (${f.type})</span>
              <span class="editable">${f.gate || '[ ]'}</span>
            </div>
            <div class="flight-meta">
              <span>ETA: ${f.eta}</span>
              <span class="editable">${f.tail || '[ ]'}</span>
            </div>
          </div>
        `;

        const gateSpan = card.querySelector(".flight-info .editable");
        gateSpan.onclick = () => makeEditable(gateSpan, 'gate', f);

        const tailSpan = card.querySelector(".flight-meta .editable");
        tailSpan.onclick = () => makeEditable(tailSpan, 'tail', f);

        attachLongPress(card);

        const target = document.getElementById(`hour-${hour}`) || document.getElementById("hour-15");
        target.appendChild(card);
      });
    }
  });
});

function createHourBlocks() {
  const hours = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1];
  const grid = document.getElementById("hourGrid");
  grid.innerHTML = "";
  hours.forEach(hour => {
    const block = document.createElement("div");
    block.className = "hour-block";

    const label = document.createElement("div");
    label.className = "hour-label";
    label.textContent = hour;

    const dropZone = document.createElement("div");
    dropZone.id = `hour-${hour}`;
    dropZone.className = "sortable-wrapper";

    block.appendChild(label);
    block.appendChild(dropZone);
    grid.appendChild(block);

    new Sortable(dropZone, {
      group: 'shared',
      animation: 150,
      direction: 'horizontal',
    });
  });
}

function makeEditable(el, field, flight) {
  const input = document.createElement("input");
  input.value = flight[field];
  input.className = "edit-field";
  input.onblur = () => {
    flight[field] = input.value;
    el.innerText = input.value || '[ ]';
    el.style.display = "inline-block";
    input.remove();
  };
  el.style.display = "none";
  el.parentNode.insertBefore(input, el);
  input.focus();
}

function attachLongPress(card) {
  let pressTimer, wasDragging = false;
  card.addEventListener("pointerdown", () => {
    wasDragging = false;
    pressTimer = setTimeout(() => {
      if (!wasDragging) card.classList.toggle("dimmed");
    }, 500);
  });
  card.addEventListener("pointerup", () => clearTimeout(pressTimer));
  card.addEventListener("pointerleave", () => clearTimeout(pressTimer));
  card.addEventListener("pointermove", () => { wasDragging = true; });
}
