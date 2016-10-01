const test = require('tape');

test('multiple sizes', t => {
  const multi = require('../index?sizes[]=500&sizes[]=2000!./cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg 500w,foobar/d86a05082a1951c67af20f0b453ff981-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg', width: 500, height: 450},
    {path: 'foobar/d86a05082a1951c67af20f0b453ff981-1000.jpg', width: 1000, height: 900}
  ]);
  t.equal(multi.toString(), 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.end();
});

test('single size', t => {
  const single = require('../index?size=500!./cat-1000.jpg');
  t.equal(single.srcSet, 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg 500w');
  t.equal(single.src, 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');

  t.equal(single.toString(), 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.end();
});

test('with size defined in webpack.config.js', t => {
  const multi = require('../index!./cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg 500w,foobar/039c81f20aade648de7268c09c91d44d-750.jpg 750w,foobar/d86a05082a1951c67af20f0b453ff981-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg', width: 500, height: 450},
    {path: 'foobar/039c81f20aade648de7268c09c91d44d-750.jpg', width: 750, height: 675},
    {path: 'foobar/d86a05082a1951c67af20f0b453ff981-1000.jpg', width: 1000, height: 900}
  ]);
  t.equal(multi.toString(), 'foobar/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.end();
});

test('output should be relative to context', t => {
  const multi = require('../index?name=[path][hash]-[width].&context=./!./cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/test/9a7bdeb1304946f1fcd4a691409f286a-500.jpg 500w,foobar/test/039c81f20aade648de7268c09c91d44d-750.jpg 750w,foobar/test/d86a05082a1951c67af20f0b453ff981-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/test/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/test/9a7bdeb1304946f1fcd4a691409f286a-500.jpg', width: 500, height: 450},
    {path: 'foobar/test/039c81f20aade648de7268c09c91d44d-750.jpg', width: 750, height: 675},
    {path: 'foobar/test/d86a05082a1951c67af20f0b453ff981-1000.jpg', width: 1000, height: 900}
  ]);
  t.equal(multi.toString(), 'foobar/test/9a7bdeb1304946f1fcd4a691409f286a-500.jpg');
  t.end();
});
