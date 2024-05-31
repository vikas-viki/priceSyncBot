import { getChainlinkPrice, getPoolData, getUniswapPrice } from "./utils";

const pools = [
    // pool address
];

var aggregators = {
    // "token address": "aggregator address"
}

// reading data of pools
async function syncPrice(pool) {
    var poolData = await getPoolData(pool);

    var uniswapPrice = await getUniswapPrice(poolData.sqrtPriceX96);

    var chainlinkPrice = await getChainlinkPrice(
        aggregators[poolData.token0],
        aggregators[poolData.token1],
        poolData.token0Decimal,
        poolData.token1Decimal
    );

    var amountToSwap = 0;
    var tokenIn = "";
    var tokenOut = "";

    if (uniswapPrice < chainlinkPrice) {
        amountToSwap = estimateTokensToSwap(
            liquidity,
            chainlinkPrice,
            uniswapPrice,
            false
        );
        console.log("amountToSwap", amountToSwap);
        tokenIn = poolData.token1;
        tokenOut = poolData.token0;
    } else {
        amountToSwap = estimateTokensToSwap(
            liquidity,
            chainlinkPrice,
            uniswapPrice,
            true
        );
        console.log("amountToSwap", amountToSwap);
        tokenIn = pool.token0;
        tokenOut = pool.token1;
    }

    if (amountToSwap > 0) {
        await swapExactInputSingleHop(
            tokenIn,
            tokenOut,
            poolData.fee,
            amountToSwap
        );

        console.log("POOL SYNCHRONISED");
    }
}