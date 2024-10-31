import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validation decorator to ensure two password fields match.
 * 
 * @param property The name of the property to match against.
 * @param validationOptions Optional validation options.
 * @returns A function that registers the decorator.
 */
export function PasswordMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordMatch',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: string, args: ValidationArguments) {
          const relatedValue = (args.object)[args.constraints[0]];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} must match ${args.constraints[0]}`;
        },
      },
    });
  };
}
