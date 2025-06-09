const { expect } = require('chai');

describe('Math Utils', () => {
  it('adds two numbers correctly', () => {
    expect(2 + 3).to.equal(5);
  });

  it('subtracts two numbers correctly', () => {
    expect(5 - 2).to.equal(3);
  });

  it('multiplies two numbers correctly', () => {
    expect(4 * 2).to.equal(8);
  });
});
