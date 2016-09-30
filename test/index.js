const test = require('tape');

test('multiple sizes', t => {
  const multi = require('../index?sizes[]=500&sizes[]=2000!./cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg 500w,foobar/6582e69db43187e14b01fa76c021cf71-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg', width: 500},
    {path: 'foobar/6582e69db43187e14b01fa76c021cf71-1000.jpg', width: 1000}
  ]);
  t.equal(multi.toString(), 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.end();
});

test('single size', t => {
  const single = require('../index?size=500!./cat-1000.jpg');
  t.equal(single.srcSet, 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg 500w');
  t.equal(single.src, 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg');

  t.equal(single.toString(), 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.end();
});

test('with size defined in webpack.config.js', t => {
  const multi = require('../index!./cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg 500w,foobar/16c2a62d860f67276d750a7777ec932e-750.jpg 750w,foobar/6582e69db43187e14b01fa76c021cf71-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg', width: 500},
    {path: 'foobar/16c2a62d860f67276d750a7777ec932e-750.jpg', width: 750},
    {path: 'foobar/6582e69db43187e14b01fa76c021cf71-1000.jpg', width: 1000}
  ]);
  t.equal(multi.toString(), 'foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.end();
});

test('output should be relative to context', t => {
  const multi = require('../index?name=[path][hash]-[width].&context=./!./cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/test/ac8fbe83765514062b5da3b8966cd475-500.jpg 500w,foobar/test/16c2a62d860f67276d750a7777ec932e-750.jpg 750w,foobar/test/6582e69db43187e14b01fa76c021cf71-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/test/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/test/ac8fbe83765514062b5da3b8966cd475-500.jpg', width: 500},
    {path: 'foobar/test/16c2a62d860f67276d750a7777ec932e-750.jpg', width: 750},
    {path: 'foobar/test/6582e69db43187e14b01fa76c021cf71-1000.jpg', width: 1000}
  ]);
  t.equal(multi.toString(), 'foobar/test/ac8fbe83765514062b5da3b8966cd475-500.jpg');
  t.end();
});
