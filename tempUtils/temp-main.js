import { ethers } from "ethers";
import { Wallet } from "../constansts.js";
import { SWAP_ROUTER_ABI } from "../abis/swapRouter.js";
import dotenv from "dotenv";
dotenv.config();

var zeruOracleABI = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "sources",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "fallbackOracle",
        type: "address",
      },
      {
        internalType: "address",
        name: "weth",
        type: "address",
      },
      {
        internalType: "address",
        name: "ethusd",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "source",
        type: "address",
      },
    ],
    name: "AssetSourceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "fallbackOracle",
        type: "address",
      },
    ],
    name: "FallbackOracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "weth",
        type: "address",
      },
    ],
    name: "WethSet",
    type: "event",
  },
  {
    inputs: [],
    name: "ETHUSD",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "getAssetPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "getAssetPriceInUSD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
    ],
    name: "getAssetsPrices",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFallbackOracle",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "getSourceOfAsset",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "sources",
        type: "address[]",
      },
    ],
    name: "setAssetSources",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fallbackOracle",
        type: "address",
      },
    ],
    name: "setFallbackOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const UNISWAP_FACTOR_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint24", name: "fee", type: "uint24" },
      {
        indexed: true,
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    name: "FeeAmountEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      { indexed: true, internalType: "uint24", name: "fee", type: "uint24" },
      {
        indexed: false,
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
    ],
    name: "createPool",
    outputs: [{ internalType: "address", name: "pool", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint24", name: "fee", type: "uint24" },
      { internalType: "int24", name: "tickSpacing", type: "int24" },
    ],
    name: "enableFeeAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint24", name: "", type: "uint24" }],
    name: "feeAmountTickSpacing",
    outputs: [{ internalType: "int24", name: "", type: "int24" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint24", name: "", type: "uint24" },
    ],
    name: "getPool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "parameters",
    outputs: [
      { internalType: "address", name: "factory", type: "address" },
      { internalType: "address", name: "token0", type: "address" },
      { internalType: "address", name: "token1", type: "address" },
      { internalType: "uint24", name: "fee", type: "uint24" },
      { internalType: "int24", name: "tickSpacing", type: "int24" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const uniswapAdapterABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "Swap",
    type: "event",
  },
  {
    inputs: [],
    name: "UNISWAP_V3_ADAPTER",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_bytes",
        type: "bytes",
      },
    ],
    name: "bytesToAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "collectAllFees",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
    ],
    name: "decreaseLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factoryAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getFeeGrowthInsideTokensX128",
    outputs: [
      {
        internalType: "uint256",
        name: "feeGrowthInside0LastX128",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeGrowthInside1LastX128",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_path",
        type: "bytes",
      },
    ],
    name: "getFirstAndLastToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenB",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
    ],
    name: "getPoolAddress",
    outputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
    ],
    name: "getPoolInfo",
    outputs: [
      {
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160",
      },
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "uint16",
        name: "observationIndex",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "observationCardinality",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "observationCardinalityNext",
        type: "uint16",
      },
      {
        internalType: "uint8",
        name: "feeProtocol",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "unlocked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPositionDetails",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token0",
            type: "address",
          },
          {
            internalType: "address",
            name: "token1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "uint128",
            name: "liquidity",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "tokensOwed0",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "tokensOwed1",
            type: "uint128",
          },
        ],
        internalType: "struct IUniswapV3Adapter.PositionDetails",
        name: "params",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPositionManager",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addressProvider",
        type: "address",
      },
      {
        internalType: "address",
        name: "_swapRouter",
        type: "address",
      },
      {
        internalType: "address",
        name: "_nonFungiblePositionManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_factoryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_lendingPoolAddressProvider",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lendingPoolAddressProvider",
    outputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "_token1",
        type: "address",
      },
      {
        internalType: "int24",
        name: "_lowerTick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "_upperTick",
        type: "int24",
      },
      {
        internalType: "uint256",
        name: "_amount0Desired",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount1Desired",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "_fee",
        type: "uint24",
      },
    ],
    name: "mintNewPosition",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nonFungiblePositionManager",
    outputs: [
      {
        internalType: "contract INonfungiblePositionManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_slippagePercent",
        type: "uint256",
      },
    ],
    name: "setSlippageTolerance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_bytes",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "_start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_length",
        type: "uint256",
      },
    ],
    name: "slice",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "slippageDecimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "slippageTolerance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "strategiesAddressProvider",
    outputs: [
      {
        internalType: "contract IStrategiesAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token0",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amountIn",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_path",
        type: "bytes",
      },
    ],
    name: "swapExactInputMultihop",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token0",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amountOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amountInMax",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_path",
        type: "bytes",
      },
    ],
    name: "swapExactOutputMultihop",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "swapRouter",
    outputs: [
      {
        internalType: "contract ISwapRouter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const erc20ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isLimitReached",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "setTokenLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenLimit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const nonFungiblePositionManagerABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "Collect",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "DecreaseLiquidity",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    name: "IncreaseLiquidity",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "WETH9",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "amount0Max",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "amount1Max",
            type: "uint128",
          },
        ],
        internalType: "struct INonfungiblePositionManager.CollectParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "collect",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160",
      },
    ],
    name: "createAndInitializePoolIfNecessary",
    outputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint128",
            name: "liquidity",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType:
          "struct INonfungiblePositionManager.DecreaseLiquidityParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "decreaseLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount0Desired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Desired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType:
          "struct INonfungiblePositionManager.IncreaseLiquidityParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "increaseLiquidity",
    outputs: [
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token0",
            type: "address",
          },
          {
            internalType: "address",
            name: "token1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "uint256",
            name: "amount0Desired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Desired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount0Min",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1Min",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType: "struct INonfungiblePositionManager.MintParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "positions",
    outputs: [
      {
        internalType: "uint96",
        name: "nonce",
        type: "uint96",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "int24",
        name: "tickLower",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickUpper",
        type: "int24",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "feeGrowthInside0LastX128",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeGrowthInside1LastX128",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "tokensOwed0",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "tokensOwed1",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "refundETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "sweepToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountMinimum",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "unwrapWETH9",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const lpInterface = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "a",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "b",
        type: "uint256",
      },
    ],
    name: "FeeSwapFeeValues",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "lendingPoolAddressProvider",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "stratergyPoolAddressProvider",
        type: "address",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "borrowId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "debtAsset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "debtRepaid",
        type: "uint256",
      },
    ],
    name: "PositionClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "borrowId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "collateralAsset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "creditAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "debtAsset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "debtAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "leverage",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "openPositionTimestamp",
        type: "uint256",
      },
    ],
    name: "PositionOpened",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "maxProfitCut",
        type: "uint16",
      },
    ],
    name: "maxProfitCutUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "LP_REVISION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pool",
        type: "address",
      },
    ],
    name: "addAllowedPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "addressProvider",
    outputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allowedPools",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "u",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "i",
        type: "uint256",
      },
    ],
    name: "calculateHF",
    outputs: [
      {
        internalType: "uint256",
        name: "h",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nfpm",
        type: "address",
      },
    ],
    name: "claimSwapFee",
    outputs: [
      {
        internalType: "uint256",
        name: "a",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "b",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "d",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "u",
        type: "address",
      },
    ],
    name: "closePosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getLiquidityDetails",
    outputs: [
      {
        internalType: "uint256",
        name: "a0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "a1",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "i",
        type: "uint256",
      },
    ],
    name: "getPositionDetailsStruct",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "borrowId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "collateralAsset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "collateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "creditAmount",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "debtAsset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "debtAmount",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "leverage",
            type: "uint16",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isClosed",
            type: "bool",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint256",
            name: "openPositionTimestamp",
            type: "uint256",
          },
        ],
        internalType: "struct LpDataTypes.PositionInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "nfpm",
        type: "address",
      },
    ],
    name: "getSwapFeeEarned",
    outputs: [
      {
        internalType: "uint256",
        name: "a",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "b",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserPositionCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_strategyProvider",
        type: "address",
      },
      {
        internalType: "address",
        name: "_addressProvider",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pool",
        type: "address",
      },
    ],
    name: "isAllowedPool",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "p",
        type: "bytes",
      },
    ],
    name: "liquidation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lpDelegateAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lpLiquidationAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxProfitCut",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "d1",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "d2",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "d3",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "c",
        type: "address",
      },
    ],
    name: "openPosition",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "positions",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "borrowId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "collateralAsset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "creditAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "debtAsset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "debtAmount",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "leverage",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isClosed",
        type: "bool",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "uint256",
        name: "openPositionTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "l",
        type: "address",
      },
    ],
    name: "setLiquidationAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpDelegateAddress",
        type: "address",
      },
    ],
    name: "setLpDelegateAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "newMaxProfitCut",
        type: "uint16",
      },
    ],
    name: "setMaxProfitCut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "val",
        type: "bool",
      },
    ],
    name: "setPause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "strategiesProvider",
    outputs: [
      {
        internalType: "contract IStrategiesAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "strategyId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "borrowId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "debtAmount",
        type: "uint256",
      },
    ],
    name: "updateDebt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "d",
        type: "bytes",
      },
    ],
    name: "updatePosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userBorrowCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

var Oracleaddress = "0x2E7834BF5782161A1322EA569C6aAd253B023124";
var uniswapV3AdapterAddress = "0x80854AF8593c14bb02cE961197B14C7Dc9fe1a91";
var factoryAddress = "0xeeB217B7Ea60684f87C3aF3bf4Ed916ad4550A26";
const nonFungiblePositionManager = "0xD23A50EaeE4df4bAb0C66c7f925CBFf72b1dF0E2";
const SWAP_ROUTER = "0x5d0Dd3F446960d657799f1db0E52525D4b56304A";

var rpc =
  "https://distinguished-maximum-sheet.bera-bartio.quiknode.pro/d4bb5c22aa0fee3b8d0c8702d9fb52a2eaa8e14c";
var provider = new ethers.providers.JsonRpcProvider(rpc);

var oracle = new ethers.Contract(Oracleaddress, zeruOracleABI, provider);
var adapter = new ethers.Contract(
  uniswapV3AdapterAddress,
  uniswapAdapterABI,
  Wallet
);
var swapRouter = new ethers.Contract(
  SWAP_ROUTER.toString(),
  SWAP_ROUTER_ABI,
  Wallet
);
const uniswapFactory_contract = new ethers.Contract(
  factoryAddress,
  UNISWAP_FACTOR_ABI,
  provider
);
const nfpm = new ethers.Contract(
  nonFungiblePositionManager,
  nonFungiblePositionManagerABI,
  Wallet
);

var wbera = "0x215D01442E3D00f705BA62814B2BC93A4190bfb5"; // 18
var honey = "0xc0EA68bd996Fde867892181FF23aB6583e51351a"; // 18
var ibgt = "0xF498D49F7f8d063b7D584C0a679a1ce777F3900B"; // 18
var usdt = "0xC2b60E00a29e99bC8cB54B110ea8aB126Ea5eA8F"; // 18

async function getAggregators() {
  console.log("aggregator WBERA: ", await oracle.getSourceOfAsset(wbera)); //
  console.log("aggregator HONEY: ", await oracle.getSourceOfAsset(honey)); //
  console.log("aggregator IBGT: ", await oracle.getSourceOfAsset(ibgt)); //
  console.log("aggregator USDT: ", await oracle.getSourceOfAsset(usdt)); //
}
// getAggregators();
async function getAllPools() {
  var tokensName = ["wbera", "honey", "ibgt", "usdt"];
  var tokens = [wbera, honey, ibgt, usdt];
  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      var token0 = tokens[i].toLowerCase();
      var token1 = tokens[j].toLowerCase();
      if (token0 != token1) {
        var pool = await uniswapFactory_contract.getPool(token0, token1, 100);
        console.log(`${tokensName[i]}/${tokensName[j]}: `, pool);
      }
    }
  }
}
getAllPools();
async function getFactoryAndNFPM() {
  console.log("uniswap facotry: ", await adapter.factoryAddress()); // 0x8D1dB6db062c1a475c134E6BE08B0dF3F615173F
  console.log("NFPM: ", await adapter.nonFungiblePositionManager()); // 0x8D1dB6db062c1a475c134E6BE08B0dF3F615173F
}

async function OpenLpPosition() {
  var _token0 = wbera;
  var _token1 = honey;
  var _lowerTick = 19360;
  var _upperTick = 19560;
  var _amount0Desired = ethers.utils.parseEther("100");
  var _amount1Desired = ethers.utils.parseUnits("700", 18);
  var _owner = Wallet.address;
  var _fee = 100;

  var token0Contract = new ethers.Contract(_token0, erc20ABI, Wallet);
  await token0Contract.mint(_amount0Desired);
  await token0Contract.approve(adapter.address, _amount0Desired);
  console.log("1");
  var token1Contract = new ethers.Contract(_token1, erc20ABI, Wallet);
  await token1Contract.approve(adapter.address, _amount1Desired);

  var res = await adapter.mintNewPosition(
    _token0,
    _token1,
    _lowerTick,
    _upperTick,
    _amount0Desired,
    _amount1Desired,
    _owner,
    _fee
  );
  console.log(res);
}

async function addLiquidityToPool() {
  var pool = "0xbea14f41bc38f95caa852677973f554daa72e764";
  var _token0 = wbera;
  var _token1 = honey;
  var _lowerTick = 19160;
  var _upperTick = 19860;
  var _amount0Desired = ethers.utils.parseEther("500");
  var _amount1Desired = ethers.utils.parseUnits("3500", 18);
  var _owner = Wallet.address;
  var _fee = 100;

  var token0Contract = new ethers.Contract(_token0, erc20ABI, Wallet);
  await token0Contract.approve(nfpm.address, _amount0Desired);

  var token1Contract = new ethers.Contract(_token1, erc20ABI, Wallet);
  await token1Contract.approve(nfpm.address, _amount1Desired);
  console.log("after approve");
  var tx = await nfpm.mint(
    {
      token0: _token0,
      token1: _token1,
      fee: _fee,
      tickLower: _lowerTick,
      tickUpper: _upperTick,
      amount0Desired: _amount0Desired,
      amount1Desired: _amount1Desired,
      amount0Min: "0",
      amount1Min: "0",
      recipient: _owner,
      deadline: Date.now() * 2,
    },
    {
      gasLimit: 20000000,
    }
  );
  console.log(tx);
}

async function Swap(amount, callStatic, token0, token1, decimals) {
  var amountIn = ethers.utils.parseUnits(amount.toString(), decimals);

  var token0Contract = new ethers.Contract(token0, erc20ABI, Wallet);
  await token0Contract.approve(swapRouter.address, amountIn);

  var params = {
    tokenIn: token0,
    tokenOut: token1,
    fee: 100,
    recipient: Wallet.address,
    deadline: Date.now() * 10,
    amountIn: amountIn.toString(),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
  console.log(params);
  var tx;
  if (callStatic) {
    tx = await swapRouter.callStatic.exactInputSingle(params);
  } else {
    tx = await swapRouter.exactInputSingle(params, {
      gasLimit: 28000000,
    });
  }
  console.log("tx: ", tx);
}

// HONEY/WBERA
// Swap(100000, false, honey, wbera, 18);
// WBERA/IBGT
// Swap(100000, false, wbera, ibgt, 18);
// WBERA/USDT
// Swap(100000, false, wbera, usdt, 18);
// HONEY/IBGT
// Swap(100000, false, honey, ibgt, 18);
// HONEY/USDT
// Swap(100000, false, honey, usdt, 18);
// IBGT/USDT
// Swap(100000, false, ibgt, usdt, 18);

async function decreaseLiquidity() {
  var amount0 = ethers.utils.parseEther("100");
  var amount1 = ethers.utils.parseEther("700");
  var tokenId = 10;

  var currentTick = 19460;
  var upperTick = 19560;
  var lowerTick = 19360;

  var currentPrice = tickToSqrtPrice(currentTick);
  var upperPrice = tickToSqrtPrice(upperTick);
  var lowerPrice = tickToSqrtPrice(lowerTick);

  var liquidity0 = getLiquidityForAmount0(currentPrice, upperPrice, amount0);
  var liquidity1 = getLiquidityForAmount1(lowerPrice, currentPrice, amount1);

  var liquidity = Math.min(liquidity0, liquidity1);

  await nfpm.decreaseLiquidity({
    tokenId: tokenId,
    liquidity: liquidity,
    amount0Min: "0",
    amount1Min: "0",
    deadline: Date.now() * 10,
  });
}

function getLiquidityForAmount0(sqrtLower, sqrtUpper, amount) {
  if (sqrtLower > sqrtUpper) {
    var temp = sqrtLower;
    sqrtLower = sqrtUpper;
    sqrtUpper = temp;
  }

  var intermediate = (sqrtLower * sqrtUpper) / 2 ** 96;

  return (amount * intermediate) / (sqrtUpper - sqrtLower);
}

function getLiquidityForAmount1(sqrtLower, sqrtUpper, amount) {
  if (sqrtLower > sqrtUpper) {
    var temp = sqrtLower;
    sqrtLower = sqrtUpper;
    sqrtUpper = temp;
  }

  return (amount * 2 ** 96) / (sqrtUpper - sqrtLower);
}

function tickToSqrtPrice(tick) {
  return Math.sqrt(1.0001 ** tick) * 2 ** 96;
}

async function mintToSwapper() {
  var tokens = [wbera, usdt, ibgt, honey];
  var wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider);
  var wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  for (let i = 0; i < tokens.length; i++) {
    var token = new ethers.Contract(tokens[i], erc20ABI, wallet);
    var amount = 1000000000;
    var decimals = await token.decimals();
    var actualAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    console.log({ actualAmount });
    await token.mint(actualAmount);
    console.log("mint done!");
    await token.transfer(wallet2.address, actualAmount);
    console.log(i, " done!");
  }
}

async function getAllowedPools() {
  // for (let i = 0; i < 15; i++) {
  //   const allowedPool = await lp.allowedPools(i);
  //   console.log(allowedPool);
  // }
}
