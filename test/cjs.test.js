import src from '../lib'
import cjs from '../lib/cjs'

describe('CJS', () => {
  it('should export loader', () => {
    expect(cjs).toEqual(src)
  })

  it('should export "raw" flag', () => {
    expect(cjs.raw).toEqual(true)
  })
})
