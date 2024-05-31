import { ethers } from "ethers";
import { POOL_ABI } from "./abis/pool";
import { ETH_PROVIDER, SWAP_ROUTER, USER, Wallet } from "./constansts";
import { ERC20_ABI } from "./abis/erc20";
import { aggregatorV3InterfaceABI } from "./abis/aggregator";
import { SWAP_ROUTER_ABI } from "./abis/swapRouter";
const BigNumber = require('bignumber.js');

BigNumber.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export async function getPoolData(poolAddress) {
    var pool = new ethers.Contract(poolAddress, POOL_ABI, ETH_PROVIDER);

    var token0 = await pool.token0();
    var token1 = await pool.token1();
    var fee = await pool.fee();
    var liquidity = await pool.liquidity();
    var slot0 = await pool.slot0();

    var sqrtPriceX96 = slot0.sqrtPriceX96;

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

export async function getUniswapPrice(_sqrtPrice) {
    // Convert the input sqrtPrice to a BigNumber
    const sqrtPriceX96 = new BigNumber(_sqrtPrice);

    // Square the sqrtPriceX96
    const priceX96 = sqrtPriceX96.pow(2);

    // Multiply by 10^18
    const priceX96scaled = priceX96.multipliedBy(new BigNumber('1e18'));

    // Shift right by 192 bits (96 * 2)
    const price = priceX96scaled.shiftedBy(-192);

    // Return the price
    return price.toFixed(); // toFixed() to convert the result to a string
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
    const price0 = ethers.BigNumber.from(roundDataToken0.answer);
    const price1 = ethers.BigNumber.from(roundDataToken1.answer);

    console.log("Prices of token0 and token1:", price0.toString(), price1.toString());

    // Calculate the ratio
    let ratio = price1.mul(ethers.BigNumber.from('1e18')).mul(ethers.BigNumber.from(10).pow(token1Decimals))
        .div(price0.mul(ethers.BigNumber.from(10).pow(token0Decimals)));

    console.log("Initial ratio:", price0.toString(), price1.toString(), ratio.toString());

    if (price0.gt(price1)) {
        ratio = ethers.BigNumber.from('1e18').mul(ethers.BigNumber.from(10).pow(token1Decimals * 2))
            .div(ratio).div(ethers.BigNumber.from(10).pow(token0Decimals));
        console.log("Inverted ratio:", ratio.toString());
    }

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