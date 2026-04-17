// UI Module - All user interface rendering and interactions
import { COINS_DATA, SELECTABLE_COINS, DEFAULT_SELECTED_COINS, RISK_TEXTS, FORM_FIELDS } from './data.js';
import { 
  formatNumber, formatNumberFull, convertToDollar, 
  getElement, setText, setHTML, addClass, removeClass, toggleClass,
  setLoading, setButtonLoading, showError, removeError, clearAllErrors,
  animateValue, fadeIn, fadeOut, announceToScreenReader
} from './utils.js';
import { computeAllocations, calculateProjections, calculatePortfolioMetrics } from './calculations.js';

let portfolioChart = null;
let selectedCoins = new Set(DEFAULT_SELECTED_COINS);

// Coin selector rendering
export function renderCoinSelector() {
  const grid = getElement('coinSelectorGrid');
  if (!grid) return;

  grid.innerHTML = '';
  
  SELECTABLE_COINS.forEach(id => {
    const coin = COINS_DATA[id];
    const isSelected = selectedCoins.has(id);
    const weight = coin.baseWeight['moderate'];

    const item = document.createElement('div');
    item.className = 'coin-selector-item' + (isSelected ? ' selected' : '');
    item.style.setProperty('--coin-color', coin.color);
    item.dataset.id = id;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-pressed', isSelected);
    item.setAttribute('aria-label', `${coin.name} (${coin.ticker}) - ${isSelected ? 'Selected' : 'Not selected'}`);

    item.innerHTML = `
      <div class="coin-check">${isSelected ? '\u2713' : ''}</div>
      <div class="coin-selector-icon" style="background:${coin.iconBg};padding:4px;overflow:hidden">
        <img src="${coin.logo}" alt="${coin.ticker}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 2px rgba(0,0,0,0.4))" onerror="this.parentElement.textContent='${coin.icon}'">
      </div>
      <div class="coin-selector-info">
        <div class="coin-selector-name">${coin.name}</div>
        <div class="coin-selector-ticker">${coin.ticker} \u00b7 Strength: ${coin.strength}/100</div>
        <div class="coin-strength-bar" style="margin-top:5px">
          <div class="coin-strength-fill" style="width:${coin.strength}%;background:${coin.color}"></div>
        </div>
      </div>
      <div class="coin-selector-weight">w${(weight*100).toFixed(0)}%</div>
    `;

    // Event listeners
    item.addEventListener('click', () => toggleCoin(id));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCoin(id);
      }
    });

    grid.appendChild(item);
  });

  updateSelectorInfo();
  announceToScreenReader(`Coin selector updated. ${selectedCoins.size} coins selected.`);
}

export function toggleCoin(id) {
  if (selectedCoins.has(id)) {
    if (selectedCoins.size <= 1) {
      announceToScreenReader('You must select at least one coin.');
      return;
    }
    selectedCoins.delete(id);
    announceToScreenReader(`${COINS_DATA[id].name} deselected.`);
  } else {
    selectedCoins.add(id);
    announceToScreenReader(`${COINS_DATA[id].name} selected.`);
  }
  renderCoinSelector();
  // Trigger update plan
  const updateEvent = new CustomEvent('planUpdate', { detail: { selectedCoins } });
  document.dispatchEvent(updateEvent);
}

// Coin selection controls
export function selectAllCoins() {
  SELECTABLE_COINS.forEach(id => selectedCoins.add(id));
  renderCoinSelector();
  announceToScreenReader('All coins selected.');
}

export function selectDefaultCoins() {
  selectedCoins = new Set(DEFAULT_SELECTED_COINS);
  renderCoinSelector();
  announceToScreenReader('Default coins selected.');
}

export function clearAllCoins() {
  selectedCoins = new Set(['btc']); // Keep at least one coin
  renderCoinSelector();
  announceToScreenReader('Coin selection cleared. Only Bitcoin remains selected.');
}

export function updateSelectorInfo() {
  const countElement = getElement('selectedCoinCount');
  const cryptoElement = getElement('cryptoTotalPct');
  const usdtElement = getElement('usdtReservePct');

  if (countElement) setText('selectedCoinCount', selectedCoins.size);
  if (cryptoElement) setText('cryptoTotalPct', '90%');
  if (usdtElement) setText('usdtReservePct', '10%');
}

// Statistics rendering
export function renderStatistics(data) {
  const { income, expenses, investmentAmount, liquidReserve, savings, timeHorizon, exchangeRate } = data;

  // Update stat cards with animation
  updateStatCard('stat-income', income, exchangeRate);
  updateStatCard('stat-expenses', expenses, exchangeRate, 'red');
  updateStatCard('monthly-investment', investmentAmount, exchangeRate, 'accent');
  updateStatCard('stat-emergency', liquidReserve, exchangeRate, 'accent5');
  updateStatCard('stat-savings', savings, exchangeRate);
  setText('stat-horizon', `${timeHorizon} years`);
}

function updateStatCard(baseId, value, exchangeRate, color = null) {
  const element = getElement(baseId);
  const usdElement = getElement(`${baseId}-usd`);
  
  if (element) {
    const formattedValue = formatNumber(value);
    if (element.textContent !== formattedValue) {
      animateValue(element, parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0, value);
    }
    if (color) element.style.color = `var(--${color})`;
  }
  
  if (usdElement) {
    const usdValue = convertToDollar(value, exchangeRate);
    setText(`${baseId}-usd`, formatNumberFull(usdValue));
  }
}

// Allocation table rendering
export function renderAllocationTable(allocations, investmentAmount, exchangeRate) {
  const tbody = getElement('alloc-tbody');
  if (!tbody) return;

  let html = '';
  let totalCryptoInvestment = 0;

  Object.entries(allocations).forEach(([id, pct]) => {
    const coin = COINS_DATA[id];
    const amount = investmentAmount * pct;
    const pctDisplay = (pct * 100).toFixed(2);
    const isUSDT = id === 'usdt';
    const colorVar = isUSDT ? '#26a17b' : coin.color;
    
    if (!isUSDT) totalCryptoInvestment += amount;

    html += `
      <tr>
        <td>
          <span class="coin-badge">
            <img src="${coin.logo}" alt="${coin.ticker}" style="width:22px;height:22px;object-fit:contain;border-radius:50%;background:${colorVar}22;padding:2px;flex-shrink:0" onerror="this.style.display='none'">
            ${coin.name}${isUSDT ? ' (Liquid Reserve)' : ''}
          </span>
        </td>
        <td style="color:${colorVar};font-weight:700">${pctDisplay}%</td>
        <td style="font-family:'Rajdhani';font-size:15px;font-weight:700" id="alloc-${id}-amt" data-monthly-amount="${amount}">${formatNumberFull(amount)}</td>
        <td style="font-family:'Rajdhani';font-size:13px;color:var(--text2)">$${formatNumberFull(amount / exchangeRate)}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pctDisplay}%;background:${colorVar}"></div>
          </div>
        </td>
      </tr>`;
  });

  // Total row
  html += `
    <tr style="border-top:2px solid var(--border)">
      <td style="font-weight:700;color:var(--text)">Total</td>
      <td style="font-weight:900;color:var(--green)">100%</td>
      <td style="font-family:'Rajdhani';font-size:15px;font-weight:900;color:var(--green)">${formatNumberFull(investmentAmount)}</td>
      <td style="font-family:'Rajdhani';font-size:13px;font-weight:700;color:var(--green)">$${formatNumberFull(investmentAmount / exchangeRate)}</td>
      <td></td>
    </tr>`;

  setHTML('alloc-tbody', html);
}

// Risk analysis rendering
export function renderRiskAnalysis(selectedCoins) {
  const probGrid = getElement('prob-grid-dynamic');
  if (!probGrid) return;

  let html = '';
  
  selectedCoins.forEach(id => {
    const coin = COINS_DATA[id];
    html += `
      <div class="prob-card">
        <div class="prob-coin" style="display:flex;align-items:center;justify-content:center;gap:8px">
          <img src="${coin.logo}" alt="${coin.ticker}" style="width:24px;height:24px;object-fit:contain" onerror="this.style.display='none'">
          ${coin.name}
        </div>
        <div class="prob-circle" style="background:color-mix(in srgb,${coin.color} 10%,transparent);border:3px solid color-mix(in srgb,${coin.color} 40%,transparent)">
          <div class="pct" style="color:${coin.color}">${coin.successProb}%</div>
          <div class="lbl" style="color:var(--text3)">Success Probability</div>
        </div>
        <div class="prob-verdict">
          <div class="v-title">${coin.riskIcon} ${coin.riskLabel}</div>
          ${coin.riskNote}
        </div>
      </div>`;
  });

  setHTML('prob-grid-dynamic', html);
}

// Scenario table rendering
export function renderScenarioTable(selectedCoins) {
  const tbody = getElement('scenario-tbody');
  if (!tbody) return;

  let html = '';
  
  selectedCoins.forEach(id => {
    const coin = COINS_DATA[id];
    const probBadgeClass = coin.successProb >= 70 ? 'badge-green' : 'badge-orange';
    
    html += `
      <tr>
        <td><strong>${coin.ticker}</strong></td>
        <td><span class="${probBadgeClass}">${coin.successProb}%</span></td>
        <td>${coin.scenario.cons}</td>
        <td><span class="${coin.modBadge}">${coin.scenario.mod}</span></td>
        <td><span class="${coin.optBadge}">${coin.scenario.opt}</span></td>
      </tr>`;
  });

  setHTML('scenario-tbody', html);
}

// Summary rendering
export function renderSummary(projections) {
  setText('yearly-investment', formatNumber(projections.yearly));
  setText('total-invested', formatNumber(projections.total));
  setText('scenario-conservative', formatNumber(projections.scenarios.conservative));
  setText('scenario-moderate', formatNumber(projections.scenarios.moderate));
  setText('scenario-optimistic', formatNumber(projections.scenarios.optimistic));
}

// Risk verdict
export function renderRiskVerdict(risk) {
  const riskText = RISK_TEXTS[risk] || RISK_TEXTS.moderate;
  setText('risk-text', riskText);
}

// Currency converter
export function updateCurrencyConverter(exchangeRate) {
  const dinarInput = getElement('converterDinar');
  const dollarDisplay = getElement('converterDollar');
  const rateDisplay = getElement('currentRate');

  if (rateDisplay) setText('currentRate', formatNumberFull(exchangeRate));

  if (dinarInput && dollarDisplay) {
    const dinars = parseFloat(dinarInput.value) || 0;
    dollarDisplay.textContent = formatNumberFull(convertToDollar(dinars, exchangeRate));
  }
}

export function convertToDollar() {
  const dinarInput = getElement('converterDinar');
  const exchangeRateInput = getElement('exchangeRate');
  const dollarDisplay = getElement('converterDollar');

  if (!dinarInput || !exchangeRateInput || !dollarDisplay) return;

  const dinars = parseFloat(dinarInput.value) || 0;
  const rate = parseFloat(exchangeRateInput.value) || 1500;
  
  dollarDisplay.textContent = formatNumberFull(convertToDollar(dinars, rate));
}

// Calendar rendering
export function renderCalendar(allocations, investmentAmount, exchangeRate) {
  const selectedDays = getSelectedDays();
  const headerElement = getElement('calendarHeader');
  const bodyElement = getElement('calendarBody');

  if (!headerElement || !bodyElement) return;

  // Build header
  let headerHtml = '<th>Day</th>';
  Object.keys(allocations).forEach(id => {
    const coin = COINS_DATA[id];
    headerHtml += `
      <th style="color:${coin?.color || '#fff'}">
        <div style="display:flex;align-items:center;justify-content:center;gap:4px">
          <img src="${coin?.logo || ''}" alt="${coin?.ticker || id}" style="width:16px;height:16px;object-fit:contain" onerror="this.style.display='none'">
          ${coin?.ticker || id.toUpperCase()}
        </div>
      </th>`;
  });
  headerHtml += '<th>Total</th>';
  headerElement.innerHTML = headerHtml;

  // Build body
  if (selectedDays.length === 0) {
    bodyElement.innerHTML = '<tr><td colspan="20" style="text-align:center;color:var(--text3);padding:20px">Select days to display investment distribution</td></tr>';
    return;
  }

  let bodyHtml = '';
  const numDays = selectedDays.length;

  selectedDays.forEach(day => {
    let total = 0;
    let cells = '';

    Object.entries(allocations).forEach(([id, pct]) => {
      const coin = COINS_DATA[id];
      const amt = (investmentAmount * pct) / numDays;
      total += amt;
      
      cells += `
        <td style="color:${coin?.color || '#fff'};font-family:'Rajdhani';font-size:12px">
          ${formatNumberFull(amt)}<br>
          <span style="font-size:10px;color:var(--text3)">$${formatNumberFull(amt/exchangeRate)}</span>
        </td>`;
    });

    bodyHtml += `
      <tr>
        <td style="font-weight:700">${day}</td>
        ${cells}
        <td style="font-weight:700;color:var(--text);font-family:'Rajdhani';font-size:12px">
          ${formatNumberFull(total)}<br>
          <span style="font-size:10px;color:var(--green)">$${formatNumberFull(total/exchangeRate)}</span>
        </td>
      </tr>`;
  });

  bodyElement.innerHTML = bodyHtml;
}

// Day selector
export function initializeDaySelector() {
  const container = getElement('daySelector');
  if (!container) return;

  let html = '';
  for (let day = 1; day <= 31; day++) {
    const isChecked = [1,10,20].includes(day) ? 'checked' : '';
    html += `
      <label class="day-item">
        <input type="checkbox" id="day-${day}" ${isChecked} onchange="handleDayChange()" style="cursor:pointer;width:14px;height:14px">
        <span>${day}</span>
      </label>`;
  }
  container.innerHTML = html;
}

export function getSelectedDays() {
  const selectedDays = [];
  for (let d = 1; d <= 31; d++) {
    const checkbox = getElement(`day-${d}`);
    if (checkbox && checkbox.checked) {
      selectedDays.push(d);
    }
  }
  return selectedDays;
}

export function selectAllDays() {
  for (let d = 1; d <= 31; d++) {
    const checkbox = getElement(`day-${d}`);
    if (checkbox) checkbox.checked = true;
  }
  announceToScreenReader('All days selected for investment.');
  handleDayChange();
}

export function clearAllDays() {
  for (let d = 1; d <= 31; d++) {
    const checkbox = getElement(`day-${d}`);
    if (checkbox) checkbox.checked = false;
  }
  announceToScreenReader('All days cleared.');
  handleDayChange();
}

export function selectCommonDays() {
  clearAllDays();
  [1,10,20].forEach(day => {
    const checkbox = getElement(`day-${day}`);
    if (checkbox) checkbox.checked = true;
  });
  announceToScreenReader('Common investment days selected (1st, 10th, 20th).');
  handleDayChange();
}

export function handleDayChange() {
  // Trigger calendar update
  const updateEvent = new CustomEvent('calendarUpdate');
  document.dispatchEvent(updateEvent);
}

// Charts
export function updateCharts(allocations, investmentAmount, exchangeRate) {
  try {
    const canvas = getElement('portfolioChart');
    if (!canvas || !window.Chart) return;

    if (portfolioChart) {
      portfolioChart.destroy();
    }

    const labels = [];
    const data = [];
    const colors = [];

    Object.entries(allocations).forEach(([id, pct]) => {
      const coin = COINS_DATA[id];
      labels.push(coin ? coin.ticker : id.toUpperCase());
      data.push(parseFloat((pct * 100).toFixed(2)));
      colors.push(coin ? coin.color + 'cc' : '#ffffff44');
    });

    portfolioChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#080c10',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#e8edf2',
              font: { family: "'Cairo'" }
            },
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const amount = investmentAmount * (value / 100);
                return `${label}: ${value.toFixed(2)}% ($${formatNumberFull(amount / exchangeRate)})`;
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Chart error:', error);
  }
}

// Investment percentage preview
export function updateInvestmentPreview(income, expenses, investmentPct, exchangeRate) {
  const surplus = income - expenses;
  const investmentAmount = investmentPct === 'auto' ? surplus : income * parseFloat(investmentPct);

  setText('investment-pct-preview', formatNumberFull(investmentAmount));
  setText('investment-pct-preview-usd', formatNumberFull(investmentAmount / exchangeRate));
}

// Loading states
export function showLoading(elementId, message = 'Loading...') {
  const element = getElement(elementId);
  if (element) {
    setLoading(elementId, true);
    announceToScreenReader(message);
  }
}

export function hideLoading(elementId) {
  const element = getElement(elementId);
  if (element) {
    setLoading(elementId, false);
  }
}

// Error display
export function showFormErrors(errors) {
  clearAllErrors();
  
  Object.entries(errors).forEach(([fieldId, fieldErrors]) => {
    showError(fieldId, fieldErrors);
  });

  // Announce first error to screen readers
  const firstError = Object.values(errors)[0];
  if (firstError) {
    announceToScreenReader(`Form error: ${Array.isArray(firstError) ? firstError[0] : firstError}`);
  }
}

// Success messages
export function showSuccess(message) {
  // Create success notification
  const notification = document.createElement('div');
  notification.className = 'alert-box info';
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    <div class="alert-icon">\u2705</div>
    <div class="alert-text"><strong>Success:</strong> ${message}</div>
  `;
  
  // Insert after header
  const header = document.querySelector('.header');
  if (header) {
    header.parentNode.insertBefore(notification, header.nextSibling);
    fadeIn(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      fadeOut(notification);
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  announceToScreenReader(`Success: ${message}`);
}

// Responsive utilities
export function handleResize() {
  // Update any responsive elements
  const width = window.innerWidth;
  
  // Adjust grid layouts if needed
  if (width < 768) {
    addClass('container', 'mobile-layout');
  } else {
    removeClass('container', 'mobile-layout');
  }
}

// Initialize event listeners
export function initializeEventListeners() {
  // Form field listeners
  FORM_FIELDS.forEach(fieldId => {
    const element = getElement(fieldId);
    if (element) {
      element.addEventListener('change', () => {
        removeError(fieldId);
        const updateEvent = new CustomEvent('planUpdate');
        document.dispatchEvent(updateEvent);
      });
      
      element.addEventListener('input', () => {
        // Clear error on input
        if (element.classList.contains('error')) {
          removeError(fieldId);
        }
      });
    }
  });

  // Window resize
  window.addEventListener('resize', handleResize);
  
  // Custom event listeners
  document.addEventListener('planUpdate', () => {
    // This will be handled by the main app
  });
  
  document.addEventListener('calendarUpdate', () => {
    // This will be handled by the main app
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close any open modals or reset focus
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('coin-selector-item')) {
        activeElement.blur();
      }
    }
  });

  // Initialize resize handler
  handleResize();
}

// Get selected coins
export function getSelectedCoins() {
  return new Set(selectedCoins);
}

// Set selected coins
export function setSelectedCoins(coins) {
  selectedCoins = new Set(coins);
  renderCoinSelector();
}
