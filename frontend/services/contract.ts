import { ethers } from 'ethers';
// We will load the ABIs exported from Hardhat
import contractInfo from '../constants/contractInfo.json';

// Local hardhat node URL
const RPC_URL = "http://127.0.0.1:8545";

export const getProvider = () => {
    return new ethers.JsonRpcProvider(RPC_URL);
};

export const getContracts = async (privateKey) => {
    try {
        const provider = getProvider();
        // The first account from hardhat local node for testing purposes
        const wallet = new ethers.Wallet(privateKey || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

        const responderSBT = new ethers.Contract(
            contractInfo.ResponderSBT.address,
            contractInfo.ResponderSBT.abi,
            wallet
        );

        const emergencyRegistry = new ethers.Contract(
            contractInfo.EmergencyRegistry.address,
            contractInfo.EmergencyRegistry.abi,
            wallet
        );

        return { responderSBT, emergencyRegistry, wallet };
    } catch (e) {
        console.error("MetaMask / Ethers provider failed to connect: ", e);
        return null;
    }
};

export const mintBadge = async (responderAddress, score) => {
    const contracts = await getContracts();
    if (!contracts) return false;
    
    try {
        // Only admin can mint, so wallet must be the deployer
        const tx = await contracts.responderSBT.assignBadge(responderAddress, score);
        await tx.wait();
        return true;
    } catch (e) {
        console.error("Mint failed:", e);
        return false;
    }
}
