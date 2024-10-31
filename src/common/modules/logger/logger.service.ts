import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

import { ROOT_PATH } from 'config/app.config';

/**
 * LoggerService extends ConsoleLogger to provide additional logging functionality.
 * It logs messages to a file in addition to the console.
 */
@Injectable()
export class LoggerService extends ConsoleLogger {
  /**
   * Logs an entry to a file asynchronously.
   * 
   * @param entry The entry to be logged.
   */
  async logToFile(entry: string): Promise<void> {
    const formattedEntry = `[${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Africa/Cairo',
    }).format(new Date())}]\t${entry}\n\n`;

    try {
      if (!fs.existsSync(path.join(ROOT_PATH, 'logs'))) {
        await fsPromises.mkdir(path.join(ROOT_PATH, 'logs'));
      }
      await fsPromises.appendFile(
        path.join(ROOT_PATH, 'logs', 'logs.log'),
        formattedEntry,
      );
    } catch (e) {
      console.error(e.message);
    }
  }

  /**
   * Logs a message to the file and console if in development mode.
   * 
   * @param message The message to be logged.
   * @param context Optional context for the message.
   */
  log(message: string, context?: string): void {
    const entry: string = `${context}\t${message}`;
    this.logToFile(entry);
    if (process.env.NODE_ENV === 'development') super.log(message, context);
  }

  /**
   * Logs an error message to the file and console if in development mode.
   * 
   * @param message The error message to be logged.
   * @param stackOrContext Optional stack trace or context for the error.
   */
  error(message: string, stackOrContext?: string): void {
    const entry: string = `${stackOrContext}\t${message}`;
    this.logToFile(entry);
    if (process.env.NODE_ENV === 'development') super.error(message, stackOrContext);
  }
}
