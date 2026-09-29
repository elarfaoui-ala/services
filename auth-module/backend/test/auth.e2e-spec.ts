import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('/api/auth/register (POST)', () => {
    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'invalid', password: '12345678', name: 'Test' })
        .expect(400);
    });

    it('should reject registration with short password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '123', name: 'Test' })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should reject login with missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });
});
