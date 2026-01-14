/**
 * Calculation utilities for balance computations
 * All calculations are performed server-side
 */

/**
 * Calculate Riyal Amount: PKR Amount ÷ Riyal Rate
 * If PKR > 0 AND Rate > 0, calculate. Otherwise return 0 (will use submitted SAR directly)
 */
export const calculateRiyalAmount = (pkrAmount, riyalRate) => {
  // Only calculate if both PKR and Rate are > 0
  if (pkrAmount > 0 && riyalRate > 0) {
    return pkrAmount / riyalRate;
  }
  // If either is 0 or missing, return 0 (system will use submitted SAR directly)
  return 0;
};

/**
 * Calculate Saudi balance: Riyal Amount - Submitted SAR
 */
export const calculateSaudiBalance = (riyalAmount, submittedSar) => {
  return riyalAmount - submittedSar;
};

/**
 * Calculate Special balance: Name Rupees - Submitted Rupees
 */
export const calculateSpecialBalance = (nameRupees, submittedRupees) => {
  return nameRupees - submittedRupees;
};

/**
 * Calculate remaining amount: Amount Added - Amount Withdrawn
 */
export const calculateRemainingAmount = (amountAdded, amountWithdrawn) => {
  return amountAdded - amountWithdrawn;
};

/**
 * Calculate running balance for bank ledger entries
 * Returns array of entries with running balance
 */
export const calculateRunningBalance = (entries) => {
  let runningBalance = 0;
  return entries.map((entry) => {
    runningBalance += entry.amountAdded - entry.amountWithdrawn;
    return {
      ...entry.toObject ? entry.toObject() : entry,
      runningBalance,
    };
  });
};

/**
 * Calculate total balance for a bank
 */
export const calculateBankTotalBalance = (entries) => {
  return entries.reduce((total, entry) => {
    return total + (entry.amountAdded - entry.amountWithdrawn);
  }, 0);
};

/**
 * Calculate total balance for a trader (sum of all banks)
 */
export const calculateTraderTotalBalance = (banks) => {
  return banks.reduce((total, bank) => {
    const bankBalance = calculateBankTotalBalance(bank.entries || []);
    return total + bankBalance;
  }, 0);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency}`;
};

/**
 * Format number with 2 decimal places
 */
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

