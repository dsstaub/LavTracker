document.getElementById('uploadBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('csvInput');
  const isRefreshMode = document.getElementById('refreshToggle').checked;

  if (fileInput.files.length === 0) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').slice(1);
    const data = lines.map(line => line.split(',')).filter(row => row.length > 10);

    if (!isRefreshMode) {
      document.getElementById('flightBoard').innerHTML = '';
    }

    data.forEach(row => {
      const flightNum = row[0].trim();
      const carrier = row[1].trim();
      const eta = row[8].trim(); // ETA = column 9
      const gate = row[13].trim(); // Gate = column 14
      const tail = row[26].trim(); // Tail = column 27
      const acType = row[27].trim(); // Aircraft type = column 28
      const arrType = row[11].trim(); // Arr. Type = column 12

      if (!flightNum || !arrType || carrier !== 'AA') return;

      const isMainline = ['0001','2949','6300','6349'].some((_, i, arr) =>
        parseInt(flightNum) >= parseInt(arr[i]) && parseInt(flightNum) <= parseInt(arr[i + 1])
      );

      const hourBlock = parseInt(eta.split(':')[0]);
      const board = document.getElementById('flightBoard');
      let hourRow = board.querySelector(`.hour-${hourBlock}`);
      if (!hourRow) {
        hourRow = document.createElement('div');
        hourRow.className = `hour-row hour-${hourBlock}`;
        hourRow.innerHTML = `<div class="hour-label">${hourBlock}</div><div class="card-container"></div>`;
        board.appendChild(hourRow);
      }

      const cardContainer = hourRow.querySelector('.card-container');
      const existingCard = board.querySelector(`.flight-card[data-flight="${flightNum}"]`);

      if (existingCard) {
        const oldETA = existingCard.getAttribute('data-eta');
        existingCard.querySelector('.gate').textContent = gate;
        existingCard.querySelector('.tail').textContent = tail;
        existingCard.querySelector('.ac-type').textContent = acType;
        existingCard.setAttribute('data-eta', eta);

        if (oldETA !== eta) {
          existingCard.remove();
          cardContainer.appendChild(existingCard);
        }
      } else {
        const card = document.createElement('div');
        card.className = `flight-card ${isMainline ? 'mainline' : 'regional'}`;
        card.setAttribute('data-flight', flightNum);
        card.setAttribute('data-eta', eta);

        card.innerHTML = `
          <div class="top-row">
            <div class="flight-num">${flightNum}</div>
            <div class="gate">${gate}</div>
          </div>
          <div class="bottom-row">
            <div class="status">${arrType}</div>
            <div class="ac-type">${acType}</div>
            <div class="countdown">${getCountdown(eta)}</div>
          </div>
        `;

        card.addEventListener('dblclick', () => {
          card.classList.toggle('dimmed');
        });

        cardContainer.appendChild(card);
      }
    });
  };

  reader.readAsText(fileInput.files[0]);
});

function getCountdown(etaStr) {
  const now = new Date();
  const [h, m] = etaStr.split(':').map(Number);
  const eta = new Date(now);
  eta.setHours(h, m, 0, 0);
  const diffMs = eta - now;
  const diffMin = Math.floor(diffMs / 60000);
  return diffMin >= 0 ? `${diffMin}m` : `-${Math.abs(diffMin)}m`;
}
