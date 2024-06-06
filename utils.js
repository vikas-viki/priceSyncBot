import { ethers } from "ethers";
import { POOL_ABI } from "./abis/pool.js";
import { ETH_PROVIDER, LOCAL_PROVIDER, USER, Wallet } from "./constansts.js";
import { SWAP_ROUTER } from "./index.js";
import { ERC20_ABI } from "./abis/erc20.js";
import { aggregatorV3InterfaceABI } from "./abis/aggregator.js";
import { SWAP_ROUTER_ABI } from "./abis/swapRouter.js";
import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export async function getPoolData(poolAddress) {
    var pool = new ethers.Contract(poolAddress, POOL_ABI, LOCAL_PROVIDER);

    var token0 = await pool.token0();
    var token1 = await pool.token1();
    var fee = await pool.fee();
    var liquidity = (await pool.liquidity()).toString();
    var slot0 = await pool.slot0();

    var sqrtPriceX96 = slot0.sqrtPriceX96.toString();

    var token0Contract = new ethers.Contract(token0, ERC20_ABI, LOCAL_PROVIDER);
    var token1Contract = new ethers.Contract(token1, ERC20_ABI, LOCAL_PROVIDER);
    var token0Decimal = await token0Contract.decimals();
    var token1Decimal = await token1Contract.decimals();
    var token0Symbol = await token0Contract.symbol();
    var token1Symbol = await token1Contract.symbol();

    return {
        token0,
        token1,
        token0Decimal,
        token1Decimal,
        liquidity,
        fee,
        sqrtPriceX96,
        token0Symbol,
        token1Symbol
    };
}

var upscale = false;

// amount of token1 for 1 token0
export async function getUniswapPrice(_sqrtPrice, decimal0, decimal1) {
    // Convert the input sqrtPrice to a BigNumber
    const sqrtPriceX96 = new BigNumber(_sqrtPrice);

    console.log(sqrtPriceX96);
    // Square the sqrtPriceX96

    const sqrtPrice = sqrtPriceX96.dividedBy(new BigNumber("2").pow("96"));

    console.log("sqrtPrice: ", sqrtPrice);

    const price = sqrtPrice.pow(2);

    console.log("price: ", price);

    var amountOfToken1For1Token0;

    const diff = Math.abs(decimal0 - decimal1);

    const decimalDiff = new BigNumber("10").pow(diff);

    if (price.lt(1)) {
        amountOfToken1For1Token0 = price.multipliedBy(decimalDiff);
    } else {
        amountOfToken1For1Token0 = price.dividedBy(decimalDiff);
    }

    if (upscale) {
        amountOfToken1For1Token0 = amountOfToken1For1Token0.multipliedBy(decimalDiff);
    }

    console.log("amountOfToken1For1Token0: ", amountOfToken1For1Token0);
    // const amountScaled = amountOfToken1For1Token0.multipliedBy(new BigNumber('10').pow('18'));

    // console.log("amountScaled: ", amountScaled);
    // Return the price
    return amountOfToken1For1Token0; // toFixed() to convert the result to a string
}

/**
 * Calculate the integer square root of a given number using the Babylonian method.
 * @param {BigNumber} x - The number to find the square root of.
 * @returns {BigNumber} - The integer square root of x.
 */
function sqrt(value) {
    return value ** 0.5;
}

export async function getChainlinkPrice(aggregatorToken0, aggregatorToken1, token0Decimals, token1Decimals) {
    // Get the price feeds for both tokens
    const priceFeedToken0 = new ethers.Contract(aggregatorToken0, aggregatorV3InterfaceABI, ETH_PROVIDER);
    const priceFeedToken1 = new ethers.Contract(aggregatorToken1, aggregatorV3InterfaceABI, ETH_PROVIDER);

    console.log("getting data");
    // Fetch latest round data for both tokens
    const roundDataToken0 = await priceFeedToken0.latestRoundData();
    const roundDataToken1 = await priceFeedToken1.latestRoundData();

    // Extract the price from round data
    const price0 = new BigNumber(roundDataToken0.answer.toString());
    const price1 = new BigNumber(roundDataToken1.answer.toString());

    console.log("Prices of token0 and token1:", price0.toString(), price1.toString());

    var ratio = price0.div(price1);

    console.log("ratio: ", ratio);

    const diff = Math.abs(token0Decimals - token1Decimals);

    const decimalDiff = new BigNumber("10").pow(diff);

    if (upscale) {
        ratio = ratio.multipliedBy(decimalDiff);
    }

    console.log("amountOfToken1For1Token0: ", ratio);

    return ratio;
}


export function estimateTokensToSwap(liquidity, chainLinkPrice, uniswapPrice, isToken0In) {
    const bnLiquidity = new BigNumber(liquidity);
    const bnChainLinkPrice = new BigNumber(chainLinkPrice);
    const bnUniswapPrice = new BigNumber(uniswapPrice);

    const sqrtUni = sqrt(bnUniswapPrice);
    const sqrtChainLink = sqrt(bnChainLinkPrice);

    console.log("sqrtPrices:", sqrtUni.toString(), sqrtChainLink.toString());

    if (isToken0In) {
        console.log("bnLiquidity: ", bnLiquidity);
        const desiredRatio = bnLiquidity.div(sqrtChainLink);
        console.log("desiredRatio: ", desiredRatio);
        const currentRatio = bnLiquidity.div(sqrtUni);
        console.log("currentRatio: ", currentRatio);

        const delX = desiredRatio.minus(currentRatio);

        console.log("DeltaX", delX.toString());
        return delX;
    } else {
        console.log("bnLiquidity: ", bnLiquidity);
        const desiredRatio = bnLiquidity.multipliedBy(sqrtChainLink);
        console.log("desiredRatio: ", desiredRatio);
        const currentRatio = bnLiquidity.multipliedBy(sqrtUni);
        console.log("currentRatio: ", currentRatio);

        const delY = desiredRatio.minus(currentRatio);
        console.log("DeltaY:", delY.toString());
        return delY;
    }
}

export async function swapExactInputSingleHop(
    tokenIn,
    tokenOut,
    poolFee,
    amountIn
) {
    var tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, Wallet);

    await tokenInContract.mint(amountIn);
    await tokenInContract.approve(SWAP_ROUTER, amountIn);

    var swapRouter = new ethers.Contract(SWAP_ROUTER.toString(), SWAP_ROUTER_ABI, Wallet);

    var currentTimeStamp = Math.floor(Date.now() / 1000);

    var amountOut = await swapRouter.exactInputSingle({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        fee: poolFee,
        recipient: USER,
        deadline: currentTimeStamp * 2,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    });

    return amountOut;
}