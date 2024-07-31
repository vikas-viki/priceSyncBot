import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

/**
 * everything starting with main_ is mainnet data
 * and everything starting with local_ is local deployment data (for testing)
 */

const main_RPC = process.env.BERA_RPC.toString();
const local_RPC = `http://127.0.0.1:8545/`;

// mainnet
const main_PROVIDER = new ethers.providers.JsonRpcProvider(main_RPC);
const main_Wallet = new ethers.Wallet(process.env.PRIVATE_KEY, main_PROVIDER);
const main_USER = "0xd4EeD53acbdF5bEBDF34eF1fD06b4aB2eCFA97d1";
const main_SWAP_ROUTER = "0x5d0Dd3F446960d657799f1db0E52525D4b56304A";

// local
const local_PROVIDER = new ethers.providers.JsonRpcProvider(local_RPC);
const local_Wallet = new ethers.Wallet(process.env.PRIVATE_KEY, local_PROVIDER);
const local_USER = "0xd4EeD53acbdF5bEBDF34eF1fD06b4aB2eCFA97d1";
const local_SWAP_ROUTER = "0x20Ce94F404343aD2752A2D01b43fa407db9E0D00";

export const PROVIDER = main_PROVIDER;
export const Wallet = main_Wallet;
export const USER = main_USER;
export const SWAP_ROUTER = main_SWAP_ROUTER;

export const mainnet_aggregators = {
  // "symbol": "aggregator",
  WBTC: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  WETH: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  ARB: "0x31697852a68433DbCc2Ff612c516d69E3D9bd08F",
  USDC: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  USDT: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
  LINK: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
  DAI: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
};

export const main_aggregators = {
  WBERA: "0xAc3623B5aFF1A9E1DD0ECe4c2aFF6E9a8EE9a46C",
  HONEY: "0x90c15167CB904b601E6660E86E464476b0B40150",
  IBGT: "0x9C9de5ac3cd8dA21cE9D9cca0aF898F796DE6039",
  USDT: "0xa4869121CBff015024d4342df4c5e55e281b1B94",
};

export const main_pools = [
  "0x813619ebab0051F59EC8d298088fc34D290E9258",
  "0xdB084D29FC38FCE5e9922e4CE3eDAFdb11cDBA39",
  "0xb5927E8013B12F9d7122cd7A6Db96F231AFF84e0",
  "0x1664CEFA076E76deF1a0f9560e25Ed7901c2e379",
  "0xD8C074491ae9FE6EFCd2E940c6b30DB3969c06b6",
  "0xBb29a8dE0D86279f7b057043C7f15D63D350f318",
];

export const local_aggregators = {
  WBERA: "0x377EE3A9fbdc642CD7E8d1B72Fb181d45091730B",
  HONEY: "0xd5a2fD5000b6F2dc3be3adA80415C68af1023F1a",
  IBGT: "0x17dc08d736669ba7Ff65EAD67a809519E36f311C",
  USDT: "0x0A3095eB06F507E1a4854d48169389629F0600EF",
};

export const local_pools = [
  "0x6202EF6c04EE00382406d1dd2c6F57F084aDa0De",
  "0x2d097Cf9DBAdaEE0542bcc81e6E8C8f721D7e5F5",
  "0x466Cb2ED05174d40a14F9Dd655d9D77e365b5200",
  "0x1aCE1677eD84A8aA5D2e2a23D4A5A3BB32fae322",
  "0xb8ca670C678cD2346be390bE69Cd3d1c35A2a376",
  "0x033CfEF63c6550cf4591F493f2fA9E2af3d9467b",
];

export const aggregators = main_aggregators;
export const pools = main_pools;
