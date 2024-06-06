import { estimateTokensToSwap, getChainlinkPrice, getPoolData, getUniswapPrice, swapExactInputSingleHop } from "./utils.js";

const uniswap_pool = "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD";
const local_pool = "0x589D9db904F35268C3Ed8AbB4f2367eE6B5B1Ffd";
export const UNISWAP_SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const LOCAL_SWAP_ROUTER = "0x20Ce94F404343aD2752A2D01b43fa407db9E0D00";

export const SWAP_ROUTER = LOCAL_SWAP_ROUTER;
const pool = local_pool;

const aggregators = {
    // "symbol": "aggregator",
    "WBTC": "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
    "WETH": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    "ARB": "0x31697852a68433DbCc2Ff612c516d69E3D9bd08F",
    "USDC": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
    "USDT": "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
    "LINK": "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
    "DAI": "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
};

// reading data of pools
async function syncPrice(pool) {
    var poolData = await getPoolData(pool);

    console.log("poolData: ", poolData);

    var uniswapPrice = await getUniswapPrice(poolData.sqrtPriceX96, poolData.token0Decimal, poolData.token1Decimal);

    console.log("uniswapPrice: ", uniswapPrice);

    var chainlinkPrice = await getChainlinkPrice(
        aggregators[poolData.token0Symbol],
        aggregators[poolData.token1Symbol],
        poolData.token0Decimal,
        poolData.token1Decimal
    );

    console.log("chainlinkPrice: ", chainlinkPrice.toString());

    var amountToSwap = 0;
    var tokenIn = "";
    var tokenOut = "";

    // if the price is less, we want to increase the amount of token1 so that price of token0 will be higher.
    if (uniswapPrice < chainlinkPrice) {
        amountToSwap = estimateTokensToSwap(
            poolData.liquidity,
            chainlinkPrice,
            uniswapPrice,
            false
        );
        console.log("amountToSwap", amountToSwap, "INPUT token(<): ", poolData.token1);
        tokenIn = poolData.token1;
        tokenOut = poolData.token0;
    } else {
        amountToSwap = estimateTokensToSwap(
            poolData.liquidity,
            chainlinkPrice,
            uniswapPrice,
            true
        );
        console.log("amountToSwap", amountToSwap, "INPUT token: ", poolData.token0);
        tokenIn = poolData.token0;
        tokenOut = poolData.token1;
    }

    if (amountToSwap.decimalPlaces(0)) {
        console.log("amountToSwap: ", amountToSwap);
        var amountOut = await swapExactInputSingleHop(
            tokenIn,
            tokenOut,
            poolData.fee,
            amountToSwap.decimalPlaces(0).toString()
        );

        console.log("POOL SYNCHRONISED: ", amountOut);

        var poolData = await getPoolData(pool);

        console.log("poolData: ", poolData);

        var uniswapPrice = await getUniswapPrice(poolData.sqrtPriceX96, poolData.token0Decimal, poolData.token1Decimal);

        console.log("uniswapPrice: ", uniswapPrice);
    }
}

syncPrice(pool);