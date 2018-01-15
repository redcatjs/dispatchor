import { expect } from 'chai'

export default function tests (Dispatchor) {
  describe('Test from EventEmitter3', function () {
    it('works with ES6 symbols', function (next) {
      var e = new Dispatchor(),
        event = Symbol('cows'),
        unknown = Symbol('moo')

      e.on(event, function foo (arg) {
        expect(e.listenerCount(unknown)).equals(0)
        expect(e.listeners(unknown)).deep.equals([])
        expect(arg).equals('bar')

        function bar (onced) {
          expect(e.listenerCount(unknown)).equals(0)
          expect(e.listeners(unknown)).deep.equals([])
          expect(onced).equals('foo')
          next()
        }

        e.once(unknown, bar)

        expect(e.listenerCount(event)).equals(1)
        expect(e.listeners(event)).deep.equals([foo])
        expect(e.listenerCount(unknown)).equals(1)
        expect(e.listeners(unknown)).deep.equals([bar])

        e.removeListener(event)

        expect(e.listenerCount(event)).equals(0)
        expect(e.listeners(event)).deep.equals([])
        expect(e.emit(unknown, 'foo')).equals(true)
      })

      expect(e.emit(unknown, 'bar')).equals(false)
      expect(e.emit(event, 'bar')).equals(true)
    })

    describe('emit', function () {
      it('should return false when there are not events to emit', function () {
        var e = new Dispatchor()

        expect(e.emit('foo')).equals(false)
        expect(e.emit('bar')).equals(false)
      })

      it('emits with context', function (done) {
        var context = { bar: 'baz' },
          e = new Dispatchor()

        e.on('foo', function (bar) {
          expect(bar).equals('bar')
          expect(this).equals(context)

          done()
        }, context).emit('foo', 'bar')
      })

      it('emits with context, multiple arguments (force apply)', function (done) {
        var context = { bar: 'baz' },
          e = new Dispatchor()

        e.on('foo', function (bar) {
          expect(bar).equals('bar')
          expect(this).equals(context)

          done()
        }, context).emit('foo', 'bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0)
      })

      it('can emit the function with multiple arguments', function () {
        var e = new Dispatchor()

        for (var i = 0; i < 100; i++) {
          (function (j) {
            for (var i = 0, args = []; i < j; i++) {
              args.push(j)
            }

            e.once('args', function () {
              expect(arguments.length).equals(args.length)
            })

            e.emit.apply(e, ['args'].concat(args))
          })(i)
        }
      })

      it('can emit the function with multiple arguments, multiple listeners', function () {
        var e = new Dispatchor()

        for (var i = 0; i < 100; i++) {
          (function (j) {
            for (var i = 0, args = []; i < j; i++) {
              args.push(j)
            }

            e.once('args', function () {
              expect(arguments.length).equals(args.length)
            })

            e.once('args', function () {
              expect(arguments.length).equals(args.length)
            })

            e.once('args', function () {
              expect(arguments.length).equals(args.length)
            })

            e.once('args', function () {
              expect(arguments.length).equals(args.length)
            })

            e.emit.apply(e, ['args'].concat(args))
          })(i)
        }
      })

      it('emits with context, multiple listeners (force loop)', function () {
        var e = new Dispatchor()

        e.on('foo', function (bar) {
          expect(this).eqls({ foo: 'bar' })
          expect(bar).equals('bar')
        }, { foo: 'bar' })

        e.on('foo', function (bar) {
          expect(this).eqls({ bar: 'baz' })
          expect(bar).equals('bar')
        }, { bar: 'baz' })

        e.emit('foo', 'bar')
      })

      it('emits with different contexts', function () {
        var e = new Dispatchor(),
          pattern = ''

        function writer () {
          pattern += this
        }

        e.on('write', writer, 'foo')
        e.on('write', writer, 'baz')
        e.once('write', writer, 'bar')
        e.once('write', writer, 'banana')

        e.emit('write')
        expect(pattern).equals('foobazbarbanana')
      })

      it('should return true when there are events to emit', function () {
        var e = new Dispatchor(),
          called = 0

        e.on('foo', function () {
          called++
        })

        expect(e.emit('foo')).equals(true)
        expect(e.emit('foob')).equals(false)
        expect(called).equals(1)
      })

      it('receives the emitted events', function (done) {
        var e = new Dispatchor()

        e.on('data', function (a, b, c, d, undef) {
          expect(a).equals('foo')
          expect(b).equals(e)
          expect(c).is.instanceOf(Date)
          expect(undef).equals(undefined)
          expect(arguments.length).equals(3)

          done()
        })

        e.emit('data', 'foo', e, new Date())
      })

      it('emits to all event listeners', function () {
        var e = new Dispatchor(),
          pattern = []

        e.on('foo', function () {
          pattern.push('foo1')
        })

        e.on('foo', function () {
          pattern.push('foo2')
        })

        e.emit('foo')

        expect(pattern.join(';')).equals('foo1;foo2')
      });

      (function each (keys) {
        var key = keys.shift()

        if (!key) return

        it('can store event which is a known property: ' + key, function (next) {
          var e = new Dispatchor()

          e.on(key, function (k) {
            expect(k).equals(key)
            next()
          }).emit(key, key)
        })

        each(keys)
      })([
        'hasOwnProperty',
        'constructor',
        '__proto__',
        'toString',
        'toValue',
        'unwatch',
        'watch'
      ])
    })

    describe('listeners', function () {
      it('returns an empty array if no listeners are specified', function () {
        var e = new Dispatchor()

        expect(e.listeners('foo')).is.a('array')
        expect(e.listeners('foo').length).equals(0)
      })

      it('returns an array of function', function () {
        var e = new Dispatchor()

        function foo () {}

        e.on('foo', foo)
        expect(e.listeners('foo')).is.a('array')
        expect(e.listeners('foo').length).equals(1)
        expect(e.listeners('foo')).deep.equals([foo])
      })

      it('is not vulnerable to modifications', function () {
        var e = new Dispatchor()

        function foo () {}

        e.on('foo', foo)

        expect(e.listeners('foo')).deep.equals([foo])

        e.listeners('foo').length = 0
        expect(e.listeners('foo')).deep.equals([foo])
      })
    })

    describe('listenerCount', function () {
      it('returns the number of listeners for a given event', function () {
        var e = new Dispatchor()

        expect(e.listenerCount()).equals(0)
        expect(e.listenerCount('foo')).equals(0)

        e.on('foo', function () {})
        expect(e.listenerCount('foo')).equals(1)
        e.on('foo', function () {})
        expect(e.listenerCount('foo')).equals(2)
      })
    })

    describe('on', function () {
      it('throws an error if the listener is not a function', function () {
        var e = new Dispatchor()

        try {
          e.on('foo', 'bar')
        } catch (ex) {
          expect(ex).is.instanceOf(TypeError)
          expect(ex.message).equals('The listener must be a function')
          return
        }

        throw new Error('oops')
      })
    })

    describe('once', function () {
      it('only emits it once', function () {
        var e = new Dispatchor(),
          calls = 0

        e.once('foo', function () {
          calls++
        })

        e.emit('foo')
        e.emit('foo')
        e.emit('foo')
        e.emit('foo')
        e.emit('foo')

        expect(e.listeners('foo').length).equals(0)
        expect(calls).equals(1)
      })

      it('only emits once if emits are nested inside the listener', function () {
        var e = new Dispatchor(),
          calls = 0

        e.once('foo', function () {
          calls++
          e.emit('foo')
        })

        e.emit('foo')
        expect(e.listeners('foo').length).equals(0)
        expect(calls).equals(1)
      })

      it('only emits once for multiple events', function () {
        var e = new Dispatchor(),
          multi = 0,
          foo = 0,
          bar = 0

        e.once('foo', function () {
          foo++
        })

        e.once('foo', function () {
          bar++
        })

        e.on('foo', function () {
          multi++
        })

        e.emit('foo')
        e.emit('foo')
        e.emit('foo')
        e.emit('foo')
        e.emit('foo')

        expect(e.listeners('foo').length).equals(1)
        expect(multi).equals(5)
        expect(foo).equals(1)
        expect(bar).equals(1)
      })

      it('only emits once with context', function (done) {
        var context = { foo: 'bar' },
          e = new Dispatchor()

        e.once('foo', function (bar) {
          expect(this).equals(context)
          expect(bar).equals('bar')

          done()
        }, context).emit('foo', 'bar')
      })
    })

    describe('removeListener', function () {
      it('removes all listeners when the listener is not specified', function () {
        var e = new Dispatchor()

        e.on('foo', function () {})
        e.on('foo', function () {})

        expect(e.removeListener('foo')).equals(e)
        expect(e.listeners('foo')).eql([])
      })

      it('removes only the listeners matching the specified listener', function () {
        var e = new Dispatchor()

        function foo () {}
        function bar () {}
        function baz () {}

        e.on('foo', foo)
        e.on('bar', bar)
        e.on('bar', baz)

        expect(e.removeListener('foo', bar)).equals(e)
        expect(e.listeners('bar')).eql([bar, baz])
        expect(e.listeners('foo')).eql([foo])
        expect(e._eventsCount).equals(2)

        expect(e.removeListener('foo', foo)).equals(e)
        expect(e.listeners('bar')).eql([bar, baz])
        expect(e.listeners('foo')).eql([])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('bar', bar)).equals(e)
        expect(e.listeners('bar')).eql([baz])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('bar', baz)).equals(e)
        expect(e.listeners('bar')).eql([])
        expect(e._eventsCount).equals(0)

        e.on('foo', foo)
        e.on('foo', foo)
        e.on('bar', bar)

        expect(e.removeListener('foo', foo)).equals(e)
        expect(e.listeners('bar')).eql([bar])
        expect(e.listeners('foo')).eql([])
        expect(e._eventsCount).equals(1)
      })

      it('removes only the once listeners when using the once flag', function () {
        var e = new Dispatchor()

        function foo () {}

        e.on('foo', foo)

        expect(e.removeListener('foo', function () {}, undefined, true)).equals(e)
        expect(e.listeners('foo')).eql([foo])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('foo', foo, undefined, true)).equals(e)
        expect(e.listeners('foo')).eql([foo])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('foo', foo)).equals(e)
        expect(e.listeners('foo')).eql([])
        expect(e._eventsCount).equals(0)

        e.once('foo', foo)
        e.on('foo', foo)

        expect(e.removeListener('foo', function () {}, undefined, true)).equals(e)
        expect(e.listeners('foo')).eql([foo, foo])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('foo', foo, undefined, true)).equals(e)
        expect(e.listeners('foo')).eql([foo])
        expect(e._eventsCount).equals(1)

        e.once('foo', foo)

        expect(e.removeListener('foo', foo)).equals(e)
        expect(e.listeners('foo')).eql([])
        expect(e._eventsCount).equals(0)
      })

      it('removes only the listeners matching the correct context', function () {
        var context = { foo: 'bar' },
          e = new Dispatchor()

        function foo () {}
        function bar () {}

        e.on('foo', foo, context)

        expect(e.removeListener('foo', function () {}, context)).equals(e)
        expect(e.listeners('foo')).eql([foo])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('foo', foo, { baz: 'quux' })).equals(e)
        expect(e.listeners('foo')).eql([foo])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('foo', foo, context)).equals(e)
        expect(e.listeners('foo')).eql([])
        expect(e._eventsCount).equals(0)

        e.on('foo', foo, context)
        e.on('foo', bar)

        expect(e.removeListener('foo', foo, { baz: 'quux' })).equals(e)
        expect(e.listeners('foo')).eql([foo, bar])
        expect(e._eventsCount).equals(1)

        expect(e.removeListener('foo', foo, context)).equals(e)
        expect(e.listeners('foo')).eql([bar])
        expect(e._eventsCount).equals(1)

        e.on('foo', bar, context)

        expect(e.removeListener('foo', bar)).equals(e)
        expect(e.listeners('foo')).eql([])
        expect(e._eventsCount).equals(0)
      })
    })

    describe('removeAllListeners', function () {
      it('removes all events for the specified events', function () {
        var e = new Dispatchor()

        e.on('foo', function () { throw new Error('oops') })
        e.on('foo', function () { throw new Error('oops') })
        e.on('bar', function () { throw new Error('oops') })
        e.on('aaa', function () { throw new Error('oops') })

        expect(e.removeAllListeners('foo')).equals(e)
        expect(e.listeners('foo').length).equals(0)
        expect(e.listeners('bar').length).equals(1)
        expect(e.listeners('aaa').length).equals(1)
        expect(e._eventsCount).equals(2)

        expect(e.removeAllListeners('bar')).equals(e)
        expect(e._eventsCount).equals(1)
        expect(e.removeAllListeners('aaa')).equals(e)
        expect(e._eventsCount).equals(0)

        expect(e.emit('foo')).equals(false)
        expect(e.emit('bar')).equals(false)
        expect(e.emit('aaa')).equals(false)
      })

      it('just nukes the fuck out of everything', function () {
        var e = new Dispatchor()

        e.on('foo', function () { throw new Error('oops') })
        e.on('foo', function () { throw new Error('oops') })
        e.on('bar', function () { throw new Error('oops') })
        e.on('aaa', function () { throw new Error('oops') })

        expect(e.removeAllListeners()).equals(e)
        expect(e.listeners('foo').length).equals(0)
        expect(e.listeners('bar').length).equals(0)
        expect(e.listeners('aaa').length).equals(0)
        expect(e._eventsCount).equals(0)

        expect(e.emit('foo')).equals(false)
        expect(e.emit('bar')).equals(false)
        expect(e.emit('aaa')).equals(false)
      })
    })

    describe('eventNames', function () {
      it('returns an empty array when there are no events', function () {
        var e = new Dispatchor()

        expect(e.eventNames()).eql([])

        e.on('foo', function () {})
        e.removeAllListeners('foo')

        expect(e.eventNames()).eql([])
      })

      it('returns an array listing the events that have listeners', function () {
        var e = new Dispatchor(),
          original

        function bar () {}

        if (Object.getOwnPropertySymbols) {
          //
          // Monkey patch `Object.getOwnPropertySymbols()` to increase coverage
          // on Node.js > 0.10.
          //
          original = Object.getOwnPropertySymbols
          Object.getOwnPropertySymbols = undefined
        }

        e.on('foo', function () {})
        e.on('bar', bar)

        try {
          expect(e.eventNames()).eql(['foo', 'bar'])
          e.removeListener('bar', bar)
          expect(e.eventNames()).eql(['foo'])
        } catch (ex) {
          throw ex
        } finally {
          if (original) Object.getOwnPropertySymbols = original
        }
      })

      it('does not return inherited property identifiers', function () {
        var e = new Dispatchor()

        function Collection () {}
        Collection.prototype.foo = function () {
          return 'foo'
        }

        e._events = new Collection()

        expect(e._events.foo()).equal('foo')
        expect(e.eventNames()).eql([])
      })

      if (typeof Symbol !== 'undefined') {
        it('includes ES6 symbols', function () {
          var e = new Dispatchor(),
            s = Symbol('s')

          function foo () {}

          e.on('foo', foo)
          e.on(s, function () {})

          expect(e.eventNames()).eql(['foo', s])

          e.removeListener('foo', foo)

          expect(e.eventNames()).eql([s])
        })
      }
    })
  })
}
