import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ContactUsService {

  constructor(@InjectRepository(ContactUs) private readonly contactUsRepository: Repository<ContactUs>,
              @InjectRepository(User) private readonly usersRepository: Repository<User>) {}


  async create(user_id:number, createContactUsDto: CreateContactUsDto): Promise<void> {
    try {
      // check that user_id exists
      await this.usersRepository.findOneOrFail({where:{user_id: user_id, is_blocked: false, account_disabled: false}, select:['user_id']});

      // insert the message
      await this.contactUsRepository.save({
        user_id: user_id,
        message: createContactUsDto.message,
        subject: createContactUsDto.subject,
        status: 0  // 0 : pending
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('Sorry, this user can not send a message.');
      throw new Error(error);
    }
  }

  async findAll(page: number = 1, limit: number = 10){
    try {
      const [results, total]: any = await this.contactUsRepository
        .createQueryBuilder("contact")
        .leftJoinAndSelect("contact.user", "user")
        .select([
          "contact.id",
          "contact.message",
          "contact.subject",
          "contact.created_at",
          "contact.updated_at",
          "contact.status",
          "user.full_name"
        ])
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      results.map((msg) => msg.status = msg.status === 0 ? 'Pending' : 'Resolved');

      return {
        contactMessages: results,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: number): Promise<ContactUs>  {
    try {
      const contactMessage: any = await this.contactUsRepository
        .createQueryBuilder("contact")
        .leftJoinAndSelect("contact.user", "user")
        .select([
          "contact.id",
          "contact.message",
          "contact.subject",
          "contact.status",
          "contact.created_at",
          "contact.updated_at",
          "user.full_name"
        ])
        .where("contact.id = :id", { id })
        .getOne();

      if (!contactMessage) throw new NotFoundException('Message not found.');

      contactMessage.status = contactMessage.status === 0 ? 'Pending' : 'Resolved';
      return contactMessage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Message is not found.');
      }
      throw new Error(error);
    }
  }

  async resolveMessage(id: number): Promise<void>  {
    try {
      await this.contactUsRepository.findOneByOrFail({ id });
      await this.contactUsRepository.update(id, {status: 1});
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('Message not found.');
      throw new Error(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.contactUsRepository.findOneByOrFail({ id });
      await this.contactUsRepository.delete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('Message not found.');
      throw new Error(error);
    }
  }
}
