import { Module } from '@nestjs/common';
import { BankService } from './service/bank.service';
import { BankController } from './controller/bank.controller';
import { EthersService } from '../ethers/ethers.service';

@Module({
  controllers: [BankController],
  providers: [BankService, EthersService],
})
export class BankModule {}
