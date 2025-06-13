const { expect } = require('chai');
const { isValidNote } = require('../../utils/isValidNote');

describe('isValidNote', () => {
  it('should return true for valid note', () => {
    expect(isValidNote({ content: 'Test' })).to.be.true;
  });

  it('should return false for empty content', () => {
    expect(isValidNote({ content: '' })).to.be.false;
  });

  it('should return false for missing content property', () => {
    expect(isValidNote({})).to.be.false;
  });

  it('should return false for null input', () => {
    expect(isValidNote(null)).to.be.false;
  });
});
