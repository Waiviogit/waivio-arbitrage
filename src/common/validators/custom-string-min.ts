import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import BigNumber from 'bignumber.js';

@ValidatorConstraint({ name: 'CustomStringMin', async: false })
export class CustomStringMin implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const constraints = args.constraints;
    return new BigNumber(value).gte(constraints[0]);
  }

  defaultMessage(args: ValidationArguments): string {
    return '($value) is too small';
  }
}
