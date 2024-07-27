import { ethers } from "ethers";
import { POOL_ABI } from "./abis/pool.js";
import { ETH_PROVIDER, LOCAL_PROVIDER, USER, Wallet } from "./constansts.js";
import { SWAP_ROUTER } from "./constansts.js";
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
    token1Symbol,
  };
}

// amount of token1 for 1 token0
export async function getUniswapPrice(_sqrtPrice, decimal0, decimal1) {
  // Convert the input sqrtPrice to a BigNumber
  const sqrtPriceX96 = new BigNumber(_sqrtPrice);

  console.log(sqrtPriceX96);
  // Square the sqrtPriceX96

  const sqrtPrice = sqrtPriceX96.dividedBy(new BigNumber("2").pow("96"));

  const price = sqrtPrice.pow(2);

  return price; // toFixed() to convert the result to a string
}

/**
 * Calculate the integer square root of a given number using the Babylonian method.
 * @param {BigNumber} x - The number to find the square root of.
 * @returns {BigNumber} - The integer square root of x.
 */
function sqrt(value) {
  return value ** 0.5;
}

export async function getChainlinkPrice(
  aggregatorToken0,
  aggregatorToken1,
  token0Decimals,
  token1Decimals
) {
  // Get the price feeds for both tokens
  const priceFeedToken0 = new ethers.Contract(
    aggregatorToken0,
    aggregatorV3InterfaceABI,
    ETH_PROVIDER
  );
  const priceFeedToken1 = new ethers.Contract(
    aggregatorToken1,
    aggregatorV3InterfaceABI,
    ETH_PROVIDER
  );

  // Fetch latest round data for both tokens
  const roundDataToken0 = await priceFeedToken0.latestAnswer();
  const roundDataToken1 = await priceFeedToken1.latestAnswer();

  // Extract the price from round data
  const price0 = new BigNumber(roundDataToken0.toString());
  // const price0 = new BigNumber(ethers.utils.parseUnits("4", 8).toString());
  const price1 = new BigNumber(roundDataToken1.toString());

  var ratio = price0.div(price1);

  const diff = Math.abs(token0Decimals - token1Decimals);

  /**
   * price is calcualted as 'price1 / price0'
   * so if price1 is 18dec and price0 is 6dec, diff is 12dec, so we multiply, so that we can get correct price
   * if price1 is 6dec and price0 is 18dec, diff is -12dec, so we divide.
   */
  if (token0Decimals > token1Decimals) {
    const decimalDiff = new BigNumber("10").pow(diff);
    ratio = ratio.dividedBy(decimalDiff);
  } else {
    const decimalDiff = new BigNumber("10").pow(diff);
    ratio = ratio.multipliedBy(decimalDiff);
  }

  return ratio;
}

export function estimateTokensToSwap(
  liquidity,
  chainLinkPrice,
  uniswapPrice,
  isToken0In
) {
  const bnLiquidity = new BigNumber(liquidity);
  const bnChainLinkPrice = new BigNumber(chainLinkPrice);
  const bnUniswapPrice = new BigNumber(uniswapPrice);

  const sqrtUni = sqrt(bnUniswapPrice);
  const sqrtChainLink = sqrt(bnChainLinkPrice);

  if (isToken0In) {
    const desiredRatio = bnLiquidity.div(sqrtChainLink);
    const currentRatio = bnLiquidity.div(sqrtUni);
    const delX = desiredRatio.minus(currentRatio);

    return delX.decimalPlaces(0);
  } else {
    const desiredRatio = bnLiquidity.multipliedBy(sqrtChainLink);
    const currentRatio = bnLiquidity.multipliedBy(sqrtUni);
    const delY = desiredRatio.minus(currentRatio);

    return delY.decimalPlaces(0);
  }
}

export async function swapExactInputSingleHop(
  tokenIn,
  tokenOut,
  poolFee,
  amountIn,
  callStatic = false
) {
  var tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, Wallet);

  console.log("before mint");
  var tx = await tokenInContract.mint(amountIn);
  await tx.wait();
  console.log("after mint");
  tx = await tokenInContract.approve(SWAP_ROUTER, amountIn);
  await tx.wait();
  console.log("after approve");
  var swapRouter = new ethers.Contract(
    SWAP_ROUTER.toString(),
    SWAP_ROUTER_ABI,
    Wallet
  );
  var nonce = await Wallet.getTransactionCount();
  console.log(nonce);
  var currentTimeStamp = Math.floor(Date.now() / 1000);
  var amountOut;
  var params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: poolFee,
    recipient: USER,
    deadline: currentTimeStamp * 2,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
  console.log(params);
  if (callStatic) {
    amountOut = await swapRouter.callStatic.exactInputSingle(params, {
      gasLimit: 28000000,
      nonce: ++nonce,
    });
  } else {
    amountOut = await swapRouter.exactInputSingle(params, {
      gasLimit: 28000000,
      nonce: ++nonce,
    });
  }

  return amountOut;
}
