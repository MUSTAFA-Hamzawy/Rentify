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
export function TrimString(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'TrimString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          if (!value) return true; // pass to the next validation
          args.object[propertyName] = value.trim();
          return true;
        },
      },
    });
  };
}
