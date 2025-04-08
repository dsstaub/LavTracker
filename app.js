document.getElementById('uploadBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('csvInput');
  const isRefreshMode = document.getElementById('refreshToggle').checked;

  if (fileInput.files.length === 0) {
    alert("Please select a CSV file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    Papa.parse(e.target.result, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;

        if (!isRefreshMode) {
          document.getElementById('hourGrid').innerHTML = '';
        }

        rows.forEach(row => {
          const flightNum = row[0]?.trim();
          const carrier = row[1]?.trim();
          const eta = row[8]?.trim();
          const arrType = row[11]?.trim();
          const gate = row[13]?.trim();
          const tail = row[26]?.trim();
          const acType = row[27]?.trim();

          if (!flightNum || !arrType || carrier !== 'AA') return;

          const existingCard = document.querySelector(`.flight-card[data-flight="${flightNum}"]`);

          if (existingCard && isRefreshMode) {
            const oldEta = existingCard.getAttribute('data-eta');

            existingCard.querySelector('.gate').textContent = gate;
            existingCard.querySelector('.tail').textContent = tail;
            existingCard.querySelector('.ac-type').textContent = acType;
            existingCard.querySelector('.eta').textContent = eta;
            existingCard.setAttribute('data-eta', eta);

            if (oldEta !== eta) {
              moveCardToNewHourBlock(existingCard, eta);
            }

          } else if (!existingCard || !isRefreshMode) {
            createFlightCard({ flightNum, arrType, eta, gate, tail, acType });
          }
        });
      }
    });
  };

  reader.readAsText(fileInput.files[0]);
});

function createFlightCard({ flightNum, arrType, eta, gate, tail, acType }) {
  const hour = parseInt(eta.split(':')[0], 10);
  let hourRow = document.querySelector(`#hourGrid .hour-row[data-hour="${hour}"]`);

  if (!hourRow) {
    hourRow = document.createElement('div');
    hourRow.classList.add('hour-row');
    hourRow.dataset.hour = hour;
    hourRow.innerHTML = `
      <div class="hour-label">${hour}</div>
      <div class="card-wrapper"></div>
    `;
    document.getElementById('hourGrid').appendChild(hourRow);
  }

  const wrapper = hourRow.querySelector('.card-wrapper');

  const card = document.createElement('div');
  card.classList.add('flight-card');
  card.setAttribute('data-flight', flightNum);
  card.setAttribute('data-eta', eta);

  card.innerHTML = `
    <div class="top-row">
      <div class="flight-num">${flightNum}</div>
      <div class="gate">${gate}</div>
    </div>
    <div class="bottom-row">
      <div class="tail">${tail}</div>
      <div class="ac-type">${acType}</div>
      <div class="eta">${eta}</div>
    </div>
  `;

  card.addEventListener('dblclick', () => {
    card.classList.toggle('dimmed');
  });

  wrapper.appendChild(card);
}

function moveCardToNewHourBlock(card, newEta) {
  const newHour = parseInt(newEta.split(':')[0], 10);
  card.setAttribute('data-eta', newEta);

  let newHourRow = document.querySelector(`#hourGrid .hour-row[data-hour="${newHour}"]`);
  if (!newHourRow) {
    newHourRow = document.createElement('div');
    newHourRow.classList.add('hour-row');
    newHourRow.dataset.hour = newHour;
    newHourRow.innerHTML = `
      <div class="hour-label">${newHour}</div>
      <div class="card-wrapper"></div>
    `;
    document.getElementById('hourGrid').appendChild(newHourRow);
  }

  const newWrapper = newHourRow.querySelector('.card-wrapper');
  newWrapper.appendChild(card);
}
