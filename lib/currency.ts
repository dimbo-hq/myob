/**
 * Indian Rupee (INR) Currency Formatters and Constants
 */
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export function formatINR(val: number, includeDecimals = true): string {
  if (isNaN(val) || val === null || val === undefined) return `${CURRENCY_SYMBOL}0.00`;
  
  if (!includeDecimals) {
    return `${CURRENCY_SYMBOL}${Math.round(val).toLocaleString('en-IN')}`;
  }
  
  return `${CURRENCY_SYMBOL}${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
