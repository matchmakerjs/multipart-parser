import * as faker from 'faker';
import { FormData } from 'formdata-node';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { MultipartReader } from './multipart-reader';
// import { Encoder } from "form-data-encoder"

describe('MultipartReader.getBoundary', () => {
  it('should retrieve form data boundary from content-type header', () => {
    const form = new FormData();
    const fileMetaData = {
      filename: faker.system.fileName(),
      type: faker.system.mimeType(),
    };
    const fileContent = Buffer.from(faker.lorem.sentences(10));
    form.set('file', fileContent, fileMetaData);

    // const encoder = new Encoder(form);
    // expect(MultipartReader.getBoundary(encoder.contentType)).toEqual(encoder.boundary);
    expect(MultipartReader.getBoundary(form.headers['Content-Type'])).toEqual(form.boundary);
  });

  it('should return null for invalid header', () => {
    expect(MultipartReader.getBoundary('image/jpg')).toBeUndefined();
  });

  it('should return null for undefined header', () => {
    expect(MultipartReader.getBoundary(undefined)).toBeUndefined();
  });
});

describe('MultipartReader.read', () => {
  it('should return form data parts', async () => {
    const form = new FormData();
    const fileMetaData = {
      filename: faker.system.fileName(),
      type: faker.system.mimeType(),
    };
    const fileContent = Buffer.from(faker.lorem.sentences(10));
    form.set('file', fileContent, fileMetaData);

    const multipart = await MultipartReader.read(form.stream, form.boundary);
    expect(multipart.length).toEqual(Array.from(form.values()).length);
    expect(multipart.parts[0].name).toBe('file');
    expect(multipart.parts[0].contentType).toBe(fileMetaData.type);
    expect(multipart.parts[0].fileName).toBe(fileMetaData.filename);
    expect(multipart.parts[0].data).toEqual(fileContent);
  });

  it('should return fail on null boundary', async () => {
    const form = new FormData();
    form.set('name', faker.name.firstName());

    try {
      await MultipartReader.read(form.stream, null);
      fail();
    } catch (e) {}
  });
});

describe('MultipartReader.readRequest', () => {
  it('should return form data parts', async () => {
    const form = new FormData();
    const fileMetaData = {
      filename: faker.system.fileName(),
      type: faker.system.mimeType(),
    };
    const fileContent = Buffer.from(faker.lorem.sentences(10));
    form.set('file', fileContent, fileMetaData);

    const stream = form.stream;
    const request = {
      on: (event: string, listener: () => void) => stream.on(event, listener),
      headers: { 'content-type': form.headers['Content-Type'] } as IncomingHttpHeaders,
    } as IncomingMessage;

    const multipart = await MultipartReader.readRequest(request);
    expect(multipart.length).toEqual(Array.from(form.values()).length);
    expect(multipart.parts[0].name).toBe('file');
    expect(multipart.parts[0].contentType).toBe(fileMetaData.type);
    expect(multipart.parts[0].fileName).toBe(fileMetaData.filename);
    expect(multipart.parts[0].data).toEqual(fileContent);
  });
});
