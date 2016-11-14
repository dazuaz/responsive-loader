# responsive-loader

[![Build Status](https://travis-ci.org/herrstucki/responsive-loader.svg?branch=master)](https://travis-ci.org/herrstucki/responsive-loader)

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
// responsiveImage.images => [{height: 50, path: '2fefae46cb857bc750fa5e5eed4a0cde-100.jpg', width: 100}, {height: 100, path: '2fefae46cb857bc750fa5e5eed4a0cde-200.jpg', width: 200}, {height: 150, path: '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg', width: 300}]
// responsiveImage.src => '2fefae46cb857bc750fa5e5eed4a0cde-100.jpg'
// responsiveImage.toString() => '2fefae46cb857bc750fa5e5eed4a0cde-100.jpg'
ReactDOM.render(<img srcSet={responsiveImage.srcSet} src={responsiveImage.src} />, el);

// Or you can just use it as props, `srcSet` and `src` will be set properly
ReactDOM.render(<img {...responsiveImage} />, el);
```

Or use it in CSS (only the first resized image will be used, if you use multiple `sizes`):

```css
.myImage { background: url('responsive?size=1140!myImage.jpg'); }

@media (max-width: 480px) {
  .myImage { background: url('responsive?size=480!myImage.jpg'); }
}
```

```js
// Outputs placeholder image as a data URI, and three images with 100, 200, and 300px widths
const responsiveImage = require('responsive?placeholder=true&sizes[]=100,sizes[]=200,sizes[]=300!myImage.jpg');

// responsiveImage.placeholder => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAIBAQE…'
ReactDOM.render(
  <div style={{
    height: responsiveImage.height,
    width: responsiveImage.width,
    backgroundSize: 'cover',
    backgroundImage: 'url("' + responsiveImage.placeholder + '")'
  }}>
    <img src={responsiveImage.src} srcSet={responsiveImage.srcSet} />
  </div>, el);
```


### Options

- `sizes: array` — specify all widths you want to use; if a specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up). You may also declare a default `sizes` array in `responsiveLoader` in your `webpack.config.js`.
- `size: integer` — specify one width you want to use; if the specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up)
- `quality: integer` — JPEG compression quality; defaults to `95`
- `ext: string` — either `png`, `jpg`, or `gif`; use to convert to another format; defaults to original file's extension
- `background: hex` — Background fill when converting transparent to opaque images; defaults to `0xFFFFFFFF` (note: make sure this is a valid hex number)
- `placeholder: bool` — A true or false value to specify wether to output a placeholder image as a data URI. (Defaults to `false`)
- `placeholderSize: integer` — A number value specifying the width of the placeholder image, if enabled with the option above. (Defaults to `40`)


### Examples

Set a default `sizes` array, so you don't have to declare them with each `require`.

```js
module.exports = {
  entry: {...},
  output: {...},
  module: {
    loaders: [{
      test: /\.(jpe?g|png)$/i,
      loader: 'responsive'
    ]}
  },
  responsiveLoader: {
    sizes: [300, 600, 1200, 2000],
    placeholder: true,
    placeholderSize: 50
  }
}
```

## Notes

- Doesn't support `1x`, `2x` sizes.

## See also

- Inspired by [resize-image-loader](https://github.com/Levelmoney/resize-image-loader), but simpler and without dependency on ImageMagick
