import { ethers } from "ethers";
import { estimateTokensToSwap, getChainlinkPrice, getPoolData, getUniswapPrice, swapExactInputSingleHop } from "./utils.js";

const uniswap_pool = "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD";
const local_pool = "0x54bC2fD3947c1A7427604C8C82d168dA7C6110b7";
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

    var param = {
        tokenIn: "",
        tokenOut: "",
        amountToSwap: 0
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
    console.log("amountToSwap", param.amountToSwap, "INPUT token: ", param.tokenIn);

    if (param.amountToSwap > 0) {
        await swapExactInputSingleHop(
            param.tokenIn,
            param.tokenOut,
            poolData.fee,
            param.amountToSwap.toString()
        );
        var poolData = await getPoolData(pool);
        console.log("POOL SYNCHRONISED: ", poolData);
        var amountOut = await swapExactInputSingleHop(
            poolData.token0,
            poolData.token1,
            poolData.fee,
            ethers.utils.parseUnits('1', poolData.token0Decimal).toString(),
            true
        );
        console.log("1", poolData.token0Symbol, " = ", ethers.utils.formatUnits(amountOut, poolData.token1Decimal), poolData.token1Symbol);
    }
}

syncPrice(pool);