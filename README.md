# responsive-loader

[![build][travis]][travis-url]
[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![size][size]][size-url]

A webpack loader for responsive images. Creates multiple images from one source image, and returns a `srcset`. For more information on how to use `srcset`, read [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images). Browser support is [pretty good](http://caniuse.com/#search=srcset).

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

For [super-charged performance](http://sharp.dimens.io/en/stable/performance/), responsive-loader also works with [sharp](https://github.com/lovell/sharp). It's recommended to use sharp if you have lots of images to transform, and need to generate webp images.

If you want to use sharp, you need to configure responsive-loader to use its adapter:

```diff
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|webp)$/i,
        use: [
          loader: 'responsive-loader',
          options: {
+           adapter: require('responsive-loader/sharp')
          }
        ]
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
        test: /\.(jpe?g|png|webp)$/i,
        use: [
          loader: 'responsive-loader',
          options: {
            // If you want to enable sharp support:
            adapter: require('responsive-loader/sharp'),
          }
        ]
      }
    ]
  },
}
```

Then import images in your JavaScript files:

```js
import responsiveImage from 'img/myImage.jpg?sizes[]=300,sizes[]=600,sizes[]=1024,sizes[]=2048';
import responsiveImageWebp from 'img/myImage.jpg?sizes[]=300,sizes[]=600,sizes[]=1024,sizes[]=2048&format=webp';
// or ... require('img/myImage.jpg?sizes[]=300,sizes[]=600,sizes[]=1024,sizes[]=2048')

// Outputs 
// responsiveImage.srcSet => '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg 300w,2fefae46cb857bc750fa5e5eed4a0cde-600.jpg 600w,2fefae46cb857bc750fa5e5eed4a0cde-600.jpg 600w ...'
// responsiveImage.images => [{height: 150, path: '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg', width: 300}, {height: 300, path: '2fefae46cb857bc750fa5e5eed4a0cde-600.jpg', width: 600} ...]
// responsiveImage.src => '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg'
// responsiveImage.toString() => '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg'
...
<picture>
  <source srcSet={responsiveImageWebp.srcSet} type='image/webp' />
  <img
    src={responsiveImage.src}
    srcSet={responsiveImage.srcSet}
    width={responsiveImage.width}
    height={responsiveImage.height}
    sizes='(min-width: 1024px) 1024px, 100vw'
    loading="lazy"
  />
</picture>
```

Notes:
- `width` and `height` are intrinsic and are used to avoid layout shift, other techniques involve the use of aspect ratio and padding.
- `sizes`, without sizes, the browser assumes the image is always 100vw for any viewport.
  - A helpful tool to determine proper sizes https://ausi.github.io/respimagelint/
- `loading` do not add loading lazy if the image is part of the initial rendering of the page or close to it.
- `srcset` Modern browsers will choose the closest best image depending on the pixel density of your screen.
  - in the example above is your pixel density is `>1x` for a screen `>1024px` it will display the 2048 image.



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
    backgroundSize: '100% 100%',
    backgroundImage: 'url("' + responsiveImage.placeholder + '")'
  }}>
    <img src={responsiveImage.src} srcSet={responsiveImage.srcSet} />
  </div>, el);
```

**Tip:** The placeholder will have a slightly different height/width-ratio due to the reduced resolution. 
Background size *'100% 100%'* will scale it to the height and width of the original image provided to the attributes `height` and `width` of the `div` element.
The background size *'cover'* would show a slightly enlarged and cropped placeholder that would show a little bit more flicker once the original image is loaded by the `img` element.

### Options

| Option                      | Type                | Default                | Description                                                                                                                                                                                                                                                                           |
| --------------------------- | ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                      | `string`            | `[hash]-[width].[ext]` | Filename template for output files.                                                                                                                                                                                                                                                   |
| `outputPath`                | `string | Function` | `undefined`            | Configure a custom output path for your file                                                                                                                                                                                                                                          |
| `publicPath`                | `string | Function` | `undefined`            | Configure a custom public path for your file.                                                                                                                                                                                                                                         |
| `context`                   | `string`            | `this.options.context` | Custom file context, defaults to webpack.config.js [context](https://webpack.js.org/configuration/entry-context/#context)                                                                                                                                                             |
| `sizes`                     | `array`             | *original size*        | Specify all widths you want to use; if a specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up). You may also declare a default `sizes` array in the loader options in your `webpack.config.js`.                                 |
| `size`                      | `integer`           | *original size*        | Specify one width you want to use; if the specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up)                                                                                                                                 |
| `min`                       | `integer`           |                        | As an alternative to manually specifying `sizes`, you can specify `min`, `max` and `steps`, and the sizes will be generated for you.                                                                                                                                                  |
| `max`                       | `integer`           |                        | See `min` above                                                                                                                                                                                                                                                                       |
| `steps`                     | `integer`           | `4`                    | Configure the number of images generated between `min` and `max` (inclusive)                                                                                                                                                                                                          |
| `quality`                   | `integer`           | `85`                   | JPEG and WEBP compression quality                                                                                                                                                                                                                                                     |
| `format`                    | `string`            | *original format*      | Either `png` or `jpg`; use to convert to another format. `webp` is also supported, but only by the sharp adapter                                                                                                                                                                      |
| `placeholder`               | `boolean`           | `false`                | A true or false value to specify wether to output a placeholder image as a data URI                                                                                                                                                                                                   |
| `placeholderSize`           | `integer`           | `40`                   | A number value specifying the width of the placeholder image, if enabled with the option above                                                                                                                                                                                        |
| `adapter`                   | `Adapter`           | JIMP                   | Specify which adapter to use. Can only be specified in the loader options.                                                                                                                                                                                                            |
| `disable`                   | `boolean`           | `false`                | Disable processing of images by this loader (useful in development). `srcSet` and other attributes will still be generated but only for the original size. Note that the `width` and `height` attributes will both be set to `100` but the image will retain its original dimensions. |
| **[`esModule`](#esmodule)** | `{Boolean}`         | `false`                 | Use ES modules syntax.                                                                                                                                                                                                                                                                |

#### Adapter-specific options

##### jimp

- `background: number` — Background fill when converting transparent to opaque images. Make sure this is a valid hex number, e.g. `0xFFFFFFFF`)

##### sharp

- `background: string` — Background fill when converting transparent to opaque images. E.g. `#FFFFFF`

- `format: webp` — Conversion to the `image/webp` format. Recognizes the `quality` option.


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
         use: [
          {
            loader: "responsive-loader",
            options: {
              adapter: require('responsive-loader/sharp'),
              sizes: [320, 640, 960, 1200, 1800, 2400],
              placeholder: true,
              placeholderSize: 20
            },
          },
        ],
      }
    ]
  },
}
```



### `esModule`

Type: `Boolean`
Default: `false`

By default, `responsive-loader` generates JS modules that use the CommonJS syntax.
There are some cases in which using ES modules is beneficial, like in the case of [module concatenation](https://webpack.js.org/plugins/module-concatenation-plugin/) and [tree shaking](https://webpack.js.org/guides/tree-shaking/).

You can enable a ES module syntax using:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        use: [
          {
            loader: "responsive-loader",
            options: {
              esModule: true,
            },
          },
        ],
      },
    ],
  },
};
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

- Doesn't support `1x`, `2x` sizes, but you probably don't need it.

## See also

- Inspired by [resize-image-loader](https://github.com/Levelmoney/resize-image-loader), but simpler and without dependency on ImageMagick

[npm]: https://img.shields.io/npm/v/responsive-loader.svg
[npm-url]: https://npmjs.com/package/responsive-loader
[node]: https://img.shields.io/node/v/responsive-loader.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/dazuaz/responsive-loader.svg
[deps-url]: https://david-dm.org/dazuaz/responsive-loader
[travis]: https://travis-ci.com/dazuaz/responsive-loader.svg?branch=master
[travis-url]: https://travis-ci.com/dazuaz/responsive-loader
[size]: https://packagephobia.now.sh/badge?p=responsive-loader
[size-url]: https://packagephobia.now.sh/result?p=responsive-loader