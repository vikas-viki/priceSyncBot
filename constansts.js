import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ETH_RPC = `https://base-sepolia.g.alchemy.com/v2/${process.env.ETH_API_KEY}`;
// const LOCAL_RPC = `http://127.0.0.1:8545/`;
const LOCAL_RPC = ETH_RPC;

export const ETH_PROVIDER = new ethers.providers.JsonRpcProvider(ETH_RPC);
export const LOCAL_PROVIDER = new ethers.providers.JsonRpcProvider(LOCAL_RPC);
export const Wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  LOCAL_PROVIDER
);
export const USER = "0xd4EeD53acbdF5bEBDF34eF1fD06b4aB2eCFA97d1";
export const SWAP_ROUTER = "0x495736e3D1da2E91783d7CD3cd9eebC8Ef09A77B";
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

export const aggregators = {
  DAI: "0x3092de9eA83380c7b51000eEcF43fEF65EEfE6E8",
  USDC: "0x71b88AF6fdd9340c22746303CB3a93a36766C4ae",
  USDT: "0x362475dDb3d31Ce34b465eccaC3c5183e5d7aeAd",
  ARB: "0xfc8542eb38be018F5078e4fA9664fe860BD86De1",
  WETH: "0x43955B4beEFE4909590396BcDa93ee7a74cDD33C",
  WBTC: "0x5FDB93d1C97AcA503Da2d6897832eb1e34f5348f",
  LINK: "0x83a7A2FB1Dab905112B780FBA9354b9326D8ce76",
};

export const pools = [
  "0x8ce6629F925D57F69Eefe223bf8dEb68374d285D",
  "0xc86dDe9f0dDAe989D00bbbe4f36d777C4A2da5A9",
  "0xF7d9494BB4424dE5C99665637E4E82068DC811A9",
  "0x7743f5b504bFd9a81e23187dc6f334e296d70E54",
  "0x02bd0D2cDE319638c2b56AcC1DeDB0AeaD4895c0",
  "0xBdB38492ecb5484280B040B30004E86aeB7a1c47",
  "0x0a680bd182a5D6b53B37F0D465b0818B4BF9052A",
  "0xE1bc6A4B363aA649286Ab0D09f648f17B3512065",
  "0xAB566Da98dA746eb1B00c900F07081682E4a4115",
  "0xFbeC9D67c723Aa48ea0E6E13aFaa4c6969E98160",
  "0xD2c107128bF010281f08b9c77F444c13b6496A3D",
  "0x51c86d42E022F087c692f5A901aFC433ebc4b9F9",
  "0xD3c41D5cCEe9D837d30cd2ABbdb90529B21761B4",
  "0xd842Afbe353E684C10D2E6870599Eeae489dE894",
  "0x7e5cA180B0E669466C6917A5A1D227a332c807B8",
  "0x18bCc8DFD1FeE3048F82e0FeCC25f8416922E197",
  "0xfC3d6C2721973247D1D6b33350717002bD9e81C3",
  "0xe30c16F9E1f68c20690A57B1766b89154f984464",
  "0xCc420f3Af83846a9508535E256F9118576B8a109",
  "0x7b4c7a671ac3A3f3825b066D454FfaE41C6f01d2",
  "0xC74302eC9CE04550749720574416E40f3C6DbC83",
];
