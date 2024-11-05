import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  HttpStatus,
  ValidationPipe, Req, ParseIntPipe, Query, DefaultValuePipe,
} from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { ContactUs } from './entities/contact-us.entity';

@Controller('contact-us')
@UseInterceptors(ResponseInterceptor)
export class ContactUsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Your Message sent successfully.')
  async create(@Body(ValidationPipe) createContactUsDto: CreateContactUsDto, @Req() req): Promise<void> {
    try {
      const user_id: number = req.user.user_id;
      await this.contactUsService.create(user_id, createContactUsDto);
    } catch (error) {
      this.logger.error(error.message, `create, ${ContactUsController.name}`);
      throw error;
    }
  }

  @Get()
  @ResponseMessage('Messages retrieved successfully.')
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    try {
      return this.contactUsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${ContactUsController.name}`);
      throw error;
    }
  }

  @Get('get-message/:id')
  @ResponseMessage('Message retrieved successfully.')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    try {
      return this.contactUsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${ContactUsController.name}`);
      throw error;
    }
  }

  @Patch('resolve-message/:id')
  @ResponseMessage('Message resolved successfully.')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateContactUsDto: UpdateContactUsDto) {
    try {
      await this.contactUsService.resolveMessage(+id);
    } catch (error) {
      this.logger.error(error.message, `update, ${ContactUsController.name}`);
      throw error;
    }
  }

  @Delete(':id')
  @ResponseMessage('Message removed successfully.')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.contactUsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${ContactUsController.name}`);
      throw error;
    }
  }
}