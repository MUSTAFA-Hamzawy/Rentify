import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'config/multer.config';
import { UploadService } from './upload.service';

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
