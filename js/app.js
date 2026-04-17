// Main App Module - Application entry point and coordination
import { DEFAULT_CONFIG, FORM_FIELDS, LOADING_STATES } from './data.js';
import { 
  validateForm, sanitizeInput, sanitizeNumber, saveToStorage, loadFromStorage,
  debounce, getCurrentMonthYear
} from './utils.js';
import { 
  computeAllocations, calculateInvestmentAmount, calculateProjections,
  validateFinancialData, generateRecommendations
} from './calculations.js';
import {
  renderCoinSelector, getSelectedCoins, setSelectedCoins,
  renderStatistics, renderAllocationTable, renderRiskAnalysis,
  renderScenarioTable, renderSummary, renderRiskVerdict,
  updateCurrencyConverter, convertToDollar,
  initializeDaySelector, getSelectedDays, renderCalendar, updateCharts,
  updateInvestmentPreview, showFormErrors, showSuccess, initializeEventListeners
} from './ui.js';

class InvestmentPlanApp {
  constructor() {
    this.currentExchangeRate = 1500;
    this.isUpdating = false;
    this.debounceUpdate = debounce(() => this.performUpdate(), 300);
  }

  async init() {
    try {
      // Initialize UI components
      initializeEventListeners();
      renderCoinSelector();
      initializeDaySelector();
      
      // Load saved data
      this.loadSavedData();
      
      // Set up custom event listeners
      this.setupEventListeners();
      
      // Initial update if we have data
      const hasData = this.hasFormData();
      if (hasData) {
        await this.updatePlan();
      } else {
        this.updateSelectorInfo();
        convertToDollar();
      }
      
      // Update last update time
      this.updateLastUpdateTime();
      
      console.log('Investment Plan App initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  setupEventListeners() {
    // Custom event listeners for component updates
    document.addEventListener('planUpdate', () => {
      this.debounceUpdate();
    });

    document.addEventListener('calendarUpdate', () => {
      this.updateCalendar();
    });

    // Button event listeners
    const updateButton = document.querySelector('[onclick="updatePlan()"]');
    if (updateButton) {
      updateButton.removeAttribute('onclick');
      updateButton.addEventListener('click', () => this.handleUpdateClick());
    }

    const defaultButton = document.querySelector('[onclick="loadDefaultValues()"]');
    if (defaultButton) {
      defaultButton.removeAttribute('onclick');
      defaultButton.addEventListener('click', () => this.loadDefaultValues());
    }

    const pdfButton = document.querySelector('[onclick="exportToPDF()"]');
    if (pdfButton) {
      pdfButton.removeAttribute('onclick');
      pdfButton.addEventListener('click', () => this.exportToPDF());
    }

    const excelButton = document.querySelector('[onclick="exportToExcel()"]');
    if (excelButton) {
      excelButton.removeAttribute('onclick');
      excelButton.addEventListener('click', () => this.exportToExcel());
    }

    // Coin selector buttons
    const selectAllButton = document.querySelector('[onclick="selectAllCoins()"]');
    if (selectAllButton) {
      selectAllButton.removeAttribute('onclick');
      selectAllButton.addEventListener('click', () => this.selectAllCoins());
    }

    const selectDefaultButton = document.querySelector('[onclick="selectDefaultCoins()"]');
    if (selectDefaultButton) {
      selectDefaultButton.removeAttribute('onclick');
      selectDefaultButton.addEventListener('click', () => this.selectDefaultCoins());
    }

    const clearAllButton = document.querySelector('[onclick="clearAllCoins()"]');
    if (clearAllButton) {
      clearAllButton.removeAttribute('onclick');
      clearAllButton.addEventListener('click', () => this.clearAllCoins());
    }

    // Calendar buttons
    const selectAllDaysButton = document.querySelector('[onclick="selectAllDays()"]');
    if (selectAllDaysButton) {
      selectAllDaysButton.removeAttribute('onclick');
      selectAllDaysButton.addEventListener('click', () => this.selectAllDays());
    }

    const clearAllDaysButton = document.querySelector('[onclick="clearAllDays()"]');
    if (clearAllDaysButton) {
      clearAllDaysButton.removeAttribute('onclick');
      clearAllDaysButton.addEventListener('click', () => this.clearAllDays());
    }

    const selectCommonDaysButton = document.querySelector('[onclick="selectCommonDays()"]');
    if (selectCommonDaysButton) {
      selectCommonDaysButton.removeAttribute('onclick');
      selectCommonDaysButton.addEventListener('click', () => this.selectCommonDays());
    }
  }

  async handleUpdateClick() {
    if (this.isUpdating) return;
    
    try {
      this.isUpdating = true;
      const button = document.querySelector('.btn-primary');
      if (button) {
        button.disabled = true;
        button.textContent = LOADING_STATES.updating;
      }

      await this.updatePlan();
      showSuccess('Investment plan updated successfully!');
      
    } catch (error) {
      console.error('Update failed:', error);
      this.showError('Failed to update plan. Please check your input and try again.');
    } finally {
      this.isUpdating = false;
      const button = document.querySelector('.btn-primary');
      if (button) {
        button.disabled = false;
        button.innerHTML = '\ud83d\udcca Update Plan';
      }
    }
  }

  async updatePlan() {
    try {
      // Get and validate form data
      const formData = this.getFormData();
      const validation = validateForm(formData);
      
      if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
      }

      // Clear any existing errors
      this.clearAllErrors();

      // Sanitize and parse data
      const data = this.parseFormData(formData);
      
      // Validate financial logic
      const financialValidation = validateFinancialData(data);
      if (!financialValidation.isValid) {
        this.showError(financialValidation.errors.join(', '));
        return;
      }

      // Update exchange rate
      this.currentExchangeRate = data.exchangeRate;
      this.updateCurrencyConverter(data.exchangeRate);

      // Calculate investment amount
      const investmentAmount = calculateInvestmentAmount(data.income, data.expenses, data.investmentPct);
      
      // Update investment preview
      updateInvestmentPreview(data.income, data.expenses, data.investmentPct, data.exchangeRate);

      // Calculate allocations
      const selectedCoins = getSelectedCoins();
      const allocations = computeAllocations(selectedCoins, data.risk);

      // Update all UI components
      this.updateUI(data, investmentAmount, allocations, selectedCoins);

      // Save to storage
      this.saveData(data, selectedCoins);

      // Generate and display recommendations
      const recommendations = generateRecommendations(data, allocations, selectedCoins);
      this.displayRecommendations(recommendations);

    } catch (error) {
      console.error('Update plan error:', error);
      this.showError('An error occurred while updating the plan.');
    }
  }

  updateUI(data, investmentAmount, allocations, selectedCoins) {
    // Update statistics
    const liquidReserve = investmentAmount * 0.10;
    renderStatistics({
      income: data.income,
      expenses: data.expenses,
      investmentAmount,
      liquidReserve,
      savings: data.savings,
      timeHorizon: data.timeHorizon,
      exchangeRate: data.exchangeRate
    });

    // Update allocation table
    renderAllocationTable(allocations, investmentAmount, data.exchangeRate);

    // Update risk analysis
    renderRiskAnalysis(selectedCoins);
    renderScenarioTable(selectedCoins);
    renderRiskVerdict(data.risk);

    // Update summary
    const cryptoInvestment = investmentAmount - liquidReserve;
    const projections = calculateProjections(cryptoInvestment, data.timeHorizon);
    renderSummary(projections);

    // Update charts
    updateCharts(allocations, investmentAmount, data.exchangeRate);

    // Update calendar
    this.updateCalendar();

    // Update selector info
    this.updateSelectorInfo();
  }

  updateCalendar() {
    const data = this.parseFormData(this.getFormData());
    const selectedCoins = getSelectedCoins();
    const allocations = computeAllocations(selectedCoins, data.risk);
    const investmentAmount = calculateInvestmentAmount(data.income, data.expenses, data.investmentPct);
    
    renderCalendar(allocations, investmentAmount, data.exchangeRate);
  }

  getFormData() {
    const data = {};
    FORM_FIELDS.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        data[fieldId] = sanitizeInput(element.value);
      }
    });
    return data;
  }

  parseFormData(formData) {
    return {
      income: sanitizeNumber(formData.monthlyIncome),
      expenses: sanitizeNumber(formData.monthlyExpenses),
      savings: sanitizeNumber(formData.currentSavings),
      timeHorizon: sanitizeNumber(formData.timeHorizon),
      risk: formData.riskTolerance,
      exchangeRate: sanitizeNumber(formData.exchangeRate),
      investmentPct: formData.investmentPct
    };
  }

  hasFormData() {
    const income = document.getElementById('monthlyIncome')?.value;
    const expenses = document.getElementById('monthlyExpenses')?.value;
    return income && expenses && income !== '' && expenses !== '';
  }

  loadDefaultValues() {
    Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    showSuccess('Default values loaded successfully!');
  }

  loadSavedData() {
    try {
      const savedData = loadFromStorage('investmentPlanData');
      const savedCoins = loadFromStorage('selectedCoins');
      
      if (savedData) {
        Object.entries(savedData).forEach(([key, value]) => {
          const element = document.getElementById(key);
          if (element) {
            element.value = value;
          }
        });
      }
      
      if (savedCoins && Array.isArray(savedCoins)) {
        setSelectedCoins(savedCoins);
      }
      
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }

  saveData(data, selectedCoins) {
    try {
      saveToStorage('investmentPlanData', data);
      saveToStorage('selectedCoins', [...selectedCoins]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  updateSelectorInfo() {
    const selectedCoins = getSelectedCoins();
    document.getElementById('selectedCoinCount').textContent = selectedCoins.size;
    document.getElementById('cryptoTotalPct').textContent = '90%';
    document.getElementById('usdtReservePct').textContent = '10%';
  }

  updateCurrencyConverter(exchangeRate) {
    document.getElementById('currentRate').textContent = exchangeRate.toLocaleString();
    convertToDollar();
  }

  updateLastUpdateTime() {
    const element = document.getElementById('last-update');
    if (element) {
      element.textContent = getCurrentMonthYear();
    }
  }

  displayRecommendations(recommendations) {
    // Remove existing recommendations
    const existingContainer = document.getElementById('recommendations-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    if (recommendations.length === 0) return;

    const container = document.createElement('div');
    container.id = 'recommendations-container';
    container.className = 'section';
    
    const titleHtml = `
      <div class="section-title">
        <div class="icon" style="background:rgba(247,147,26,0.1)">\ud83d\udca1</div>
        <h2>Investment Recommendations</h2>
        <div class="line"></div>
      </div>
    `;

    const recommendationsHtml = recommendations.map(rec => {
      const alertClass = rec.type === 'critical' ? 'warning' : rec.type === 'warning' ? 'note' : 'info';
      const icon = rec.type === 'critical' ? '\u26a0\ufe0f' : rec.type === 'warning' ? '\ud83d\udccb' : '\ud83d\udca1';
      
      return `
        <div class="alert-box ${alertClass}">
          <div class="alert-icon">${icon}</div>
          <div class="alert-text">
            <strong>${rec.title}:</strong> ${rec.message}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = titleHtml + recommendationsHtml;

    // Insert after the input form section
    const inputSection = document.querySelector('.section');
    if (inputSection) {
      inputSection.parentNode.insertBefore(container, inputSection.nextSibling);
    }
  }

  // Export functions
  exportToPDF() {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const data = this.parseFormData(this.getFormData());
      const selectedCoins = getSelectedCoins();
      
      doc.text('Investment Financial Plan', 100, 20, { align: 'center' });
      doc.text(`Monthly Income: ${data.income.toLocaleString()} IQD`, 20, 40);
      doc.text(`Monthly Expenses: ${data.expenses.toLocaleString()} IQD`, 20, 50);
      doc.text(`Selected Coins: ${[...selectedCoins].map(id => id.toUpperCase()).join(', ')}`, 20, 60);
      doc.text(`Time Horizon: ${data.timeHorizon} years`, 20, 70);
      doc.text(`Date: ${new Date().toLocaleDateString('ar-IQ')}`, 20, 80);
      
      doc.save('investment-plan.pdf');
      showSuccess('PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      this.showError('Failed to export PDF. Please try again.');
    }
  }

  exportToExcel() {
    try {
      const data = this.parseFormData(this.getFormData());
      const selectedCoins = getSelectedCoins();
      const allocations = computeAllocations(selectedCoins, data.risk);
      
      const wb = XLSX.utils.book_new();
      const rows = [
        ['Personal Financial Plan'], [],
        ['Monthly Income', data.income],
        ['Monthly Expenses', data.expenses],
        ['Selected Coins', [...selectedCoins].map(id => id.toUpperCase()).join(', ')],
        ['Time Horizon (years)', data.timeHorizon], [],
        ['Coin', 'Percentage', 'Monthly Amount']
      ];
      
      Object.entries(allocations).forEach(([id, pct]) => {
        const coinName = data.coinNames?.[id] || id.toUpperCase();
        rows.push([coinName, (pct * 100).toFixed(2) + '%', Math.round(data.investmentAmount * pct)]);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Plan');
      XLSX.writeFile(wb, 'investment-plan.xlsx');
      
      showSuccess('Excel file exported successfully!');
      
    } catch (error) {
      console.error('Excel export failed:', error);
      this.showError('Failed to export Excel file. Please try again.');
    }
  }

  // Coin selector methods
  selectAllCoins() {
    const allCoins = ['btc','eth','sol','link','bnb','avax','dot','ada','uni','aave'];
    setSelectedCoins(allCoins);
    this.debounceUpdate();
  }

  selectDefaultCoins() {
    setSelectedCoins(['btc','eth','sol','link']);
    this.debounceUpdate();
  }

  clearAllCoins() {
    setSelectedCoins(['btc']);
    this.debounceUpdate();
  }

  // Calendar methods
  selectAllDays() {
    for (let d = 1; d <= 31; d++) {
      const checkbox = document.getElementById(`day-${d}`);
      if (checkbox) checkbox.checked = true;
    }
    this.updateCalendar();
  }

  clearAllDays() {
    for (let d = 1; d <= 31; d++) {
      const checkbox = document.getElementById(`day-${d}`);
      if (checkbox) checkbox.checked = false;
    }
    this.updateCalendar();
  }

  selectCommonDays() {
    this.clearAllDays();
    [1, 10, 20].forEach(day => {
      const checkbox = document.getElementById(`day-${day}`);
      if (checkbox) checkbox.checked = true;
    });
    this.updateCalendar();
  }

  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'alert-box warning';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
      <div class="alert-icon">\u26a0\ufe0f</div>
      <div class="alert-text"><strong>Error:</strong> ${message}</div>
    `;
    
    // Insert after header
    const header = document.querySelector('.header');
    if (header) {
      header.parentNode.insertBefore(notification, header.nextSibling);
      
      // Auto remove after 8 seconds for errors (longer than success messages)
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 8000);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new InvestmentPlanApp();
  window.app.init();
});

// Export for global access (for backward compatibility)
window.updatePlan = () => window.app?.handleUpdateClick();
window.loadDefaultValues = () => window.app?.loadDefaultValues();
window.exportToPDF = () => window.app?.exportToPDF();
window.exportToExcel = () => window.app?.exportToExcel();
window.selectAllCoins = () => window.app?.selectAllCoins();
window.selectDefaultCoins = () => window.app?.selectDefaultCoins();
window.clearAllCoins = () => window.app?.clearAllCoins();
window.selectAllDays = () => window.app?.selectAllDays();
window.clearAllDays = () => window.app?.clearAllDays();
window.selectCommonDays = () => window.app?.selectCommonDays();
window.convertToDollar = () => convertToDollar();
