import BigNumber from 'bignumber.js';

export const formatTwoNumbersAfterZero = (value: string): string => {
  if (new BigNumber(value).abs().eq(0)) return value;
  if (new BigNumber(value).abs().gte(0.1)) {
    return new BigNumber(value).toFixed(2, BigNumber.ROUND_UP);
  }
  return value.match(/-?0\.0+../g)[0];
};
