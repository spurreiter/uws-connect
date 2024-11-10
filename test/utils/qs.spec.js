import { deepStrictEqual as deepEqual } from 'assert'
import * as qs from '../../src/utils/qs.js'

describe('utils/qs', function () {
  it('parse a simple string', function () {
    deepEqual(qs.parse('0=foo'), { 0: 'foo' })
    deepEqual(qs.parse('foo=c++'), { foo: 'c  ' })
    deepEqual(qs.parse('foo'), { foo: '' })
    deepEqual(qs.parse('foo='), { foo: '' })
    deepEqual(qs.parse('foo=bar'), { foo: 'bar' })
    deepEqual(qs.parse(' foo = bar = baz '), { ' foo ': ' bar = baz ' })
    deepEqual(qs.parse('foo=bar=baz'), { foo: 'bar=baz' })
    deepEqual(qs.parse('foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' })
    deepEqual(qs.parse('foo2=bar2&baz2='), { foo2: 'bar2', baz2: '' })
    deepEqual(qs.parse('foo=bar&baz'), { foo: 'bar', baz: '' })
    deepEqual(qs.parse('foo=bar&foo=baz'), { foo: ['bar', 'baz'] })
    deepEqual(qs.parse('foo=bar&foo=baz&foo=wat'), {
      foo: ['bar', 'baz', 'wat']
    })
    deepEqual(qs.parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World'), {
      cht: 'p3',
      chd: 't:60,40',
      chs: '250x100',
      chl: 'Hello|World'
    })
  })

  it('does not support bracket notation', function () {
    deepEqual(qs.parse('a[b]=c'), { 'a[b]': 'c' })
  })

  deepEqual(qs.parse('a[>]=23'), { 'a[>]': '23' })

  it('does not support dot notation', function () {
    deepEqual(qs.parse('a.b=c'), { 'a.b': 'c' })
  })

  it('supports malformed uri characters', function () {
    deepEqual(qs.parse('{%:%}'), { '{%:%}': '' })
    deepEqual(qs.parse('{%:%}='), { '{%:%}': '' })
    deepEqual(qs.parse('foo=%:%}'), { foo: '%:%}' })
  })

  it("doesn't produce empty keys", function () {
    deepEqual(qs.parse('_r=1&'), { _r: '1' })
  })

  it('filters empty string', function () {
    deepEqual(qs.parse('r=&r=1'), { r: '1' })
  })

  it('adds empty string to array', function () {
    deepEqual(qs.parse('r=1&r='), { r: ['1', ''] })
  })
})
