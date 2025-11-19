import { NotFoundException } from '../../../common/exceptions/common.exceptions';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super('User', { userId });
  }
}
