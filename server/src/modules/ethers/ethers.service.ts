import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ethers,
  zeroPadValue,
  encodeBytes32String,
  isBytesLike,
  toUtf8Bytes,
  parseEther,
  formatEther,
} from 'ethers';
import { abi, address } from '../../../abis/Bank.json';

@Injectable()
export class EthersService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey!, this.provider);
    this.contract = new ethers.Contract(address, abi, this.signer);
  }

  zeroPadValue32(data: string) {
    return zeroPadValue(data, 32);
  }

  encodeBytes32String(data: string) {
    return encodeBytes32String(data);
  }

  isBytesLike(data: string) {
    return isBytesLike(data);
  }

  toUtf8Bytes(data: string) {
    return toUtf8Bytes(data);
  }

  parseEther(data: string) {
    return parseEther(data);
  }

  formatEther(data: bigint) {
    return formatEther(data);
  }

  // 위 코드는 지우지 마세요.

  async owner() {
    // Todo: owner의 값을 리턴합니다.
    return await this.contract.owner();
  }

  async sentValue() {
    // Todo: sentValue의 값을 리턴합니다.
    // ⚠️ 리턴은 ether 단위로 리턴합니다.(wei => ether)
    const value = await this.contract.sentValue();
    return formatEther(value);
  }

  async timestamp() {
    // Todo: timestamp의 값을 리턴합니다.
    return await this.contract.timestamp();
  }

  async gasUsed() {
    // Todo: gasUsed의 값을 리턴합니다.
    return await this.contract.gasUsed();
  }

  async deposit(value: number) {
    // Todo: deposit 함수를 실행합니다.
    // ⚠️ tx 확정 후 영수증을 리턴합니다.(wait)
    const tx = await this.contract.deposit({ 
      value: parseEther(value.toString()) 
    });
    return await tx.wait();
  }

  async getCaller() {
    // Todo: getCaller 함수를 실행하여 caller의 값을 리턴합니다.
    return await this.contract.getCaller();
  }

  async getOrigin() {
    // Todo: getOrigin 함수를 실행하여 origin의 값을 리턴합니다.
    return await this.contract.getOrigin();
  }

  async getBlockDetails() {
    // Todo: getBlockDetails 함수를 실행하여 block details를 리턴합니다.
    return await this.contract.getBlockDetails();
  }

  async trackGasUsage() {
    // Todo: trackGasUsage 함수를 실행합니다.
    // ⚠️ tx 확정 후 영수증을 리턴합니다.(wait)
    const tx = await this.contract.trackGasUsage();
    return await tx.wait();
  }

  async generateHash(message: string) {
    // Todo: generateHash 함수를 실행하여 hash를 리턴합니다.
    return await this.contract.generateHash(message);
  }

  async withdraw(value: number) {
    // Todo: withDraw의값을 리턴합니다.
    // ⚠️ setter함수는 tx 확정 후 영수증을 리턴합니다.(wait)
    const tx = await this.contract.withdraw(parseEther(value.toString()));
    return await tx.wait();
  }
}
