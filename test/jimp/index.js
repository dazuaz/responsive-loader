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

test('disable', () => {
  const multi = require('../cat-1000.jpg?disable');
  expect(multi).toMatchSnapshot();
});

test('output should be relative to context', () => {
  const multi = require('../cat-1000.jpg?name=[path][hash]-[width]x[height].[ext]&context=./');
  expect(multi).toMatchSnapshot();
});

test('output should be in outputPath dir', () => {
  const multi = require('../cat-1000.jpg?outputPath=img/');
  expect(multi).toMatchSnapshot();
});

test('public path should replace global publicPath', () => {
  const multi = require('../cat-1000.jpg?outputPath=img/&publicPath=public/');
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

test('with min and max sizes', () => {
  const output = require('../cat-1000.jpg?min=600&max=800&steps=3');
  expect(output).toMatchSnapshot();
});

test('with min and max sizes, and default steps', () => {
  const output = require('../cat-1000.jpg?min=500&max=1000');
  expect(output).toMatchSnapshot();
});

test('with min and max sizes options', () => {
  const output = require('../cat-1000.jpg?minmax');
  expect(output).toMatchSnapshot();
});

test('override min and max with sizes', () => {
  const output = require('../cat-1000.jpg?minmax&sizes[]=100&sizes[]=200');
  expect(output).toMatchSnapshot();
});

test('override min and max with size', () => {
  const output = require('../cat-1000.jpg?minmax&size=100');
  expect(output).toMatchSnapshot();
});
