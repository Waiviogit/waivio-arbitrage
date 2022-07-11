import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import {
  GetAmountOutInterface,
  GetSwapOutputInterface,
  OperationForJsonInterface,
  SwapHelperInterface,
} from './interface';
import { SwapJsonType, SwapOutputType } from './types';

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
    ).toFixed(Number(precision), BigNumber.ROUND_DOWN);
    const minAmountOut = new BigNumber(amountOut)
      .minus(
        new BigNumber(amountOut)
          .multipliedBy(slippage)
          .toFixed(Number(precision), BigNumber.ROUND_DOWN),
      )
      .toFixed(Number(precision), BigNumber.ROUND_DOWN);

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
    };
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
