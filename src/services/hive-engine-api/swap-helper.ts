import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import {
  GetAmountOutInterface,
  GetSwapOutputInterface,
  GetUpdatedPoolStatsInterface,
  OperationForJsonInterface,
  SwapHelperInterface,
} from './interface';
import { MarketPoolType, SwapJsonType, SwapOutputType } from './types';

@Injectable()
export class SwapHelper implements SwapHelperInterface {
  getSwapOutput({
    symbol,
    amountIn,
    pool,
    slippage,
    tradeFeeMul,
    precision,
  }: GetSwapOutputInterface): SwapOutputType {
    if (!pool) return;

    const { baseQuantity, quoteQuantity, tokenPair } = pool;
    const [baseSymbol] = tokenPair.split(':');

    let liquidityIn;
    let liquidityOut;
    const isBase = symbol === baseSymbol;
    if (isBase) {
      liquidityIn = baseQuantity;
      liquidityOut = quoteQuantity;
    } else {
      liquidityIn = quoteQuantity;
      liquidityOut = baseQuantity;
    }

    const amountOut = new BigNumber(
      this._getAmountOut({
        tradeFeeMul,
        tokenAmount: amountIn,
        liquidityIn,
        liquidityOut,
      }),
    ).toFixed(precision, BigNumber.ROUND_DOWN);
    const minAmountOut = new BigNumber(amountOut)
      .minus(
        new BigNumber(amountOut)
          .multipliedBy(slippage)
          .toFixed(precision, BigNumber.ROUND_DOWN),
      )
      .toFixed(precision, BigNumber.ROUND_DOWN);

    const tokenPairDelta =
      symbol === baseSymbol
        ? [new BigNumber(amountIn), new BigNumber(amountOut).negated()]
        : [new BigNumber(amountOut).negated(), new BigNumber(amountIn)];

    const updatedPool = this.getUpdatedPoolStats({
      pool,
      baseAdjusted: tokenPairDelta[0],
      quoteAdjusted: tokenPairDelta[1],
    });

    const json = this._operationForJson({
      minAmountOut,
      tokenPair,
      tokenSymbol: symbol,
      tokenAmount: amountIn,
    });

    return {
      minAmountOut,
      amountOut,
      json,
      updatedPool,
    };
  }

  getUpdatedPoolStats({
    pool,
    baseAdjusted,
    quoteAdjusted,
  }: GetUpdatedPoolStatsInterface): MarketPoolType {
    const uPool = { ...pool };

    uPool.baseQuantity = new BigNumber(pool.baseQuantity)
      .plus(baseAdjusted)
      .toFixed(pool.precision, BigNumber.ROUND_HALF_UP);
    uPool.quoteQuantity = new BigNumber(pool.quoteQuantity)
      .plus(quoteAdjusted)
      .toFixed(pool.precision, BigNumber.ROUND_HALF_UP);

    uPool.basePrice = new BigNumber(uPool.quoteQuantity)
      .dividedBy(uPool.baseQuantity)
      .toFixed();
    uPool.quotePrice = new BigNumber(uPool.baseQuantity)
      .dividedBy(uPool.quoteQuantity)
      .toFixed();
    return uPool;
  }

  private _getAmountOut({
    tokenAmount,
    liquidityIn,
    liquidityOut,
    tradeFeeMul,
  }: GetAmountOutInterface): BigNumber {
    const amountInWithFee = new BigNumber(tokenAmount).times(tradeFeeMul);
    const num = new BigNumber(amountInWithFee).times(liquidityOut);
    const den = new BigNumber(liquidityIn).plus(amountInWithFee);

    return num.dividedBy(den);
  }

  private _operationForJson({
    tokenPair,
    minAmountOut,
    tokenSymbol,
    tokenAmount,
  }: OperationForJsonInterface): SwapJsonType {
    return {
      contractName: 'marketpools',
      contractAction: 'swapTokens',
      contractPayload: {
        tokenPair,
        tokenSymbol,
        tokenAmount,
        tradeType: 'exactInput',
        minAmountOut,
      },
    };
  }
}
