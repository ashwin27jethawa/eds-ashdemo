export default function decorate(block) {
  // 1. Define the HTML Structure
  block.innerHTML = `
    <div class="form-wrapper">
      <h2>Contact Registration</h2>
      <form id="eds-local-form">
        <div class="field">
          <label>First Name</label>
          <input type="text" name="firstName" placeholder="e.g. Suresh" required>
        </div>
        <div class="field">
          <label>Last Name</label>
          <input type="text" name="lastName" placeholder="e.g. Jadhav" required>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" placeholder="suresh@example.com" required>
        </div>
        <div class="field">
          <label>Age</label>
          <input type="number" name="age" min="1" max="120">
        </div>
        <button type="submit" class="submit-btn">Submit & Save Locally</button>
      </form>
    </div>

    <div class="log-wrapper">
      <h3>Local Submission Log</h3>
      <div id="log-list" class="log-list"></div>
      <button id="clear-log" class="clear-btn">Clear All Data</button>
    </div>
  `;

  const form = block.querySelector('#eds-local-form');
  const logList = block.querySelector('#log-list');
  const clearBtn = block.querySelector('#clear-log');

  // 2. Function to Render Logs from LocalStorage
  const renderLogs = () => {
    const rawData = localStorage.getItem('form-data-log');
    const logs = rawData ? JSON.parse(rawData) : [];
    
    if (logs.length === 0) {
      logList.innerHTML = '<p class="empty-msg">No submissions yet.</p>';
      return;
    }

    logList.innerHTML = logs.map((entry, index) => `
      <div class="log-item">
        <span class="log-number">#${index + 1}</span>
        <div class="log-details">
          <strong>${entry.firstName} ${entry.lastName}</strong><br>
          <span>${entry.email} | Age: ${entry.age || 'N/A'}</span><br>
          <small>Submitted: ${entry.date}</small>
        </div>
      </div>
    `).reverse().join(''); // Show newest first
  };

  // 3. Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect data
    const formData = new FormData(form);
    const entry = Object.fromEntries(formData.entries());
    entry.date = new Date().toLocaleString();

    // Update LocalStorage
    const existingLogs = JSON.parse(localStorage.getItem('form-data-log') || '[]');
    existingLogs.push(entry);
    localStorage.setItem('form-data-log', JSON.stringify(existingLogs));

    // Reset and Refresh UI
    form.reset();
    renderLogs();
  });

  // 4. Handle Clear Button
  clearBtn.addEventListener('click', () => {
    if (confirm('Delete all local logs?')) {
      localStorage.removeItem('form-data-log');
      renderLogs();
    }
  });

  // Initial Load
  renderLogs();
}