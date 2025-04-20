import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BankService } from '../service/bank.service';
import { SendEtherDto } from '../dto/send-ether.dto';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get('owner')
  async getOwner() {
    return await this.bankService.getOwner();
  }

  @Get('balance')
  async getBalance() {
    return await this.bankService.getBalance();
  }

  @Get('timestamp')
  async getTimestamp() {
    return await this.bankService.getTimestamp();
  }

  @Get('gas')
  async getGas() {
    return await this.bankService.getGas();
  }

  @Post('deposit')
  async deposit(@Body() sendEtherDto: SendEtherDto) {
    return await this.bankService.deposit(sendEtherDto.value);
  }

  @Get('caller')
  async getCaller() {
    return await this.bankService.getCaller();
  }

  @Get('origin')
  async getOrigin() {
    return await this.bankService.getOrigin();
  }

  @Get('block/details')
  async getBlockDetails() {
    return await this.bankService.getBlockDetails();
  }

  @Post('gas/track')
  async getGasTrack() {
    return await this.bankService.getGasTrack();
  }

  @Get('hash')
  async getHash(@Query('message') message: string) {
    return await this.bankService.getHash(message);
  }

  @Post('withdraw')
  async withDraw(@Body() sendEtherDto: SendEtherDto) {
    return await this.bankService.withdraw(sendEtherDto.value);
  }
}
