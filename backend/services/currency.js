import db from '../db.js'

const DEFAULT_USD_TO_EGP = 50.0
const API_URL = 'https://open.er-api.com/v6/latest/USD'

export async function getUsdToEgp() {
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'usd_to_egp'").get()
  if (setting) {
    const { rate, updatedAt } = JSON.parse(setting.value)
    const ageHours = (Date.now() - updatedAt) / (1000 * 60 * 60)
    if (ageHours < 24) {
      return rate
    }
  }

  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.result !== 'success' || !data.rates?.EGP) {
      throw new Error('Invalid response')
    }
    const rate = data.rates.EGP
    const payload = JSON.stringify({ rate, updatedAt: Date.now() })
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('usd_to_egp', ?)").run(payload)
    return rate
  } catch (err) {
    console.warn('Failed to fetch exchange rate, using fallback:', err.message)
    if (setting) {
      const { rate } = JSON.parse(setting.value)
      return rate
    }
    return DEFAULT_USD_TO_EGP
  }
}

export function convert(amount, fromCurrency, toCurrency, rate) {
  if (fromCurrency === toCurrency) return amount
  if (fromCurrency === 'USD' && toCurrency === 'EGP') return amount * rate
  if (fromCurrency === 'EGP' && toCurrency === 'USD') return amount / rate
  throw new Error('Unsupported currency conversion')
}
