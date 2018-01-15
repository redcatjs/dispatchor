import Dispatchor from './Dispatchor'

export default class NestedDispatchor extends Dispatchor {
  constructor (rootDispatcher) {
    super()
    this._eventsRegistry = []
    this.rootDispatcher = rootDispatcher
    // super.on('*', (eventName, ...args) => {
      // this.rootDispatcher.emit(eventName, args)
    // })
  }
  on (eventName, listener, context = this) {
    this._registerEvent(eventName, listener)
    this.rootDispatcher.on(eventName, listener, context)
  }
  removeListener (eventName, listener, context = this) {
    if (eventName === undefined) {
      this._unregister()
    }
    this.rootDispatcher.removeListener(eventName, listener, context)
  }
  
  getParent(){
    return this.rootDispatcher
  }
  
  emit (eventName, ...args) {
    this.emitLocal(eventName, ...args)
    this.emitParent(eventName, ...args)
  }
  
  emitParent (eventName, ...args) {
    return this.rootDispatcher.emit(eventName, ...args)
  }
  
  emitLocal (...args) {
    return super.emit(...args)
  }

  onLocal (...args) {
    return super.on(...args)
  }
  removeListenerLocal (...args) {
    return super.removeListener(...args)
  }
  offLocal (...args) {
    return this.removeListenerLocal(...args)
  }
  addListenerLocal (...args) {
    return this.onLocal(...args)
  }

  _unregister (eventName, listener) {
    const eventsRegistry = this._eventsRegistry
    Object.keys(eventsRegistry).forEach(eventName => {
      eventsRegistry[eventName].forEach( fn => {
        this.rootDispatcher.removeListener(eventName, fn, this)
      } )
    })
  }
  _registerEvent (eventName, listener) {
    if (!this._eventsRegistry[eventName]) {
      this._eventsRegistry[eventName] = []
    }
    this._eventsRegistry[eventName].push(listener)
  }
}
