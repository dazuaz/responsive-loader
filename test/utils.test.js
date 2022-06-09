import { getOutputAndPublicPath } from '../lib/utils'

describe('Utils package', () => {
  it('should create both paths', () => {
    const { outputPath, publicPath } = getOutputAndPublicPath('file.png', {
      outputPath: '/dist/img/',
      publicPath: '/img',
    })
    expect(outputPath).toBe('/dist/img/file.png')
    expect(publicPath).toBe('"/img/file.png"')
  })
})
