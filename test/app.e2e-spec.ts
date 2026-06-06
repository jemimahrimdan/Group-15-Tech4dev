import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const user = {
    fullName: 'Adeife Ajala',
    email: `ajala-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'MENTEE',
  };

  let accessToken: string;
let refreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    // Only keep this if you already created cleanDb()
    // await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user);

      console.log('STATUS:', res.status);
      console.log('BODY:', res.body);

      expect(res.status).toBe(201);

      expect(res.body.success).toBe(true);

      expect(res.body.message).toBe(
        'User registered successfully',
      );
    });

    it('should fail if email already exists', async () => {
  const res = await request(app.getHttpServer())
    .post('/auth/register')
    .send(user);

  expect(res.status).toBe(409);
});
const verificationToken =
  await prisma.verificationToken.findFirst({
    where: {
      user: {
        email: user.email,
      },
    },
  });

  it('should verify email', async () => {
  const token = await prisma.verificationToken.findFirst({
    where: {
      user: {
        email: user.email,
      },
    },
  });

  const res = await request(app.getHttpServer())
    .get(`/api/v1/auth/verify-email?token=${token?.token}`);

  expect(res.status).toBe(200);

  expect(res.body.success).toBe(true);
});
  });

    describe('Login', () => {


  it('should login successfully', async () => {
  
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: user.password,
    });

  expect(res.status).toBe(200);

  expect(res.body.data.accessToken).toBeDefined();

  expect(res.body.data.refreshToken).toBeDefined();
});
// accessToken = res.body.data.accessToken;
// refreshToken = res.body.data.refreshToken;
});
});

