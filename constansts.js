import { ethers } from "ethers";

const ETH_API_KEY = "3S3xvV91fSejSDcoa8S3wvdOa5ob0K-T";
const PRIVATE_KEY = "efde48e9cb44e58236c6aa11a72384e4012b7ab971f35815b7f1cfb16426f71e";

const ETH_RPC = `https://eth-mainnet.g.alchemy.com/v2/${ETH_API_KEY}`;
const LOCAL_RPC = `http://127.0.0.1:8545/`;

export const ETH_PROVIDER = new ethers.providers.JsonRpcProvider(ETH_RPC);
export const LOCAL_PROVIDER = new ethers.providers.JsonRpcProvider(LOCAL_RPC);
export const Wallet = new ethers.Wallet(PRIVATE_KEY, LOCAL_PROVIDER);
export const USER = "0xd4EeD53acbdF5bEBDF34eF1fD06b4aB2eCFA97d1";
