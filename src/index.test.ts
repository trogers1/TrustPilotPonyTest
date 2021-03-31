import assert from 'assert';
import { main } from './index';

describe('Main', () => {
  it('should return true', () => {
    assert.strictEqual(main(), true);
  });
});
