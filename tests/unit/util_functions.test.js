const Database = require('../../config/db');

describe('Database class util function argsAreNullOrUndefined', () => {
  let db;

  beforeAll(() => {
    db = new Database();
  });

  it('should return false if all arguments are defined and not null', () => {
    expect(db.argsAreNullOrUndefined(1, 'test', true)).toBe(false);
  });

  it('should return true if any argument is undefined', () => {
    expect(db.argsAreNullOrUndefined(1, undefined, true)).toBe(true);
  });

  it('should return true if any argument is null', () => {
    expect(db.argsAreNullOrUndefined(1, null, true)).toBe(true);
  });

  it('should return false if no arguments are passed', () => {
    expect(db.argsAreNullOrUndefined()).toBe(false);
  });
});
