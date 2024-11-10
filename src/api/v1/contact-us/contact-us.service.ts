import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

/**
 * Service to handle operations related to contact messages from users.
 */
@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Creates a new contact message from a user.
   * @param user_id - The ID of the user sending the message.
   * @param createContactUsDto - The data transfer object containing the message details.
   * @throws NotFoundException if the user does not exist or is blocked.
   */
  async create(
    user_id: number,
    createContactUsDto: CreateContactUsDto,
  ): Promise<void> {
    try {
      // check that user_id exists
      await this.usersRepository.findOneOrFail({
        where: { user_id: user_id, is_blocked: false, account_disabled: false },
        select: ['user_id'],
      });

      // insert the message
      await this.contactUsRepository.save({
        user_id: user_id,
        message: createContactUsDto.message,
        subject: createContactUsDto.subject,
        status: 0, // 0 : pending
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Sorry, this user can not send a message.');
      throw new Error(error);
    }
  }

  /**
   * Retrieves a paginated list of all contact messages.
   * @param page - The page number to retrieve (default is 1).
   * @param limit - The number of messages per page (default is 10).
   * @returns An object containing the list of messages, total count, current page, and total pages.
   */
  async findAll(page: number = 1, limit: number = 10) {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      const [results, total]: any = await this.contactUsRepository
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.user', 'user')
        .select([
          'contact.id',
          'contact.message',
          'contact.subject',
          'contact.created_at',
          'contact.updated_at',
          'contact.status',
          'user.full_name',
        ])
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      results.map(
        msg => (msg.status = msg.status === 0 ? 'Pending' : 'Resolved'),
      );

      return {
        contactMessages: results,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      throw new Error(error);
    }
  }

  /**
   * Retrieves a specific contact message by its ID.
   * @param id - The ID of the contact message to retrieve.
   * @returns The contact message object, including user details.
   * @throws NotFoundException if the message is not found.
   */
  async findOne(id: number): Promise<ContactUs> {
    try {
      const contactMessage: any = await this.contactUsRepository
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.user', 'user')
        .select([
          'contact.id',
          'contact.message',
          'contact.subject',
          'contact.status',
          'contact.created_at',
          'contact.updated_at',
          'user.full_name',
        ])
        .where('contact.id = :id', { id })
        .getOne();

      if (!contactMessage) throw new NotFoundException('Message not found.');

      contactMessage.status =
        contactMessage.status === 0 ? 'Pending' : 'Resolved';
      return contactMessage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Message is not found.');
      }
      throw new Error(error);
    }
  }

  /**
   * Resolves a contact message by updating its status to resolved.
   * @param id - The ID of the contact message to resolve.
   * @throws NotFoundException if the message is not found.
   */
  async resolveMessage(id: number): Promise<void> {
    try {
      await this.contactUsRepository.findOneByOrFail({ id });
      await this.contactUsRepository.update(id, { status: 1 });
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Message not found.');
      throw new Error(error);
    }
  }

  /**
   * Deletes a contact message by its ID.
   * @param id - The ID of the contact message to delete.
   * @throws NotFoundException if the message is not found.
   */
  async remove(id: number): Promise<void> {
    try {
      await this.contactUsRepository.findOneByOrFail({ id });
      await this.contactUsRepository.delete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Message not found.');
      throw new Error(error);
    }
  }
}
