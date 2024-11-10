import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Decorator to trim string properties in an object.
 *
 * @param validationOptions Optional validation options.
 * @returns A function that registers the decorator.
 */
export function TrimString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'TrimString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          if (!value) return true;
          if (value.trim().length === 0) return false;
          args.object[propertyName] = value.trim();
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} can not be empty.`;
        },
      },
    });
  };
}
