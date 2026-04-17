// Calculations Module - All financial calculations and logic
import { COINS_DATA } from './data.js';
import { formatNumberFull, convertToDollar } from './utils.js';

// Allocation calculation
export function computeAllocations(selectedCoins, risk) {
  if (selectedCoins.size === 0) return {};

  // Gather base weights for selected coins
  const selected = [...selectedCoins];
  const rawWeights = {};
  let total = 0;
  
  selected.forEach(id => {
    rawWeights[id] = COINS_DATA[id].baseWeight[risk] || 0.05;
    total += rawWeights[id];
  });

  // USDT reserve: always 10% liquid reserve
  const usdtReserve = 0.10;
  const cryptoShare = 1 - usdtReserve; // 0.90 always

  // Normalize crypto allocations to fill cryptoShare
  const allocs = {};
  selected.forEach(id => {
    allocs[id] = (rawWeights[id] / total) * cryptoShare;
  });
  allocs['usdt'] = usdtReserve;

  return allocs;
}

// Investment calculations
export function calculateInvestmentAmount(income, expenses, investmentPct) {
  const surplus = income - expenses;
  return investmentPct === 'auto' ? surplus : income * parseFloat(investmentPct);
}

export function calculateMonthlyInvestment(income, expenses, investmentPct) {
  const amount = calculateInvestmentAmount(income, expenses, investmentPct);
  const liquidReserve = amount * 0.10;
  return {
    total: amount,
    crypto: amount - liquidReserve,
    liquidReserve: liquidReserve
  };
}

// Portfolio projections
export function calculateProjections(monthlyCryptoInvestment, timeHorizon, scenarios = { conservative: 3, moderate: 10, optimistic: 20 }) {
  const yearlyInvestment = monthlyCryptoInvestment * 12;
  const totalInvested = yearlyInvestment * timeHorizon;
  
  return {
    yearly: yearlyInvestment,
    total: totalInvested,
    scenarios: {
      conservative: totalInvested * scenarios.conservative,
      moderate: totalInvested * scenarios.moderate,
      optimistic: totalInvested * scenarios.optimistic
    }
  };
}

// Risk analysis
export function calculateRiskScore(selectedCoins, risk) {
  const coins = [...selectedCoins];
  let totalScore = 0;
  let totalWeight = 0;

  coins.forEach(coinId => {
    const coin = COINS_DATA[coinId];
    const weight = coin.baseWeight[risk] || 0.05;
    totalScore += coin.strength * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

export function calculateSuccessProbability(selectedCoins) {
  const coins = [...selectedCoins];
  if (coins.length === 0) return 0;

  const totalProb = coins.reduce((sum, coinId) => {
    return sum + COINS_DATA[coinId].successProb;
  }, 0);

  return Math.round(totalProb / coins.length);
}

// Calendar calculations
export function calculateDailyAllocations(investmentAmount, allocations, selectedDays) {
  if (selectedDays.length === 0) return {};

  const numDays = selectedDays.length;
  const dailyAllocations = {};

  Object.entries(allocations).forEach(([coinId, percentage]) => {
    const coin = COINS_DATA[coinId];
    const monthlyAmount = investmentAmount * percentage;
    const dailyAmount = monthlyAmount / numDays;
    
    dailyAllocations[coinId] = {
      amount: dailyAmount,
      amountUSD: convertToDollar(dailyAmount, 1500), // Default rate, should be parameterized
      percentage: percentage,
      coin: coin
    };
  });

  return dailyAllocations;
}

// Summary calculations
export function calculateSummary(income, expenses, savings, investment, timeHorizon, allocations) {
  const surplus = income - expenses;
  const investmentRatio = income > 0 ? (investment / income) * 100 : 0;
  const savingsRatio = income > 0 ? (savings / income) * 100 : 0;
  
  // Calculate total crypto allocation percentage
  let cryptoPercentage = 0;
  Object.entries(allocations).forEach(([id, pct]) => {
    if (id !== 'usdt') {
      cryptoPercentage += pct * 100;
    }
  });

  return {
    surplus,
    investmentRatio,
    savingsRatio,
    cryptoPercentage,
    usdtPercentage: allocations.usdt ? allocations.usdt * 100 : 0,
    monthlyInvestment: investment,
    yearlyInvestment: investment * 12,
    totalInvestment: investment * 12 * timeHorizon
  };
}

// Validation calculations
export function validateFinancialData(data) {
  const { income, expenses, savings, timeHorizon, exchangeRate } = data;
  const errors = [];

  // Basic validation
  if (income <= 0) errors.push('Income must be positive');
  if (expenses < 0) errors.push('Expenses cannot be negative');
  if (savings < 0) errors.push('Savings cannot be negative');
  if (timeHorizon <= 0) errors.push('Time horizon must be positive');
  if (exchangeRate <= 0) errors.push('Exchange rate must be positive');

  // Logical validation
  if (income <= expenses) errors.push('Income must be greater than expenses');
  
  // Practical validation
  const surplus = income - expenses;
  if (surplus < income * 0.05) errors.push('Surplus should be at least 5% of income for sustainable investing');
  if (savings > income * 12) errors.push('Savings seem unusually high compared to income');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Performance metrics
export function calculatePortfolioMetrics(allocations, selectedCoins) {
  const coins = [...selectedCoins];
  const metrics = {
    diversificationScore: 0,
    riskLevel: 'low',
    volatilityScore: 0,
    growthPotential: 0
  };

  if (coins.length === 0) return metrics;

  // Diversification score (more coins = better diversification)
  metrics.diversificationScore = Math.min((coins.length / 10) * 100, 100);

  // Risk level based on allocation
  let totalRisk = 0;
  let totalWeight = 0;
  
  coins.forEach(coinId => {
    const coin = COINS_DATA[coinId];
    const weight = allocations[coinId] || 0;
    
    // Risk scoring based on coin characteristics
    let coinRisk = 50; // baseline
    if (coin.strength >= 80) coinRisk -= 20; // lower risk for strong coins
    if (coin.strength < 60) coinRisk += 20; // higher risk for weaker coins
    if (coin.isStable) coinRisk = 0; // no risk for stablecoins
    
    totalRisk += coinRisk * weight;
    totalWeight += weight;
  });

  const avgRisk = totalWeight > 0 ? totalRisk / totalWeight : 50;
  
  if (avgRisk < 30) metrics.riskLevel = 'low';
  else if (avgRisk < 60) metrics.riskLevel = 'moderate';
  else metrics.riskLevel = 'high';

  // Volatility score (inverse of stability)
  metrics.volatilityScore = Math.round(avgRisk);

  // Growth potential
  let totalGrowth = 0;
  coins.forEach(coinId => {
    const coin = COINS_DATA[coinId];
    const weight = allocations[coinId] || 0;
    
    // Estimate growth potential from success probability
    const growthPotential = coin.successProb * (coin.strength / 100);
    totalGrowth += growthPotential * weight;
  });

  metrics.growthPotential = Math.round(totalGrowth);

  return metrics;
}

// Scenario analysis
export function runScenarioAnalysis(allocations, selectedCoins, timeHorizon) {
  const scenarios = {
    bear: { multiplier: 0.3, probability: 0.2 },
    stagnant: { multiplier: 1, probability: 0.3 },
    bull: { multiplier: 3, probability: 0.3 },
    euphoric: { multiplier: 10, probability: 0.2 }
  };

  const results = {};

  Object.entries(scenarios).forEach(([scenarioName, scenario]) => {
    let expectedReturn = 0;
    
    selectedCoins.forEach(coinId => {
      const coin = COINS_DATA[coinId];
      const allocation = allocations[coinId] || 0;
      
      // Base return from scenario multiplier
      let coinReturn = scenario.multiplier;
      
      // Adjust based on coin strength
      if (scenarioName === 'bear') {
        coinReturn *= (coin.strength / 100); // Stronger coins fare better in bear market
      } else if (scenarioName === 'euphoric') {
        coinReturn *= (2 - coin.strength / 100); // Weaker coins may have higher upside
      }
      
      expectedReturn += coinReturn * allocation;
    });

    results[scenarioName] = {
      expectedReturn,
      probability: scenario.probability,
      description: getScenarioDescription(scenarioName)
    };
  });

  return results;
}

function getScenarioDescription(scenario) {
  const descriptions = {
    bear: 'Severe market downturn with prolonged bear market conditions',
    stagnant: 'Sideways market with minimal growth over extended period',
    bull: 'Strong bull market with sustained upward momentum',
    euphoric: 'Exceptional bull market with parabolic growth phase'
  };
  return descriptions[scenario] || 'Unknown scenario';
}

// Investment recommendations
export function generateRecommendations(data, allocations, selectedCoins) {
  const recommendations = [];
  const { income, expenses, savings, timeHorizon, risk } = data;

  // Investment ratio recommendations
  const surplus = income - expenses;
  const investmentRatio = (surplus / income) * 100;
  
  if (investmentRatio < 10) {
    recommendations.push({
      type: 'warning',
      title: 'Low Investment Ratio',
      message: `You're only investing ${investmentRatio.toFixed(1)}% of your income. Consider increasing to 15-20% for better long-term growth.`,
      priority: 'high'
    });
  }

  if (investmentRatio > 50) {
    recommendations.push({
      type: 'warning',
      title: 'High Investment Ratio',
      message: `You're investing ${investmentRatio.toFixed(1)}% of your income. Ensure you maintain adequate emergency funds.`,
      priority: 'medium'
    });
  }

  // Emergency fund recommendations
  const monthlyExpenses = expenses;
  const emergencyMonths = savings / monthlyExpenses;
  
  if (emergencyMonths < 3) {
    recommendations.push({
      type: 'critical',
      title: 'Insufficient Emergency Fund',
      message: `You have only ${emergencyMonths.toFixed(1)} months of expenses saved. Build up to 3-6 months before aggressive investing.`,
      priority: 'high'
    });
  }

  // Time horizon recommendations
  if (timeHorizon < 3 && risk === 'high') {
    recommendations.push({
      type: 'warning',
      title: 'Short Time Horizon with High Risk',
      message: 'Consider reducing risk tolerance for short investment periods to minimize potential losses.',
      priority: 'medium'
    });
  }

  // Diversification recommendations
  if (selectedCoins.size < 3) {
    recommendations.push({
      type: 'info',
      title: 'Limited Diversification',
      message: 'Consider adding more cryptocurrencies to diversify risk and improve potential returns.',
      priority: 'low'
    });
  }

  // Portfolio balance recommendations
  const btcAllocation = allocations.btc || 0;
  if (btcAllocation < 0.3 && risk !== 'low') {
    recommendations.push({
      type: 'info',
      title: 'Low Bitcoin Allocation',
      message: 'Consider increasing Bitcoin allocation for stability, especially in volatile markets.',
      priority: 'low'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Export utilities
export function prepareExportData(data, allocations, selectedCoins) {
  return {
    personal: {
      income: data.income,
      expenses: data.expenses,
      savings: data.savings,
      timeHorizon: data.timeHorizon,
      riskTolerance: data.risk,
      exchangeRate: data.exchangeRate
    },
    portfolio: {
      selectedCoins: [...selectedCoins].map(id => ({
        id,
        name: COINS_DATA[id].name,
        ticker: COINS_DATA[id].ticker,
        allocation: allocations[id],
        amount: data.investmentAmount * (allocations[id] || 0)
      })),
      totalInvestment: data.investmentAmount,
      usdtReserve: data.investmentAmount * (allocations.usdt || 0)
    },
    projections: calculateProjections(
      data.investmentAmount * (1 - (allocations.usdt || 0)),
      data.timeHorizon
    ),
    metrics: calculatePortfolioMetrics(allocations, selectedCoins),
    timestamp: new Date().toISOString()
  };
}
