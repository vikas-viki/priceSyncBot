import { estimateTokensToSwap, getChainlinkPrice, getPoolData, getUniswapPrice } from "./utils.js";

const pools = [
    "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD"
];

var aggregators = {
    // "token address": "aggregator address"
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // WBTC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" // WETH
}

// reading data of pools
async function syncPrice(pool) {
    var poolData = await getPoolData(pool);

    console.log("poolData: ", poolData);

    var uniswapPrice = await getUniswapPrice(poolData.sqrtPriceX96);

    console.log("uniswapPrice: ", uniswapPrice);

    var chainlinkPrice = await getChainlinkPrice(
        aggregators[poolData.token0],
        aggregators[poolData.token1],
        poolData.token0Decimal,
        poolData.token1Decimal
    );

    console.log("chainlinkPrice: ", chainlinkPrice.toString());

    var amountToSwap = 0;
    var tokenIn = "";
    var tokenOut = "";

    if (uniswapPrice < chainlinkPrice) {
        amountToSwap = estimateTokensToSwap(
            poolData.liquidity,
            chainlinkPrice,
            uniswapPrice,
            false
        );
        console.log("amountToSwap", amountToSwap);
        tokenIn = poolData.token1;
        tokenOut = poolData.token0;
    } else {
        amountToSwap = estimateTokensToSwap(
            poolData.liquidity,
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

syncPrice(pools[0]);