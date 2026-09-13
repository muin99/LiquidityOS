// CASH_IN: e-cash wallet -> cash drawer (customer deposits cash, gets e-cash)
// CASH_OUT: cash drawer -> e-cash wallet (customer withdraws cash, gives e-cash)
export enum TransactionType {
  CASH_IN = 'cash_in',
  CASH_OUT = 'cash_out',
  LIQUIDITY_SWAP = 'liquidity_swap',
  PROVIDER_TOP_UP = 'provider_top_up',
  PROVIDER_SUPPLY = 'provider_supply',
}
