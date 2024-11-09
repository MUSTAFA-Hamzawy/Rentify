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
import { Role } from '../../../common/role.enum';
import { Roles } from '../../../common/decorators/roles.decorator';

/**
 * Controller for managing 'Contact Us' messages.
 * Handles creating, retrieving, updating, and deleting messages from users.
 */
@Controller('contact-us')
@UseInterceptors(ResponseInterceptor)
export class ContactUsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly contactUsService: ContactUsService) {}

  /**
   * Creates a new contact us message.
   *
   * @param createContactUsDto - Data transfer object containing the message details.
   * @param req - The request object, used to access user information.
   * @returns {Promise<void>} - A promise that resolves when the message is successfully created.
   * @throws Will log an error and throw it if creation fails.
   */
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

  /**
   * Retrieves all contact us messages with pagination.
   *
   * @param page - The page number to retrieve (default is 1).
   * @param limit - The number of messages per page (default is 20).
   * @returns {Promise<ContactUs[]>} - A promise that resolves to an array of contact us messages.
   * @throws Will log an error and throw it if retrieval fails.
   */
  @Get()
  @ResponseMessage('Messages retrieved successfully.')
  @Roles(Role.Admin)
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    try {
      return this.contactUsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${ContactUsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves a specific contact us message by ID.
   *
   * @param id - The ID of the message to retrieve.
   * @returns {Promise<ContactUs>} - A promise that resolves to the requested contact us message.
   * @throws Will log an error and throw it if retrieval fails.
   */
  @Get('get-message/:id')
  @ResponseMessage('Message retrieved successfully.')
  @Roles(Role.Admin)
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<ContactUs> {
    try {
      return this.contactUsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${ContactUsController.name}`);
      throw error;
    }
  }

  /**
   * Resolves a specific contact us message by ID.
   *
   * @param id - The ID of the message to resolve.
   * @param updateContactUsDto - Data transfer object containing the updated message details.
   * @returns {Promise<void>} - A promise that resolves when the message is successfully resolved.
   * @throws Will log an error and throw it if resolution fails.
   */
  @Patch('resolve-message/:id')
  @ResponseMessage('Message resolved successfully.')
  @Roles(Role.Admin)
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateContactUsDto: UpdateContactUsDto): Promise<void> {
    try {
      await this.contactUsService.resolveMessage(+id);
    } catch (error) {
      this.logger.error(error.message, `update, ${ContactUsController.name}`);
      throw error;
    }
  }

  /**
   * Deletes a specific contact us message by ID.
   *
   * @param id - The ID of the message to delete.
   * @returns {Promise<void>} - A promise that resolves when the message is successfully deleted.
   * @throws Will log an error and throw it if deletion fails.
   */
  @Delete(':id')
  @ResponseMessage('Message removed successfully.')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    try {
      await this.contactUsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${ContactUsController.name}`);
      throw error;
    }
  }
}
