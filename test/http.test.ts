import { RequestListener } from 'http';
import { resolve } from 'path';
import * as request from 'supertest';
import {
  serviceFromFunctions,
} from '../src/invoque-service';
import {
  functionsFromPath,
} from '../src/invoque-util';

describe('express service', () => {
  let app: any;
  let singleModuleApp: any;
  const exampleHandlers = resolve(process.cwd(), 'src/examples');
  const exampleHandlerFile = resolve(process.cwd(), 'src/examples/hello.ts');
  beforeAll(() => {
    app = serviceFromFunctions(
      functionsFromPath(exampleHandlers),
    );
    singleModuleApp = serviceFromFunctions(
      functionsFromPath(exampleHandlerFile),
    );
  });

  test('404s for undef funcs', async () => {
    await request(singleModuleApp)
      .get('/foo')
      .expect(404);
  });

  test('500 for when things go wrong', async () => {
    await request(app)
      .get('/goodbye')
      .expect(500);
  });

  test('simple string response', async () => {
    const { text } = await request(app)
      .get('/hello')
      .expect(200);
    expect(text).toContain('Hello');
  });

  test('other module available', async () => {
    await request(app)
      .get('/other')
      .expect(200);
  });

  test('status response', async () => {
    const { body } = await request(app)
      .get('/fancy')
      .expect(401);
    expect(body.message).toContain('Unauthorized');
  });

  test('it should allow other http calls', async () => {
    await request(app)
      .post('/hello')
      .set('content-type', 'application/json')
      .send({ foo: 'bar'})
      .expect(200);
  });

  test('should use args from uri', async () => {
    const id = '123';
    const { body } = await request(app)
      .get('/withArgs/123')
      .expect(200);
    expect(body).toBe(id);
  });
});
