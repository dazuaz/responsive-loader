# responsive-loader

[![Build Status](https://travis-ci.org/herrstucki/responsive-loader.svg?branch=master)](https://travis-ci.org/herrstucki/responsive-loader)

A webpack loader for responsive images. Creates multiple images from one source image, and returns a `srcset`. For more information on how to use `srcset`, read [Responsive Images: If you’re just changing resolutions, use srcset.](https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/). Browser support is [pretty good](http://caniuse.com/#search=srcset).

## Install

> Note: starting with v1.0.0, responsive-loader is only compatible with webpack 2+. For webpack 1 support, use responsive-loader@0.7.0

### With jimp

```
npm install responsive-loader jimp --save-dev
```

Per default, responsive-loader uses [jimp](https://github.com/oliver-moran/jimp) to transform images. which needs to be installed alongside responsive-loader. Because jimp is written entirely in JavaScript and doesn't have any native dependencies it will work anywhere. The main drawback is that it's pretty slow.

### With sharp

```
npm install responsive-loader sharp --save-dev
```

For [super-charged performance](http://sharp.dimens.io/en/stable/performance/), responsive-loader also works with [sharp](https://github.com/lovell/sharp). It's recommended to use sharp if you have lots of images to transform.

If you want to use sharp, you need to configure responsive-loader to use its adapter:

```diff
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        loader: 'responsive-loader',
        options: {
+         adapter: require('responsive-loader/sharp')
        }
      }
    ]
  },
}
```


## Usage

Add a rule for loading responsive images to your webpack config:

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        loader: 'responsive-loader',
        options: {
          // If you want to enable sharp support:
          // adapter: require('responsive-loader/sharp')
        }
      }
    ]
  },
}
```

Then import images in your JavaScript files:

```js
// Outputs three images with 100, 200, and 300px widths
const responsiveImage = require('myImage.jpg?sizes[]=100,sizes[]=200,sizes[]=300');

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
.myImage { background: url('myImage.jpg?size=1140'); }

@media (max-width: 480px) {
  .myImage { background: url('myImage.jpg?size=480'); }
}
```

```js
// Outputs placeholder image as a data URI, and three images with 100, 200, and 300px widths
const responsiveImage = require('myImage.jpg?placeholder=true&sizes[]=100,sizes[]=200,sizes[]=300');

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

- `sizes: array` — specify all widths you want to use; if a specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up). You may also declare a default `sizes` array in the loader options in your `webpack.config.js`.
- `size: integer` — specify one width you want to use; if the specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up)
- `min: integer` - as an alternative to manually specifying `sizes`, you can specify `min`, `max` and `steps`, and the sizes will be generated for you.
- `max: integer` - see `min` above
- `steps: integer` - configure the number of images generated between `min` and `max` (inclusive). Defaults to 4.
- `quality: integer` — JPEG compression quality; defaults to `85`
- `format: string` — either `png` or `jpg`; use to convert to another format; default format is inferred from the source file's extension
- `placeholder: boolean` — A true or false value to specify wether to output a placeholder image as a data URI; defaults to `false`
- `placeholderSize: integer` — A number value specifying the width of the placeholder image, if enabled with the option above; defaults to `40`
- `adapter: Adapter` — Specify which adapter to use. Can only be specified in the loader options.
- `disable: boolean` — Disable processing of images by this loader (useful in development). `srcSet` and other attributes will still be generated but only for the original size. Note that the `width` and `height` attributes will both be set to `100` but the image will retain its original dimensions.

#### Adapter-specific options

##### jimp

- `background: number` — Background fill when converting transparent to opaque images. Make sure this is a valid hex number, e.g. `0xFFFFFFFF`)

##### sharp

- `background: string` — Background fill when converting transparent to opaque images. E.g. `#FFFFFF`


### Examples

Set a default `sizes` array, so you don't have to declare them with each `require`.

```js
module.exports = {
  entry: {...},
  output: {...},
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        loader: 'responsive-loader',
        options: {
          sizes: [300, 600, 1200, 2000],
          placeholder: true,
          placeholderSize: 50
        }
      }
    ]
  },
}
```

### Writing Your Own Adapter

Maybe you want to use another image processing library or you want to change an existing one's behavior. You can write your own adapter with the following signature:

```js
type Adapter = (imagePath: string) => {
  metadata: () => Promise<{width: number, height: number}>
  resize: (config: {width: number, mime: string, options: Object}) => Promise<{data: Buffer, width: number, height: number}>
}
```

The `resize` method takes a single argument which has a `width`, `mime` and `options` property (which receives all loader options)

In your webpack config, require your adapter

```js
{
  test: /\.(jpe?g|png)$/i,
  loader: 'responsive-loader',
  options: {
    adapter: require('./my-adapter')
    foo: 'bar' // will get passed to adapter.resize({width, mime, options: {foo: 'bar}})
  }
}
```

## Notes

- Doesn't support `1x`, `2x` sizes.

## See also

- Inspired by [resize-image-loader](https://github.com/Levelmoney/resize-image-loader), but simpler and without dependency on ImageMagick
