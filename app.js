let flights = [];
let isDragging = false;
let startY = 0;
let scrollTop = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadFlightsFromStorage();
  renderFlights();
  setupDragScroll();

  document.getElementById('flightForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('clearCards').addEventListener('click', clearAllFlights);
});

function handleFormSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('flightInput');
  const flightNumber = input.value.trim();
  if (flightNumber.length !== 4 || isNaN(flightNumber)) return;

  const newFlight = {
    id: Date.now(),
    number: flightNumber,
    tail: '',
    gate: '',
  };

  flights.push(newFlight);
  saveFlightsToStorage();
  renderFlights();
  input.value = '';
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
        <span contenteditable="true" class="gate" onblur="updateField(${flight.id}, 'gate', this.innerText)">${flight.gate}</span>
      </div>
      <div class="card-row">
        <span contenteditable="true" class="tail" onblur="updateField(${flight.id}, 'tail', this.innerText)">${flight.tail}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateField(id, field, value) {
  const flight = flights.find(f => f.id === id);
  if (flight) {
    flight[field] = value.trim();
    saveFlightsToStorage();
  }
}

function saveFlightsToStorage() {
  localStorage.setItem('flights', JSON.stringify(flights));
}

function loadFlightsFromStorage() {
  const stored = localStorage.getItem('flights');
  if (stored) {
    flights = JSON.parse(stored);
  }
}

function clearAllFlights() {
  if (confirm('Are you sure you want to clear all cards?')) {
    flights = [];
    localStorage.removeItem('flights');
    renderFlights();
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
