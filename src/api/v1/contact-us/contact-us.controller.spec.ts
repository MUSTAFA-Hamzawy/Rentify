import { Test, TestingModule } from '@nestjs/testing';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';

describe('ContactUsController', () => {
  let controller: ContactUsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactUsController],
      providers: [ContactUsService],
    }).compile();

    controller = module.get<ContactUsController>(ContactUsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
