test('multiple sizes', () => {
  const multi = require('../cat-1000.jpg?sizes[]=500&sizes[]=2000');
  expect(multi).toMatchSnapshot();
  expect(multi.toString()).toBe(multi.src);
});

test('single size', () => {
  const single = require('../cat-1000.jpg?size=500');
  expect(single).toMatchSnapshot();
});

test('with size defined in webpack.config.js', () => {
  const multi = require('../cat-1000.jpg');
  expect(multi).toMatchSnapshot();
});

test('output should be relative to context', () => {
  const multi = require('../cat-1000.jpg?name=[path][hash]-[width]x[height].[ext]&context=./');
  expect(multi).toMatchSnapshot();
});

test('with placeholder image', () => {
  const output = require('../cat-1000.jpg?placeholder=true');
  expect(output).toMatchSnapshot();
});

test('output first resized image height & width', () => {
  const output = require('../cat-1000.jpg?size=500');
  expect(output).toMatchSnapshot();
});

test('png', () => {
  const output = require('../cat-transparent.png');
  expect(output).toMatchSnapshot();
});

test('png to jpeg with background color', () => {
  const output = require('../cat-transparent.png?background=0xFF0000FF&format=jpg');
  expect(output).toMatchSnapshot();
});

test('png to jpeg with background color', () => {
  const output = require('../cat-transparent.png?background=0xFF0000FF&format=jpg');
  expect(output).toMatchSnapshot();
});
