import { Test, TestingModule } from '@nestjs/testing';
import { BankService } from './bank.service';
import { EthersService } from '../../ethers/ethers.service';
import { exceptions } from '../../../common/exceptions/exception.config';

const mockEthersService = {
  owner: jest.fn(),
  sentValue: jest.fn(),
  timestamp: jest.fn(),
  gasUsed: jest.fn(),
  deposit: jest.fn(),
  getCaller: jest.fn(),
  getOrigin: jest.fn(),
  getBlockDetails: jest.fn(),
  trackGasUsage: jest.fn(),
  generateHash: jest.fn(),
  withdraw: jest.fn(),
};

describe('BankService', () => {
  let service: BankService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        { provide: EthersService, useValue: mockEthersService },
      ],
    }).compile();

    service = module.get<BankService>(BankService);
  });

  it('getOwner()는 소유자 주소를 반환해야 합니다.', async () => {
    mockEthersService.owner.mockResolvedValue('0xOwner');
    expect(await service.getOwner()).toBe('0xOwner');
  });

  it('getBalance()는 sentValue를 반환해야 합니다.', async () => {
    mockEthersService.sentValue.mockResolvedValue('1.0');
    expect(await service.getBalance()).toBe('1.0');
  });

  it('getTimestamp()는 timestamp를 반환해야 합니다.', async () => {
    mockEthersService.timestamp.mockResolvedValue(1234567890);
    expect(await service.getTimestamp()).toBe(1234567890);
  });

  it('getGas()는 사용된 가스를 문자열로 반환해야 합니다.', async () => {
    mockEthersService.gasUsed.mockResolvedValue(21000n);
    expect(await service.getGas()).toBe('21000');
  });

  it('deposit()은 트랜잭션 영수증을 반환해야 합니다.', async () => {
    mockEthersService.deposit.mockResolvedValue('receipt');
    expect(await service.deposit(1)).toBe('receipt');
  });

  it('getCaller()는 호출자 주소를 반환해야 합니다.', async () => {
    mockEthersService.getCaller.mockResolvedValue('0xCaller');
    expect(await service.getCaller()).toBe('0xCaller');
  });

  it('getOrigin()은 트랜잭션 발신자 주소를 반환해야 합니다.', async () => {
    mockEthersService.getOrigin.mockResolvedValue('0xOrigin');
    expect(await service.getOrigin()).toBe('0xOrigin');
  });

  it('getBlockDetails()는 블록 정보를 객체로 반환해야 합니다.', async () => {
    mockEthersService.getBlockDetails.mockResolvedValue([
      1234,
      123456n,
      30000000n,
      '0xMiner',
    ]);
    const result = await service.getBlockDetails();
    expect(result).toEqual({
      blockNumber: '1234',
      blockPrevrandao: '123456',
      blockGasLimit: '30000000',
      blockCoinBase: '0xMiner',
    });
  });

  it('getGasTrack()는 트랜잭션 영수증을 반환해야 합니다.', async () => {
    mockEthersService.trackGasUsage.mockResolvedValue('receipt');
    expect(await service.getGasTrack()).toBe('receipt');
  });

  it('getHash()는 해시 값을 반환해야 합니다.', async () => {
    mockEthersService.generateHash.mockResolvedValue('0xHash');
    expect(await service.getHash('hello')).toBe('0xHash');
  });

  it('withdraw()는 트랜잭션 영수증을 반환해야 합니다.', async () => {
    mockEthersService.withdraw.mockResolvedValue('receipt');
    expect(await service.withdraw(1)).toBe('receipt');
  });

  it('withdraw()는 소유자가 아닐 경우 ONLY_OWNER 예외를 던져야 합니다.', async () => {
    mockEthersService.withdraw.mockRejectedValue({
      reason: 'Only the owner can call withdraw.',
    });
    await expect(service.withdraw(1)).rejects.toEqual(exceptions.ONLY_OWNER);
  });
});
