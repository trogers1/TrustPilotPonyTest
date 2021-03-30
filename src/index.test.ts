const assert = require('assert');
const index = require('./index');

describe('Main', () => {
  it('should return true', () => {
    assert.equal(index.main(), true);
  });
});
