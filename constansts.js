import { ethers } from "ethers";

const ETH_API_KEY = "3S3xvV91fSejSDcoa8S3wvdOa5ob0K-T";
const PRIVATE_KEY = "efde48e9cb44e58236c6aa11a72384e4012b7ab971f35815b7f1cfb16426f71e";

export const ETH_PROVIDER = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ETH_API_KEY}`);
export const Wallet = new ethers.Wallet(PRIVATE_KEY, ETH_PROVIDER);
export const SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const USER = "0xd4EeD53acbdF5bEBDF34eF1fD06b4aB2eCFA97d1";
