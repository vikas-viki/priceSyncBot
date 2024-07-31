import { ethers } from "ethers";
import {
  estimateTokensToSwap,
  getChainlinkPrice,
  getPoolData,
  getUniswapPrice,
  swapExactInputSingleHop,
} from "./utils.js";
import dotenv from "dotenv";
import { pools, aggregators } from "./constansts.js";
dotenv.config();

async function syncPrice(pool) {
  var poolData = await getPoolData(pool);

  console.log("token0: ", poolData.token0Symbol);
  console.log("token1: ", poolData.token1Symbol);

  var uniswapPrice = await getUniswapPrice(
    poolData.sqrtPriceX96,
    poolData.token0Decimal,
    poolData.token1Decimal
  );

  console.log("uniswapPrice: ", uniswapPrice);

  var chainlinkPrice = await getChainlinkPrice(
    aggregators[poolData.token0Symbol],
    aggregators[poolData.token1Symbol],
    poolData.token0Decimal,
    poolData.token1Decimal
  );

  console.log("chainlinkPrice: ", chainlinkPrice.toString());

  var param = {
    tokenIn: "",
    tokenOut: "",
    amountToSwap: 0,
  };

  var tokenInDecimal = 0;
  var tokenInSymbol = "";
  var tokenOutSymbol = "";

  var change = Math.abs(1 - Number(uniswapPrice) / Number(chainlinkPrice));
  console.log({ change });

  if (change < 0.0002) {
    return;
  }

  if (uniswapPrice < chainlinkPrice) {
    // if the price is less, we want to increase the amount of token1 so that price of token0 will be higher.
    param.amountToSwap = estimateTokensToSwap(
      poolData.liquidity,
      chainlinkPrice,
      uniswapPrice,
      false
    );
    param.tokenIn = poolData.token1;
    tokenInSymbol = poolData.token1Symbol;
    tokenOutSymbol = poolData.token0Symbol;
    tokenInDecimal = poolData.token1Decimal;
    param.tokenOut = poolData.token0;
  } else if (uniswapPrice > chainlinkPrice) {
    param.amountToSwap = estimateTokensToSwap(
      poolData.liquidity,
      chainlinkPrice,
      uniswapPrice,
      true
    );
    param.tokenIn = poolData.token0;
    tokenInDecimal = poolData.token0Decimal;
    tokenOutSymbol = poolData.token1Symbol;
    tokenInSymbol = poolData.token0Symbol;
    param.tokenOut = poolData.token1;
  }

  if (param.amountToSwap > 0) {
    console.log({ change });
    console.log(
      "Price Change Detected \n ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );
    // adding fees (100/0.01%)
    param.amountToSwap = param.amountToSwap
      .plus(param.amountToSwap.multipliedBy(0.01))
      .decimalPlaces(0);
    console.log("amountToSwap", param.amountToSwap);
    // if amount > 1M, divide / 2.
    var actual = ethers.utils.formatUnits(
      param.amountToSwap.toString(),
      tokenInDecimal
    );
    if (Number(actual) > 1000000) {
      param.amountToSwap = ethers.utils
        .parseUnits(Math.trunc(actual / 2).toString(), tokenInDecimal)
        .toString();
    }
    console.log("amountToSwap", param.amountToSwap);
    var amountOut = await swapExactInputSingleHop(
      param.tokenIn,
      param.tokenOut,
      poolData.fee,
      ethers.utils.parseUnits("1", tokenInDecimal).toString(),
      true
    );
    console.log(
      "1",
      tokenInSymbol,
      " = ",
      amountOut.toString(),
      tokenOutSymbol
    );
    await swapExactInputSingleHop(
      param.tokenIn,
      param.tokenOut,
      poolData.fee,
      param.amountToSwap.toString(),
      false
    );
    console.log("POOL SYNCHRONISED!");
    var amountOut = await swapExactInputSingleHop(
      param.tokenIn,
      param.tokenOut,
      poolData.fee,
      ethers.utils.parseUnits("1", tokenInDecimal).toString(),
      true
    );
    console.log(
      "||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );
    console.log(
      "1",
      tokenInSymbol,
      " = ",
      amountOut.toString(),
      tokenOutSymbol
    );
  }

  return;
}

async function syncPools() {
  while (true) {
    console.log(
      "Running sync-----------------------------------------------------------------------------------------------------------------"
    );
    for (let i = 0; i < pools.length; i++) {
      console.log("Syncing: ", pools[i]);
      try {
        await syncPrice(pools[i]);
        console.log("Sync done");
      } catch (error) {
        console.log("Error syncing:", error);
      }
    }
    console.log(
      "All pools synced---------------------------------------------------------------------------------------------------------------"
    );

    // Wait for 5 seconds before running again
    await new Promise((resolve) => setTimeout(resolve, 60000 * 5));
  }
}
syncPools();
