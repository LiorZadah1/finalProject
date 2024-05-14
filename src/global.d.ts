// global.d.ts
import { ExternalProvider } from '@ethersproject/providers';
import { providers } from 'ethers';

declare global {
  interface Window {
    ethereum: ExternalProvider;
    ethereum: providers.ExternalProvider;
  }
}