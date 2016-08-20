# Change Log

## 0.6.1

- Declare default `name`, `context`, `quality`, and `background` through webpack options when they're not specified in the loader query ([#12](https://github.com/herrstucki/responsive-loader/pull/12)).

## 0.6.0

- Add linting ([#7](https://github.com/herrstucki/responsive-loader/pull/7))
- Breaking (maybe): Require node >= v4

## 0.5.3

- Fix wrong callback being called on file load error ([#6](https://github.com/herrstucki/responsive-loader/pull/6))

## 0.5.2

- Added tests!
- Update `queue-async` to `d3-queue`

## 0.5.1

- Optimization: skip resizing images of the same size ([#5](https://github.com/herrstucki/responsive-loader/pull/5))

## 0.5.0

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
