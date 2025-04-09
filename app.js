let flights = [];

document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderFlights();
  setupCSV();
  setupClear();
  setupDragScroll();
  setupWeatherModal();
});

function setupCSV() {
  document.getElementById('csvUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: function (results) {
        const rows = results.data;
        const newFlights = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 28) continue;

          const carrier = row[1];
          const arrType = row[11];
          const eta = row[8];
          const gate = row[13];
          const tail = row[26];
          const aircraft = row[27];
          const flightNum = row[0];

          if (carrier === 'AA' && arrType && flightNum) {
            newFlights.push({
              id: Date.now() + i,
              number: flightNum,
              eta,
              gate,
              tail,
              aircraft
            });
          }
        }

        flights = flights.concat(newFlights);
        saveToStorage();
        renderFlights();
      }
    });
  });
}

function renderFlights() {
  const container = document.getElementById('flightsContainer');
  container.innerHTML = '';

  flights.forEach(flight => {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.innerHTML = `
      <div class="card-row">
        <strong>${flight.number}</strong>
        <span contenteditable="true" class="gate" onblur="updateField(${flight.id}, 'gate', this.innerText)">${flight.gate || ''}</span>
      </div>
      <div class="card-row">
        <span contenteditable="true" class="tail" onblur="updateField(${flight.id}, 'tail', this.innerText)">${flight.tail || ''}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateField(id, field, value) {
  const flight = flights.find(f => f.id === id);
  if (flight) {
    flight[field] = value.trim();
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem('flights', JSON.stringify(flights));
}

function loadFromStorage() {
  const saved = localStorage.getItem('flights');
  if (saved) {
    flights = JSON.parse(saved);
  }
}

function setupClear() {
  const btn = document.getElementById('clearCards');
  btn.addEventListener('click', () => {
    if (confirm('Clear all cards?')) {
      flights = [];
      localStorage.removeItem('flights');
      renderFlights();
    }
  });
}

function setupDragScroll() {
  const container = document.getElementById('flightsWrapper');
  let isDragging = false;
  let startY = 0;
  let scrollTop = 0;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.pageY - container.offsetTop;
    scrollTop = container.scrollTop;
    container.classList.add('dragging');
  });

  container.addEventListener('mouseleave', () => {
    isDragging = false;
    container.classList.remove('dragging');
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
    container.classList.remove('dragging');
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const y = e.pageY - container.offsetTop;
    const walk = (y - startY) * 1.5;
    container.scrollTop = scrollTop - walk;
  });
}

function setupWeatherModal() {
  const clock = document.getElementById('live-clock');
  const modal = document.getElementById('weather-modal');
  const overlay = document.getElementById('weather-overlay');

  clock.addEventListener('click', () => {
    modal.style.display = 'block';
    overlay.style.display = 'block';
  });

  overlay.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
  });
}
