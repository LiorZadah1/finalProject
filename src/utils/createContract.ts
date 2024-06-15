import { ethers } from 'ethers';

/**
 * Creates an ethers.js Contract instance using the provided Ethereum provider.
 * @param ethereum - Ethereum provider, typically from window.ethereum in DApp environments.
 * @param contractAddress - The address of the deployed contract.
 * @param contractABI - The ABI of the contract, typically an array or JSON.
 * @returns A promise that resolves to an ethers Contract instance.
 */
export async function createContract(ethereum: any, contractAddress: string, contractABI: any) {
    if (!ethereum) {
        throw new Error("Ethereum object is not available!");
    }

    console.log("Creating contract with the following parameters:");
    console.log("Ethereum object:", ethereum);
    console.log("Contract Address:", contractAddress);
    console.log("Contract ABI:", contractABI);

    // Validate the contract address
    if (!ethers.isAddress(contractAddress)) {
        throw new Error("Invalid contract address");
    }

    // Validate the ABI
    if (!Array.isArray(contractABI)) {
        throw new Error("Invalid contract ABI");
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Contract instance created successfully:", contract);
        return contract;
    } catch (error) {
        console.error("Error creating contract instance:", error);
        throw error;
    }
}


//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner(); // Make sure to await the Promise here
//     const contract = new ethers.Contract(contractAddress, contractABI, signer);
//     return contract;