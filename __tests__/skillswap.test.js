const skillswap = require('../skillswap-functions');

describe('test setup', () => {
  test('skillswap-functions module loads', () => {
    expect(typeof skillswap).toBe('object');
  });
});
