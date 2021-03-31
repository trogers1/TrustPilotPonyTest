import assert from 'assert';
import { Readable } from 'stream';
import { readableToString } from './readableToString';

describe('readableToString', () => {
  it('should turn a ReadableStream object into a string', async () => {
    const expected =
      'This string will be turned into a NodeJS.ReadableStream, then into a string.';
    const readable = Readable.from(expected, {
      encoding: 'utf-8',
    });
    const result = await readableToString(readable);
    assert.notStrictEqual(readable, expected);
    assert.strictEqual(result, expected);
  });
});
