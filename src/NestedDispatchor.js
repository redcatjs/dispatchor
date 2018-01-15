import Dispatchor from './Dispatchor'

export default class NestedDispatchor {
  constructor (parentDispatcher) {
    this.parentDispatcher = parentDispatcher
    this.ownDispatcher = new Dispatchor()
    this.wildcardCallback = (eventName, ...args) => {
      this.ownDispatcher.emit(eventName, args)
    }
    this.parentDispatcher.on('*', this.wildcardCallback)
  }

  get localDispatcher () {
    if (this._localDispatcher === undefined) {
      this._localDispatcher = new Dispatchor()
    }
    return this._localDispatcher
  }

  on (eventName, listener, context = this) {
    this.localDispatcher.on(eventName, listener, context)
    this.ownDispatcher.on(eventName, listener, context)
  }
  removeListener (eventName, listener, context = this) {
    if (eventName === undefined) {
      this.parentDispatcher.removeListener('*', this.wildcardCallback)
    } else {
      this.localDispatcher.removeListener(eventName, listener, context)
      this.ownDispatcher.removeListener(eventName, listener, context)
    }
  }
  off (...args) {
    return this.removeListener(...args)
  }
  addListener (...args) {
    return this.on(...args)
  }

  emit (...args) {
    this.localDispatcher.emit(...args)
    this.parentDispatcher.emit(...args)
  }
}
