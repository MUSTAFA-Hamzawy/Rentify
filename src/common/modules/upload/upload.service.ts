import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Multer } from 'multer';
import { ALLOWED_IMAGE_TYPES } from '../../../config/app.config';
import { promises as fs } from 'fs';
import * as fileTypeChecker from 'file-type-checker';

import { LoggerService } from '../logger/logger.service';

/**
 * UploadService is responsible for handling file uploads and validating their types.
 */
@Injectable()
export class UploadService {
  private readonly logger: LoggerService = new LoggerService();

  /**
   * Validates the type of an uploaded image file.
   *
   * @param file The file to be validated.
   * @throws BadRequestException if no file is uploaded or if the file type is not allowed.
   * @throws InternalServerErrorException if an internal server error occurs.
   */
  async validateImage(file: Multer.File): Promise<void> {
    try {
      if (!file) throw new BadRequestException('No image uploaded');
      const isImage = fileTypeChecker.validateFileType(
        await fs.readFile(file.path),
        ALLOWED_IMAGE_TYPES,
      );

      if (!isImage) {
        await fs.unlink(file.path);
        throw new BadRequestException(
          'Invalid image type, allowed types are ' +
            ALLOWED_IMAGE_TYPES.join(', '),
        );
      }
    } catch (e) {
      this.logger.error(e.message, `validateImage, ${UploadService.name}`);

      if (e instanceof BadRequestException)
        throw new BadRequestException(e.message);
      throw new InternalServerErrorException(e);
    }
  }

  /**
   * Validates multiple files.
   *
   * @param files The files to be validated.
   * @throws BadRequestException if no file is uploaded or if the file type is not allowed.
   * @throws InternalServerErrorException if an internal server error occurs.
   */
  async validateMultipleImages(files: Multer.File[]): Promise<void> {
    try {
      if (files.length === 0)
        throw new BadRequestException('No files uploaded');
      files.forEach(file => {
        this.validateImage(file);
      });
    } catch (e) {
      this.logger.error(
        e.message,
        `validateMultipleImages, ${UploadService.name}`,
      );

      if (e instanceof BadRequestException)
        throw new BadRequestException(e.message);
      throw new InternalServerErrorException(e);
    }
  }
}
