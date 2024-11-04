import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ROOT_PATH } from '../../config/app.config';
import { formatDistanceToNow } from 'date-fns';
import * as path from 'path';
import * as fs from 'fs';

/**
 * This class contains helper methods for various operations.
 */
export class Helpers {
  /**
   * This method calculates the difference between the current time and a given timestamp.
   * @param timestamp - The timestamp to calculate the difference from.
   * @returns The calculated difference in a human-readable format.
   */
  public static timestampDifference(timestamp: string): string {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * This method removes a file from the uploads directory.
   * @param fileName - The name of the file to be removed.
   * @returns A promise that resolves when the file is successfully removed.
   */
  public static async removeFile(fileName: string): Promise<void> {
    if (!fileName) return;
    try {
      const filePath = path.join(ROOT_PATH, 'uploads', fileName || '');
      fs.stat(filePath, async err => {
        if (err) return;
        fs.unlink(filePath, err => {
          if (err) throw new InternalServerErrorException(err);
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Capitalizes the first character of a given string.
   *
   * @param {string} str - The input string to be modified.
   * @returns {string} - A new string with the first character capitalized.
   */
  public static UCFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  public static ResponseFormat(
    message: string = 'Request processed successfully',
    data = {},
    statusCode: number = HttpStatus.OK,
  ) {
    return { status: statusCode, message: message, data: data };
  }
}
