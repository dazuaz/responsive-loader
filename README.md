# responsive-loader

A webpack loader for responsive images. Creates multiple images from one source image, and returns a `srcset`. For more information on how to use `srcset`, read [Responsive Images: If you’re just changing resolutions, use srcset.](https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/). Browser support is [pretty good](http://caniuse.com/#search=srcset).

## Install

```
npm install responsive-loader jimp --save-dev
```

responsive-loader uses [jimp](https://github.com/oliver-moran/jimp), a pure JS image manipulation library (so no other dependencies, yay :v:), to transform images which needs to be installed alongside responsive-loader.

## Usage

```js
// Outputs three images with 100, 200, and 300px widths
const responsiveImage = require('responsive?sizes[]=100,sizes[]=200,sizes[]=300!myImage.jpg');

// responsiveImage.srcSet => '2fefae46cb857bc750fa5e5eed4a0cde-100.jpg 100w,2fefae46cb857bc750fa5e5eed4a0cde-200.jpg 200w,2fefae46cb857bc750fa5e5eed4a0cde-300.jpg 300w'
React.render(<div srcSet={responsiveImage.srcSet} />, el);
```

### Options

- `sizes: array`: specify all widths you want to use; if a specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up)
- `quality: integer`: JPEG compression quality; defaults to `95`
- `ext: string`: either `png`, `jpg`, or `gif`; use to convert to another format; defaults to original file's extension
- `background: hex`: Background fill when converting transparent to opaque images; defaults to `0xFFFFFFFF` (note: make sure this is a valid hex number)

## Notes

- Doesn't support `1x`, `2x` sizes.
- The image hash is based on the original image's content plus a size suffix, e.g. `2fefae46cb857bc750fa5e5eed4a0cde-100.jpg`, `2fefae46cb857bc750fa5e5eed4a0cde-200.jpg`, etc.

## See also

- Inspired by [resize-image-loader](https://github.com/Levelmoney/resize-image-loader), but simpler and without dependency on ImageMagick

