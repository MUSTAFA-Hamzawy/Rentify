import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsTodayOrAfter(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTodayOrAfter',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const today: number = new Date().setHours(0, 0, 0, 0).valueOf();
          const inputDate: number = new Date(value).valueOf();
          return inputDate >= today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be today or a future date.`;
        },
      },
    });
  };
}
