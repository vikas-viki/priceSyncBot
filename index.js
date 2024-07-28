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

  // if the price is less, we want to increase the amount of token1 so that price of token0 will be higher.
  if (uniswapPrice < chainlinkPrice) {
    param.amountToSwap = estimateTokensToSwap(
      poolData.liquidity,
      chainlinkPrice,
      uniswapPrice,
      false
    );
    param.tokenIn = poolData.token1;
    param.tokenOut = poolData.token0;
  } else if (uniswapPrice > chainlinkPrice) {
    param.amountToSwap = estimateTokensToSwap(
      poolData.liquidity,
      chainlinkPrice,
      uniswapPrice,
      true
    );
    param.tokenIn = poolData.token0;
    param.tokenOut = poolData.token1;
  }

  if (param.amountToSwap > 0) {
    param.amountToSwap = param.amountToSwap
      .plus(param.amountToSwap.multipliedBy(0.01))
      .decimalPlaces(0);
    console.log("amountToSwap", param.amountToSwap);
    var amountOut = await swapExactInputSingleHop(
      poolData.token0,
      poolData.token1,
      poolData.fee,
      ethers.utils.parseUnits("1", poolData.token0Decimal).toString(),
      true
    );
    console.log(
      "1",
      poolData.token0Symbol,
      " = ",
      amountOut.toString(),
      poolData.token1Symbol
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
      poolData.token0,
      poolData.token1,
      poolData.fee,
      ethers.utils.parseUnits("1", poolData.token0Decimal).toString(),
      true
    );
    console.log(
      "1",
      poolData.token0Symbol,
      " = ",
      amountOut.toString(),
      poolData.token1Symbol
    );
  }

  return;
}

async function syncPools() {
  while (true) {
    console.log("Running sync.........................");
    for (let i = 0; i < pools.length; i++) {
      console.log("Syncing: ", pools[i]);
      try {
        await syncPrice(pools[i]);
        console.log("Sync done");
      } catch (error) {
        console.log("Error syncing:", error);
      }
    }
    console.log("All pools synced!!!!!!!!!!!!!!!!!!!!!!!");

    // Wait for 5 seconds before running again
    await new Promise((resolve) => setTimeout(resolve, 60000 * 5));
  }
}
syncPools();
