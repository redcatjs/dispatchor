class Event {
  constructor (fn, context, once) {
    this.fn = fn
    this.context = context
    this.once = once || false
  }
}

class Dispatchor {
  constructor () {
    this._events = new Map()
  }
  eventNames () {
    return Array.from(this._events.keys())
  }
  listeners (event) {
    const handlers = this._events.get(event)

    if (!handlers) {
      return []
    }
    if (handlers.fn) {
      return [handlers.fn]
    }

    const l = handlers.length
    const ee = new Array(l)
    for (let i = 0; i < l; i++) {
      ee[i] = handlers[i].fn
    }

    return ee
  }

  emit (evt) {
    if (!this._events.has(evt)) return false

    let listeners = this._events.get(evt)

    const args = []
    Object.values(arguments).slice(1).forEach(arg => args.push(arg))

    if (listeners.fn) {
      listeners = [ listeners ]
    }

    listeners.forEach(listener => {
      if (listener.once) {
        this.removeListener(evt, listener.fn, undefined, true)
      }
      Reflect.apply(listener.fn, listener.context, args)
    })

    return true
  }

  on (event, fn, context) {
    return this._addListener(event, fn, context, false)
  }

  once (event, fn, context) {
    return this._addListener(event, fn, context, true)
  }

  removeListener (evt, fn, context, once) {
    if (!this._events.has(evt)) return this
    if (!fn) {
      this._clearEvent(evt)
      return this
    }

    const listeners = this._events.get(evt)

    const events = []

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        this._clearEvent(evt)
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i])
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) {
        const event = events.length === 1 ? events[0] : events
        if (event !== undefined) {
          this._events.set(evt, event)
        }
      } else {
        this._clearEvent(evt)
      }
    }

    return this
  }

  removeAllListeners (evt) {
    if (evt) {
      if (this._events.has(evt)) {
        this._clearEvent(evt)
      }
    } else {
      this._events = new Map()
    }
    return this
  }

  // alias methods
  off (eventName, listener) {
    return this.removeListener(eventName, listener)
  }
  addListener (eventName, listener) {
    return this.on(eventName, listener)
  }

  // internal methods
  _clearEvent (evt) {
    this._events.delete(evt)
  }
  _addListener (evt, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function')
    }

    const listener = new Event(fn, context || this, once)

    if (!this._events.has(evt)) {
      this._events.set(evt, listener)
    } else if (!this._events.get(evt).fn) {
      this._events.get(evt).push(listener)
    } else {
      this._events.set(evt, [this._events.get(evt), listener])
    }

    return this
  }
}

export default Dispatchor
