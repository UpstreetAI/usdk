import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export const generateMnemonic = () => bip39.generateMnemonic(wordlist);