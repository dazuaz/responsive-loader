# Change Log

## v1.1.0

 - Added `min` and `max` options to automatically generate a number of images, and `steps` option to say how many images ([#31](https://github.com/herrstucki/responsive-loader/pull/31)).

## v1.0.0

### New

- 🚀 Added support for [sharp](https://github.com/lovell/sharp) ([#19](https://github.com/herrstucki/responsive-loader/pull/29))

### Breaking

#### Webpack 2 support

Removed support for webpack 1! Please upgrade to webpack >= 2.

The syntax to import images has changed. The query part now comes _after_ the resource (the image) instead of the loader.

```diff
- require('responsive-loader?size=100!some-image.jpg')
+ require('responsive-loader!some-image.jpg?size=100')
```

That means if `responsive-loader` is configured in your webpack-config, it's possible to specify image-specific options without having to add the loader part to the import path. For example:

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.jpg$/,
        loader: 'responsive-loader',
        options: {
          size: 1000
          //...
        }
      }
    ]
  },
}

// some-file.js
const image1000 = require('some-image.jpg') // will have size 1000 from the config
const image500 = require('some-image.jpg?size=500')
```

#### Other breaking changes

- The `ext` option was removed, in favor of `format=jpg|png`. `[ext]` is now part of the `name` option like in other loaders (fixes [#13](https://github.com/herrstucki/responsive-loader/issues/13))
- Changed default JPEG `quality` to `85`
- The `pass` option is now called `disable`

## v0.7.0

- Add `placeholder` option ([#16](https://github.com/herrstucki/responsive-loader/pull/16))
- Add `width` and `height` attributes to output ([#19](https://github.com/herrstucki/responsive-loader/pull/19))

## v0.6.1

- Declare default `name`, `context`, `quality`, and `background` through webpack options when they're not specified in the loader query ([#12](https://github.com/herrstucki/responsive-loader/pull/12)).

## v0.6.0

- Add linting ([#7](https://github.com/herrstucki/responsive-loader/pull/7))
- Breaking (maybe): Require node >= v4

## v0.5.3

- Fix wrong callback being called on file load error ([#6](https://github.com/herrstucki/responsive-loader/pull/6))

## v0.5.2

- Added tests!
- Update `queue-async` to `d3-queue`

## v0.5.1

- Optimization: skip resizing images of the same size ([#5](https://github.com/herrstucki/responsive-loader/pull/5))

## v0.5.0

Using the `size` option for getting only one resized image no longer just returns a string but the same object structure as when using `sizes`. The difference is, that when `toString()` is called on that object, it will return the path of the first resized image.

Also, for pure convenience, the returned object also contains a `src` property, so it can be spread onto a React component (e.g. `<img {...resized} />`).

### Before

This worked:

```js
import resized from 'responsive?sizes[]=100,sizes[]=200';

<img srcSet={resized.srcSet} src={resized.images[0].path} />
```

```css
.foo { background-image: url('responsive?size=100'); }
```

But this didn't :sob::

```js
import resized from 'responsive?size=100';

// Whoops, error because `resized` ist just a string
<img srcSet={resized.srcSet} src={resized.images[0].path} />
```

```css
/* Whoops, `url('[object Object]')` */
.foo { background-image: url('responsive?sizes[]=100'); }
```

### After

All these work :v:

```js
import resized from 'responsive?sizes[]=100,sizes[]=200';

<img srcSet={resized.srcSet} src={resized.src} />
<img srcSet={resized.srcSet} src={resized} />
<img {...resized} />
```

```css
.foo { background-image: url('responsive?sizes[]=100,sizes[]=200'); }
.foo { background-image: url('responsive?sizes[]=100'); }
.foo { background-image: url('responsive?size=100'); }
```
