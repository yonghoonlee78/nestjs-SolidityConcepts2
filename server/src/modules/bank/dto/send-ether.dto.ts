import { IsNotEmpty, IsNumber } from 'class-validator';

export class SendEtherDto {
  @IsNotEmpty()
  @IsNumber()
  value: number;
}
