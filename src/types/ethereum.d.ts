import { Contract } from 'ethers';

export interface MyContract extends Contract {
    myMethod: (param: string) => Promise<void>;
    // Add other methods signatures here
}
