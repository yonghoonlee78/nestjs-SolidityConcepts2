import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    ethers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getBalance: jest.fn().mockResolvedValue(BigInt(5e18)),
      })),
      Wallet: jest.fn().mockImplementation(() => ({
        address: '0xMockSigner',
        sendTransaction: jest
          .fn()
          .mockResolvedValue({ wait: jest.fn().mockResolvedValue('receipt') }),
      })),
      Contract: jest.fn().mockImplementation(() => mockContract),
    },
    zeroPadValue: jest.fn((data, len) => `padded(${data},${len})`),
    encodeBytes32String: jest.fn((str) => `encoded(${str})`),
    isBytesLike: jest.fn(() => true),
    toUtf8Bytes: jest.fn(() => new Uint8Array()),
    parseEther: jest.fn((val) => BigInt(Number(val) * 1e18)),
    formatEther: jest.fn((val) => (Number(val) / 1e18).toString()),
  };
});

const mockWait = jest.fn().mockResolvedValue('receipt');

const mockContract = {
  owner: jest.fn().mockResolvedValue('0xOwnerAddress'),
  sentValue: jest.fn().mockResolvedValue(BigInt(1e18)),
  timestamp: jest.fn().mockResolvedValue(1234567890),
  gasUsed: jest.fn().mockResolvedValue(21000),
  deposit: jest.fn().mockResolvedValue({ wait: mockWait }),
  getCaller: jest.fn().mockResolvedValue('0xCaller'),
  getOrigin: jest.fn().mockResolvedValue('0xOrigin'),
  getBlockDetails: jest
    .fn()
    .mockResolvedValue([1234, 123456n, 30000000n, '0xMiner']),
  trackGasUsage: jest.fn().mockResolvedValue({ wait: mockWait }),
  generateHash: jest.fn().mockResolvedValue('0xHash'),
  withdraw: jest.fn().mockResolvedValue({ wait: mockWait }),
};

describe('EthersService', () => {
  let service: EthersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'RPC_URL') return 'https://mock.rpc';
              if (key === 'PRIVATE_KEY') return 'mockPrivateKey';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EthersService>(EthersService);
  });

  it('owner()는 소유자 주소를 반환해야 합니다.', async () => {
    expect(await service.owner()).toBe('0xOwnerAddress');
  });

  it('sentValue()는 ether 단위 문자열을 반환해야 합니다.', async () => {
    expect(await service.sentValue()).toBe('1');
  });

  it('timestamp()는 타임스탬프를 반환해야 합니다.', async () => {
    expect(await service.timestamp()).toBe(1234567890);
  });

  it('gasUsed()는 사용된 가스량을 반환해야 합니다.', async () => {
    expect(await service.gasUsed()).toBe(21000);
  });

  it('deposit()는 트랜잭션 영수증을 반환해야 합니다.', async () => {
    const receipt = await service.deposit(1);
    expect(receipt).toBe('receipt');
  });

  it('getCaller()는 msg.sender 값을 반환해야 합니다.', async () => {
    expect(await service.getCaller()).toBe('0xCaller');
  });

  it('getOrigin()은 tx.origin 값을 반환해야 합니다.', async () => {
    expect(await service.getOrigin()).toBe('0xOrigin');
  });

  it('getBlockDetails()는 블록 정보를 반환해야 합니다.', async () => {
    const result = await service.getBlockDetails();
    expect(result).toEqual([1234, 123456n, 30000000n, '0xMiner']);
  });

  it('trackGasUsage()는 트랜잭션 영수증을 반환해야 합니다.', async () => {
    const receipt = await service.trackGasUsage();
    expect(receipt).toBe('receipt');
  });

  it('generateHash()는 해시 값을 반환해야 합니다.', async () => {
    const hash = await service.generateHash('hello');
    expect(hash).toBe('0xHash');
  });

  it('withdraw()는 트랜잭션 영수증을 반환해야 합니다.', async () => {
    const receipt = await service.withdraw(1);
    expect(receipt).toBe('receipt');
  });
});
