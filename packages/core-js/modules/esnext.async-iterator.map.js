'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var createAsyncIteratorProxy = require('../internals/async-iterator-create-proxy');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var state = this;
  var mapper = state.mapper;

  return Promise.resolve(anObject(call(state.next, state.iterator))).then(function (step) {
    if (anObject(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return Promise.resolve(mapper(step.value)).then(function (value) {
      return { done: false, value: value };
    });
  });
});

$({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy(getIteratorDirect(this), {
      mapper: aCallable(mapper)
    });
  }
});
