import { ethers } from "ethers";
import { POOL_ABI } from "./abis/pool.js";
import { ETH_PROVIDER, SWAP_ROUTER, USER, Wallet } from "./constansts.js";
import { ERC20_ABI } from "./abis/erc20.js";
import { aggregatorV3InterfaceABI } from "./abis/aggregator.js";
import { SWAP_ROUTER_ABI } from "./abis/swapRouter.js";
import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export async function getPoolData(poolAddress) {
    var pool = new ethers.Contract(poolAddress, POOL_ABI, ETH_PROVIDER);

    var token0 = await pool.token0();
    var token1 = await pool.token1();
    var fee = await pool.fee();
    var liquidity = (await pool.liquidity()).toString();
    var slot0 = await pool.slot0();

    var sqrtPriceX96 = slot0.sqrtPriceX96.toString();

    var token0Contract = new ethers.Contract(token0, ERC20_ABI, ETH_PROVIDER);
    var token1Contract = new ethers.Contract(token1, ERC20_ABI, ETH_PROVIDER);
    var token0Decimal = await token0Contract.decimals();
    var token1Decimal = await token1Contract.decimals();

    return {
        token0,
        token1,
        token0Decimal,
        token1Decimal,
        liquidity,
        fee,
        sqrtPriceX96
    };
}

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

    const diff = Math.abs(decimal0 - decimal1);

    const decimalDiff = new BigNumber("10").pow(diff);

    console.log("decimalDiff: ", decimalDiff);

    const amountOfToken1For1Token0 = price.div(decimalDiff);

    console.log("amountOfToken1For1Token0: ", amountOfToken1For1Token0);

    const amountScaled = amountOfToken1For1Token0.multipliedBy(new BigNumber('10').pow('18'));

    console.log("amountScaled: ", amountScaled);
    // Return the price
    return amountScaled.decimalPlaces(0); // toFixed() to convert the result to a string
}

/**
 * Calculate the integer square root of a given number using the Babylonian method.
 * @param {BigNumber} x - The number to find the square root of.
 * @returns {BigNumber} - The integer square root of x.
 */
function sqrt(value) {
    let x = new BigNumber(value);
    let z = x.plus(1).div(2);
    let y = x;
    while (z.isLessThan(y)) {
        y = z;
        z = x.div(z).plus(z).div(2);
    }
    return y;
}

export async function getChainlinkPrice(aggregatorToken0, aggregatorToken1, token0Decimals, token1Decimals) {
    // Get the price feeds for both tokens
    const priceFeedToken0 = new ethers.Contract(aggregatorToken0, aggregatorV3InterfaceABI, ETH_PROVIDER);
    const priceFeedToken1 = new ethers.Contract(aggregatorToken1, aggregatorV3InterfaceABI, ETH_PROVIDER);

    // Fetch latest round data for both tokens
    const roundDataToken0 = await priceFeedToken0.latestRoundData();
    const roundDataToken1 = await priceFeedToken1.latestRoundData();

    // Extract the price from round data
    const price0 = new BigNumber(roundDataToken0.answer.toString());
    const price1 = new BigNumber(roundDataToken1.answer.toString());

    console.log("Prices of token0 and token1:", price0.toString(), price1.toString());

    var ratio = price0.div(price1);

    console.log("ratio: ", ratio);

    var sclaedRatio = ratio.multipliedBy(new BigNumber('10').pow(18)).decimalPlaces(0);

    // if (price0.gt(price1)) {
    //     // ratio = (ethers.BigNumber.from('1000000000000000000').div(ratio))
    //     //     .mul(ethers.BigNumber.from(10).pow(token1Decimals).div(ethers.BigNumber.from(10).pow(token0Decimals)));

    //     ratio = ethers.BigNumber.from('1000000000000000000').mul(ethers.BigNumber.from(10).pow(token1Decimals).mul(ethers.BigNumber.from(10).pow(token1Decimals)))
    //         .div(ratio).div(ethers.BigNumber.from(10).pow(token0Decimals));
    //     console.log("Inverted ratio:", ratio.toString());
    // }

    return sclaedRatio;
}


export function estimateTokensToSwap(liquidity, chainLinkPrice, uniswapPrice, isToken0In) {
    const bnLiquidity = new BigNumber(liquidity);
    const bnChainLinkPrice = new BigNumber(chainLinkPrice);
    const bnUniswapPrice = new BigNumber(uniswapPrice);

    const sqrtUni = sqrt(bnUniswapPrice);
    const sqrtChainLink = sqrt(bnChainLinkPrice);

    console.log("sqrtPrices:", sqrtUni.toString(), sqrtChainLink.toString());

    if (isToken0In) {
        const delX = bnLiquidity.multipliedBy(sqrtChainLink)
            .minus(bnLiquidity.multipliedBy(sqrtUni))
            .dividedBy(sqrtChainLink.multipliedBy(sqrtUni));
        console.log("DeltaX", delX.toString());
        return delX;
    } else {
        const delY = bnLiquidity.multipliedBy(sqrtChainLink)
            .minus(bnLiquidity.multipliedBy(sqrtUni));
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
    var tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, ETH_PROVIDER);

    await tokenInContract.mint(amountIn);
    await tokenInContract.approve(SWAP_ROUTER, amountIn);

    var swapRouter = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, Wallet);

    var currentTimeStamp = Math.floor(Date.now() / 1000);

    var amountOut = await swapRouter.exactInputSingle({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        fee: poolFee,
        recipient: USER,
        deadline: currentTimeStamp,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    })

    return amountOut;
}