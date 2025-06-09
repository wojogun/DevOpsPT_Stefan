const { expect } = require('chai');
const { generateId } = require('../../utils/notes');

describe('generateId', () => {
  it('should return 1 if list is empty', () => {
    expect(generateId([])).to.equal(1);
  });

  it('should return max ID + 1 for non-empty list', () => {
    const notes = [{ id: 3 }, { id: 7 }, { id: 2 }];
    expect(generateId(notes)).to.equal(8);
  });
});
