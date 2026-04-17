// Data Module - All data and constants
export const COIN_LOGOS = {
  btc:  'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  eth:  'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  sol:  'https://cryptologos.cc/logos/solana-sol-logo.svg',
  link: 'https://cryptologos.cc/logos/chainlink-link-logo.svg',
  bnb:  'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  avax: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  dot:  'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg',
  ada:  'https://cryptologos.cc/logos/cardano-ada-logo.svg',
  uni:  'https://cryptologos.cc/logos/uniswap-uni-logo.svg',
  aave: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
  usdt: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
};

export const COINS_DATA = {
  btc:  { 
    id:'btc',  name:'Bitcoin',         ticker:'BTC',   icon:'BTC',   logo:COIN_LOGOS.btc,  color:'#f7931a', 
    iconBg:'linear-gradient(135deg,#f7931a,#e07b10)', 
    baseWeight:{ low:0.60, moderate:0.50, high:0.42 }, 
    strength:95, successProb:85, 
    scenario:{ cons:'3x - 5x', mod:'10x - 15x', opt:'20x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-green', 
    riskLabel:'Very Low Risk', riskNote:'17 years old, strong institutional adoption', riskIcon:'\u2705' 
  },
  eth:  { 
    id:'eth',  name:'Ethereum',        ticker:'ETH',   icon:'ETH',   logo:COIN_LOGOS.eth,  color:'#627eea', 
    iconBg:'linear-gradient(135deg,#627eea,#4a6bc8)', 
    baseWeight:{ low:0.20, moderate:0.22, high:0.22 }, 
    strength:80, successProb:72, 
    scenario:{ cons:'3x - 4x', mod:'8x - 12x', opt:'15x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-green', 
    riskLabel:'Reasonable Risk', riskNote:'Complete Web3 infrastructure, established position', riskIcon:'\u2705' 
  },
  sol:  { 
    id:'sol',  name:'Solana',          ticker:'SOL',   icon:'SOL',   logo:COIN_LOGOS.sol,  color:'#9945ff', 
    iconBg:'linear-gradient(135deg,#9945ff,#7b2fe0)', 
    baseWeight:{ low:0.10, moderate:0.16, high:0.20 }, 
    strength:65, successProb:60, 
    scenario:{ cons:'2x - 4x', mod:'5x - 20x', opt:'30x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-orange', 
    riskLabel:'Medium Risk', riskNote:'Fast growth but higher volatility', riskIcon:'\u26a0\ufe0f' 
  },
  link: { 
    id:'link', name:'Chainlink',       ticker:'LINK',  icon:'LINK',  logo:COIN_LOGOS.link, color:'#2775ca', 
    iconBg:'linear-gradient(135deg,#2775ca,#1a5aa0)', 
    baseWeight:{ low:0.10, moderate:0.12, high:0.16 }, 
    strength:70, successProb:65, 
    scenario:{ cons:'2x - 3x', mod:'5x - 10x', opt:'15x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-green', 
    riskLabel:'Low-Medium Risk', riskNote:'Core Oracle infrastructure for DeFi', riskIcon:'\u2705' 
  },
  bnb:  { 
    id:'bnb',  name:'BNB',             ticker:'BNB',   icon:'BNB',   logo:COIN_LOGOS.bnb,  color:'#f0b90b', 
    iconBg:'linear-gradient(135deg,#f0b90b,#c89608)', 
    baseWeight:{ low:0.08, moderate:0.12, high:0.16 }, 
    strength:72, successProb:68, 
    scenario:{ cons:'2x - 3x', mod:'5x - 8x',  opt:'12x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-green', 
    riskLabel:'Reasonable Risk', riskNote:'Binance coin, largest global exchange', riskIcon:'\u2705' 
  },
  avax: { 
    id:'avax', name:'Avalanche',       ticker:'AVAX',  icon:'AVAX',  logo:COIN_LOGOS.avax, color:'#e84142', 
    iconBg:'linear-gradient(135deg,#e84142,#c02d2e)', 
    baseWeight:{ low:0.06, moderate:0.10, high:0.14 }, 
    strength:62, successProb:58, 
    scenario:{ cons:'2x - 4x', mod:'6x - 15x', opt:'25x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-orange', 
    riskLabel:'Medium Risk', riskNote:'Fast Layer-1 with growing ecosystem', riskIcon:'\u26a0\ufe0f' 
  },
  dot:  { 
    id:'dot',  name:'Polkadot',        ticker:'DOT',   icon:'DOT',   logo:COIN_LOGOS.dot,  color:'#e6007a', 
    iconBg:'linear-gradient(135deg,#e6007a,#b00060)', 
    baseWeight:{ low:0.05, moderate:0.08, high:0.12 }, 
    strength:55, successProb:52, 
    scenario:{ cons:'2x - 3x', mod:'5x - 10x', opt:'15x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-orange', 
    riskLabel:'Medium-High Risk', riskNote:'Blockchain interoperability, ambitious project', riskIcon:'\u26a0\ufe0f' 
  },
  ada:  { 
    id:'ada',  name:'Cardano',         ticker:'ADA',   icon:'ADA',   logo:COIN_LOGOS.ada,  color:'#0033ad', 
    iconBg:'linear-gradient(135deg,#0033ad,#002288)', 
    baseWeight:{ low:0.05, moderate:0.08, high:0.10 }, 
    strength:53, successProb:50, 
    scenario:{ cons:'2x - 3x', mod:'4x - 8x',  opt:'12x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-orange', 
    riskLabel:'Medium Risk', riskNote:'Scientific approach, slow but wide base', riskIcon:'\u26a0\ufe0f' 
  },
  uni:  { 
    id:'uni',  name:'Uniswap',         ticker:'UNI',   icon:'UNI',   logo:COIN_LOGOS.uni,  color:'#ff007a', 
    iconBg:'linear-gradient(135deg,#ff007a,#cc005f)', 
    baseWeight:{ low:0.04, moderate:0.07, high:0.10 }, 
    strength:60, successProb:58, 
    scenario:{ cons:'2x - 3x', mod:'5x - 12x', opt:'20x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-orange', 
    riskLabel:'Medium Risk', riskNote:'Largest DEX, DeFi leader', riskIcon:'\u26a0\ufe0f' 
  },
  aave: { 
    id:'aave', name:'Aave',            ticker:'AAVE',  icon:'AAVE',  logo:COIN_LOGOS.aave, color:'#b6509e', 
    iconBg:'linear-gradient(135deg,#b6509e,#8d3d7a)', 
    baseWeight:{ low:0.04, moderate:0.06, high:0.09 }, 
    strength:60, successProb:57, 
    scenario:{ cons:'2x - 3x', mod:'5x - 10x', opt:'18x+' }, 
    modBadge:'badge-orange', optBadge:'badge-gold', probBadge:'badge-orange', 
    riskLabel:'Medium Risk', riskNote:'Leading DeFi lending protocol', riskIcon:'\u26a0\ufe0f' 
  },
  usdt: { 
    id:'usdt', name:'Tether (USDT)',   ticker:'USDT',  icon:'USDT',  logo:COIN_LOGOS.usdt, color:'#26a17b', 
    iconBg:'linear-gradient(135deg,#26a17b,#1a7a5c)', 
    baseWeight:{ low:0.00, moderate:0.00, high:0.00 }, 
    strength:100, successProb:99, 
    scenario:{ cons:'1x',     mod:'1x',      opt:'1x' }, 
    modBadge:'badge-green', optBadge:'badge-green', probBadge:'badge-green', 
    riskLabel:'Almost No Risk', riskNote:'Liquid reserve, automatically purchased', riskIcon:'\u2705', isStable:true 
  },
};

// Configuration constants
export const SELECTABLE_COINS = ['btc','eth','sol','link','bnb','avax','dot','ada','uni','aave'];
export const DEFAULT_SELECTED_COINS = new Set(['btc','eth','sol','link']);

export const DEFAULT_CONFIG = {
  monthlyIncome: 2000000, 
  monthlyExpenses: 500000, 
  currentSavings: 1300000,
  timeHorizon: 7, 
  riskTolerance: 'moderate', 
  exchangeRate: 1500
};

export const RISK_TEXTS = {
  low: '\u2705 Slow and safe investment - suitable for those who prefer security over rapid growth',
  moderate: '\u2705 Good balance between security and growth - suitable for most investors',
  high: '\u2705 Aggressive investment - suitable for those with high risk tolerance and long time horizon'
};

export const FORM_FIELDS = [
  'monthlyIncome', 
  'monthlyExpenses', 
  'currentSavings', 
  'timeHorizon', 
  'riskTolerance', 
  'exchangeRate', 
  'investmentPct'
];

// Validation rules
export const VALIDATION_RULES = {
  monthlyIncome: { min: 0, max: 10000000, required: true },
  monthlyExpenses: { min: 0, max: 10000000, required: true },
  currentSavings: { min: 0, max: 100000000, required: true },
  timeHorizon: { min: 1, max: 50, required: true },
  exchangeRate: { min: 1000, max: 10000, required: true },
  investmentPct: { required: true }
};

// Error messages
export const ERROR_MESSAGES = {
  required: 'This field is required',
  min: 'Value must be at least {min}',
  max: 'Value must not exceed {max}',
  invalid: 'Please enter a valid value',
  incomeLessExpenses: 'Income must be greater than expenses',
  negativeSurplus: 'Monthly surplus cannot be negative'
};

// Loading states
export const LOADING_STATES = {
  calculating: 'Calculating allocations...',
  updating: 'Updating plan...',
  exporting: 'Exporting data...',
  loading: 'Loading...'
};

// Animation durations
export const ANIMATION_DURATIONS = {
  fast: 200,
  medium: 300,
  slow: 600
};

// Breakpoints
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};
