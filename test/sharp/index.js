const test = require('tape');

test('multiple sizes', t => {
  const multi = require('../../index?sizes[]=500&sizes[]=2000!../cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg 500w,foobar/c239a7d5a3e69d39dac5998c1ebb11d0-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg', width: 500, height: 450},
    {path: 'foobar/c239a7d5a3e69d39dac5998c1ebb11d0-1000.jpg', width: 1000, height: 900}
  ]);
  t.equal(multi.toString(), 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg');
  t.end();
});

test('single size', t => {
  const single = require('../../index?size=500!../cat-1000.jpg');
  t.equal(single.srcSet, 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg 500w');
  t.equal(single.src, 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg');

  t.equal(single.toString(), 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg');
  t.end();
});

test('with size defined in webpack.config.js', t => {
  const multi = require('../../index!../cat-1000.jpg');
  t.equal(multi.srcSet, 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg 500w,foobar/fb9a96e23c0f6afc0375cf511502b124-750.jpg 750w,foobar/c239a7d5a3e69d39dac5998c1ebb11d0-1000.jpg 1000w');
  t.equal(multi.src, 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg');
  t.deepEqual(multi.images, [
    {path: 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg', width: 500, height: 450},
    {path: 'foobar/fb9a96e23c0f6afc0375cf511502b124-750.jpg', width: 750, height: 675},
    {path: 'foobar/c239a7d5a3e69d39dac5998c1ebb11d0-1000.jpg', width: 1000, height: 900}
  ]);
  t.equal(multi.toString(), 'foobar/a33103b9f9aa12254bd59400e9b74bc7-500.jpg');
  t.end();
});

test('output should be relative to context', t => {
  const multi = require('../../index?name=[path][hash]-[width].&context=./!../cat-1000.jpg');
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

test('with placeholder image', t => {
  const output = require('../../index?placeholder=true!../cat-1000.jpg');
  t.equal(output.placeholder, 'data:image/jpeg;base64,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');
  t.end();
});

test('output first resized image height & width', t => {
  const output = require('../../index?size=500!../cat-1000.jpg');
  t.equal(output.height, 450);
  t.equal(output.width, 500);
  t.end();
});

test('png', t => {
  const output = require('../../index!../cat-transparent.png');
  t.equal(output.srcSet, 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.png 500w,foobar/044a43c1ce8f89e691ac24b270cc3bb5-513.png 513w');
  t.equal(output.src, 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.png');
  t.deepEqual(output.images, [
    {path: 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.png', width: 500, height: 580},
    {path: 'foobar/044a43c1ce8f89e691ac24b270cc3bb5-513.png', width: 513, height: 595}
  ]);
  t.equal(output.toString(), 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.png');
  t.end();
});

test('png to jpeg with background color', t => {
  const output = require('../../index?background=#FF0000&ext=jpg!../cat-transparent.png');
  t.equal(output.srcSet, 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.jpg 500w,foobar/044a43c1ce8f89e691ac24b270cc3bb5-513.jpg 513w');
  t.equal(output.src, 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.jpg');
  t.deepEqual(output.images, [
    {path: 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.jpg', width: 500, height: 580},
    {path: 'foobar/044a43c1ce8f89e691ac24b270cc3bb5-513.jpg', width: 513, height: 595}
  ]);
  t.equal(output.toString(), 'foobar/06e7bae0ae188cc9121aa82a068b5d1f-500.jpg');
  t.end();
});
