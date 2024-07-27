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

  console.log("poolData: ", poolData);

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
  } else {
    param.amountToSwap = estimateTokensToSwap(
      poolData.liquidity,
      chainlinkPrice,
      uniswapPrice,
      true
    );
    param.tokenIn = poolData.token0;
    param.tokenOut = poolData.token1;
  }
  console.log(
    "amountToSwap",
    param.amountToSwap,
    "INPUT token: ",
    param.tokenIn
  );
  // TEST`
  param.amountToSwap = param.amountToSwap
    .plus(param.amountToSwap.multipliedBy(0.0001))
    .decimalPlaces(0);
  console.log("amountToSwap", param.amountToSwap);

  if (param.amountToSwap > 0 && false) {
    await swapExactInputSingleHop(
      param.tokenIn,
      param.tokenOut,
      poolData.fee,
      param.amountToSwap.toString()
    );
    var poolData = await getPoolData(pool);
    console.log("POOL SYNCHRONISED: ", poolData);
  }
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
    ethers.utils.formatUnits(amountOut, poolData.token1Decimal),
    poolData.token1Symbol
  );
}

async function syncPools() {
  // setInterval(async () => {
  console.log("running");
  for (let i = 0; i < pools.length; i++) {
    console.log("syncing");
    await syncPrice(pools[i]);
  }
  // }, 1000);
}
syncPools();
