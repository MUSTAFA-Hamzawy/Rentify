import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { API_PATH, ROOT_PATH } from '../../config/app.config';
import { formatDistanceToNow } from 'date-fns';
import * as path from 'path';
import * as fs from 'fs';
import * as CC from 'currency-converter-lt';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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

  /**
   * To get the static path of a file for frontend.
   *
   * @param {string} relativePath - relative path which stored in db
   * @returns {string} - A new string with the absolute path.
   */
  public static getStaticFilePublicPath(relativePath: string): string {
    return relativePath
      ? `${process.env.HOST}:${process.env.PORT}/uploads/${relativePath}`
      : null;
  }

  /**
   * Converts a given amount from one currency to another using real-time exchange rates.
   *
   * @param {string} from - The currency code to convert from (e.g., "USD").
   * @param {string} to - The currency code to convert to (e.g., "EGP").
   * @param {number} amount - The amount of money to convert.
   * @returns {Promise<string> | Promise<number>} - Returns the converted amount as a number if the currencies are different,
   * or the original amount if the "from" and "to" currencies are the same.
   * @throws {InternalServerErrorException} - Throws an error if the currency conversion fails.
   */
  public static async convertCurrency(
    from: string,
    to: string,
    amount: number,
  ): Promise<Promise<string> | Promise<number>> {
    if (from == to) return amount;
    try {
      return await new CC({ from, to, amount }).convert();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Adjusts the port in the OpenAPI documentation JSON file to match the specified port.
   * This is useful for dynamically updating the API documentation link, ensuring
   * it reflects the current server port.
   *
   * @param port - The new port to set in the server URL in the OpenAPI JSON file.
   * @throws Error if there is an issue reading or writing to the OpenAPI JSON file.
   */
  public static adjustAPIDocsLink(port: string): void{
    const API_DOCS_PATH: string = join(API_PATH, 'docs', 'openapi.json');
    try {
      // Read the openapi.json file content
      const fileContent = readFileSync(API_DOCS_PATH, 'utf-8');
      const apiDocs = JSON.parse(fileContent);

      // Update the server URL with the specified port
      if (apiDocs.servers && apiDocs.servers.length > 0) {
        apiDocs.servers[0].url = apiDocs.servers[0].url.replace(/:\d+/, `:${port}`);
      }

      // Write the updated content back to the openapi.json file
      writeFileSync(API_DOCS_PATH, JSON.stringify(apiDocs, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to update API docs link:', error);
      throw new Error('Could not update the OpenAPI documentation link');
    }
  }

}
