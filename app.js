let flights = [];
let isDragging = false;
let startY = 0;
let scrollTop = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderFlights();
  setupDragScroll();
  setupClearButton();

  document.getElementById('csvUpload').addEventListener('change', handleCSVUpload);
});

function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    complete: function (results) {
      const rows = results.data;
      const newFlights = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const carrier = row[1];
        const arrType = row[11];
        const eta = row[8];
        const gate = row[13];
        const tail = row[26];
        const aircraft = row[27];
        const flightNum = row[0];

        if (carrier === 'AA' && arrType) {
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
  const stored = localStorage.getItem('flights');
  if (stored) {
    flights = JSON.parse(stored);
  }
}

function setupClearButton() {
  const btn = document.getElementById('clearCards');
  if (btn) {
    btn.addEventListener('click', () => {
      if (confirm('Clear all flight cards?')) {
        flights = [];
        localStorage.removeItem('flights');
        renderFlights();
      }
    });
  }
}

function setupDragScroll() {
  const container = document.getElementById('flightsWrapper');

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
