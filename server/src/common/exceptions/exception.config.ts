import { HttpException } from '@nestjs/common';

function createException(
  message: string,
  statusCode: number,
  description?: string
): HttpException {
  return new HttpException(message, statusCode, { description });
}

export const exceptions = {
  NOT_FOUND: createException('Not Found', 404),
  INDEX_OUT_OF_BOUNDS: createException('Index out of bounds', 400),
  NAME_CANNOT_BE_EMPTY: createException('Name cannot be empty', 400),
  USER_NOT_FOUND: createException('User not found', 400),
  NOT_THE_CONTRACT_OWNER: createException('Not the contract owner', 400),
  ONLY_OWNER: createException('Only the owner can call withdraw.', 400),

  createBadRequestException: (message: string) => createException(message, 400),
};
