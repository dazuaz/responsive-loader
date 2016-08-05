const test = require('tape');

test('multiple sizes', t => {
  const multi = require('../index?sizes[]=500&sizes[]=2000!./cat-1000.jpg');
  t.equal('foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg 500w,foobar/6582e69db43187e14b01fa76c021cf71-1000.jpg 1000w', multi.srcSet);
  t.equal('foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg', multi.src);
  t.equal('foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg', multi.toString());
  t.end();
});

test('single size', t => {
  const single = require('../index?size=500!./cat-1000.jpg');
  t.equal('foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg 500w', single.srcSet);
  t.equal('foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg', single.src);
  t.equal('foobar/ac8fbe83765514062b5da3b8966cd475-500.jpg', single.toString());
  t.end();
});
