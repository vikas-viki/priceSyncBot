import { ethers } from "ethers";

const ETH_API_KEY = "";
const PRIVATE_KEY = "";

export const ETH_PROVIDER = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ETH_API_KEY}`);
export const Wallet = new ethers.Wallet(PRIVATE_KEY, ETH_PROVIDER);
export const SWAP_ROUTER = "SWAP_ROUTER";
export const USER = "";
