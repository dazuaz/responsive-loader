# responsive-loader

[![build][travis]][travis-url]
[![node][node]][node-url]

A webpack loader for responsive images. Creates multiple images from one source image, and returns a `srcset`. For more information on how to use `srcset`, read [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images). Browser support is [pretty good](http://caniuse.com/#search=srcset).

## Install

### With sharp

```
npm install responsive-loader sharp --save-dev
```

For [super-charged performance](http://sharp.dimens.io/en/stable/performance/) and webp and avif formats support, responsive-loader works with [sharp](https://github.com/lovell/sharp). It's recommended to use sharp if you have lots of images to transform.

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              // Set options for all transforms
            },
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },
}
```

### With jimp

```
npm install responsive-loader jimp --save-dev
```

Responsive-loader can be use with [jimp](https://github.com/oliver-moran/jimp) to transform images. which needs to be installed alongside responsive-loader. Because jimp is written entirely in JavaScript and doesn't have any native dependencies it will work anywhere. The main drawback is that it's pretty slow.

If you want to use jimp, you need to configure responsive-loader to use its adapter:

```diff
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
+               adapter: require('responsive-loader/jimp')
            },
          },
        ],
        type: 'javascript/auto',
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
        use: {
          loader: 'responsive-loader',
          options: {
            // If you want to enable sharp support:
            adapter: require('responsive-loader/sharp'),
          },
        },
      },
    ],
  },
}
```

Then import images in your JavaScript files:

```js
import responsiveImage from 'img/myImage.jpg?sizes[]=300,sizes[]=600,sizes[]=1024,sizes[]=2048';
import responsiveImageWebp from 'img/myImage.jpg?sizes[]=300,sizes[]=600,sizes[]=1024,sizes[]=2048&format=webp';

// Outputs
// responsiveImage.srcSet => '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg 300w,2fefae46cb857bc750fa5e5eed4a0cde-600.jpg 600w,2fefae46cb857bc750fa5e5eed4a0cde-600.jpg 600w ...'
// responsiveImage.images => [{height: 150, path: '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg', width: 300}, {height: 300, path: '2fefae46cb857bc750fa5e5eed4a0cde-600.jpg', width: 600} ...]
// responsiveImage.src => '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg'
// responsiveImage.toString() => '2fefae46cb857bc750fa5e5eed4a0cde-300.jpg'
...
  <picture>
    <source srcSet={responsiveImageWebp.srcSet} type='image/webp' sizes='(min-width: 1024px) 1024px, 100vw'/>
    <img
      src={responsiveImage.src}
      srcSet={responsiveImage.srcSet}
      width={responsiveImage.width}
      height={responsiveImage.height}
      sizes='(min-width: 1024px) 1024px, 100vw'
      loading="lazy"
    />
  </picture>
...
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
.myImage {
  background: url('myImage.jpg?size=1140');
}

@media (max-width: 480px) {
  .myImage {
    background: url('myImage.jpg?size=480');
  }
}
```

```js
// Outputs placeholder image as a data URI, and three images with 100, 200, and 300px widths
const responsiveImage = require('myImage.jpg?placeholder=true&sizes[]=100,sizes[]=200,sizes[]=300')

// responsiveImage.placeholder => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAIBAQE…'
ReactDOM.render(
  <div
    style={{
      height: responsiveImage.height,
      width: responsiveImage.width,
      backgroundSize: 'cover',
      backgroundImage: 'url("' + responsiveImage.placeholder + '")',
    }}>
    <img src={responsiveImage.src} srcSet={responsiveImage.srcSet} />
  </div>,
  el
)
```

You can also use JSON5 notation:

```
<source srcSet={require('./image.jpg?{sizes:[50,100,200,300,400,500,600,700,800], format: "webp"}').srcSet} type='image/webp'/>
```

### Options

| Option                                  | Type                  | Default                | Description                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                  | `string`              | `[hash]-[width].[ext]` | Filename template for output files.                                                                                                                                                                                                                                                         |
| `outputPath`                            | `string \| Function`  | `undefined`            | Configure a custom output path for your file                                                                                                                                                                                                                                                |
| `publicPath`                            | `string \| Function`  | `undefined`            | Configure a custom public path for your file.                                                                                                                                                                                                                                               |
| `context`                               | `string`              | `this.options.context` | Custom file context, defaults to webpack.config.js [context](https://webpack.js.org/configuration/entry-context/#context)                                                                                                                                                                   |
| `sizes`                                 | `array`               | _original size_        | Specify all widths you want to use; if a specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up). You may also declare a default `sizes` array in the loader options in your `webpack.config.js`.                                       |
| `size`                                  | `integer`             | _original size_        | Specify one width you want to use; if the specified size exceeds the original image's width, the latter will be used (i.e. images won't be scaled up)                                                                                                                                       |
| `min`                                   | `integer`             |                        | As an alternative to manually specifying `sizes`, you can specify `min`, `max` and `steps`, and the sizes will be generated for you.                                                                                                                                                        |
| `max`                                   | `integer`             |                        | See `min` above                                                                                                                                                                                                                                                                             |
| `steps`                                 | `integer`             | `4`                    | Configure the number of images generated between `min` and `max` (inclusive)                                                                                                                                                                                                                |
| `quality`                               | `integer`             | `85`                   | JPEG and WEBP compression quality                                                                                                                                                                                                                                                           |
| `format`                                | `string`              | _original format_      | Either `png` or `jpg`; use to convert to another format. `webp` and `avif` is also supported, but only by the sharp adapter                                                                                                                                                                 |
| `placeholder`                           | `boolean`             | `false`                | A true or false value to specify wether to output a placeholder image as a data URI                                                                                                                                                                                                         |
| `placeholderSize`                       | `integer`             | `40`                   | A number value specifying the width of the placeholder image, if enabled with the option above                                                                                                                                                                                              |
| `adapter`                               | `Adapter`             | JIMP                   | Specify which adapter to use. Can only be specified in the loader options.                                                                                                                                                                                                                  |
| `disable`                               | `boolean`             | `false`                | Disable processing of images by this loader (useful in development). `srcSet` and other attributes will still be generated but only for the original size. Note that the `width` and `height` attributes will both be set to `100` but the image will retain its original dimensions.       |
| **[`esModule`](#esmodule)**             | `boolean`             | `false`                | Use ES modules syntax.                                                                                                                                                                                                                                                                      |
| `emitFile`                              | `boolean`             | `true`                 | If `true`, emits a file (writes a file to the filesystem). If `false`, the loader will still return a object with the public URI but will not emit the file. It is often useful to disable this option for server-side packages.                                                            |
| **[`cacheDirectory`](#cachedirectory)** | `string` or `boolean` | `false`                | Experimental: If `true`, this will cache the result object but not the image files. The images are only produced once, when they are not found in the results object cache, or when the options change (cache key). For Development you can set query parameter to `?cacheDirectory=false`. |

#### Adapter-specific options

##### jimp

- `background: number` — Background fill when converting transparent to opaque images. Make sure this is a valid hex number, e.g. `0xFFFFFFFF`)

##### sharp

- `background: string` — Background fill when converting transparent to opaque images. E.g. `#FFFFFF` or `%23FFFFFF` for webpack > 5
- `format: webp` — Conversion to the `image/webp` format. Recognizes the `quality` option.
- `format: avif` — Conversion to the `image/avif` format. Recognizes the `quality` option.
- `progressive: boolean` - Use progressive (interlace) scan for `image/jpeg` format.
- `rotate: number` - Rotates image [more here](https://sharp.pixelplumbing.com/api-operation#rotate)

### Examples

Set a default `sizes` array, so you don't have to declare them with each `require`.

```js
module.exports = {
  entry: {...},
  output: {...},
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|webp)$/i,
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

### `cacheDirectory`

Type: `Boolean` or `string`
Default: `false`

Experimental: If `true`, this will cache the result object but not the image files. The images are only produced once, when they are not found in the results object cache, or when the options change (cache key). For Development you can set query parameter to individual images by using `?cacheDirectory=false`.

Default cache directory might be ```.node_modules/.cache/responsive-loader```

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              esModule: true,
              cacheDirectory: true,
              publicPath: "/_next",
              name: "static/media/[name]-[hash:7]-[width].[ext]",
            },
          },
        ],
      },
    ],
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
            loader: 'responsive-loader',
            options: {
              esModule: true,
            },
          },
        ],
      },
    ],
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

- Doesn't support `1x`, `2x` sizes, but you probably don't need it.

## See also

- Inspired by [resize-image-loader](https://github.com/Levelmoney/resize-image-loader), but simpler and without dependency on ImageMagick

[node]: https://img.shields.io/node/v/responsive-loader.svg
[node-url]: https://nodejs.org
[travis]: https://travis-ci.com/dazuaz/responsive-loader.svg?branch=master
[travis-url]: https://travis-ci.com/dazuaz/responsive-loader
