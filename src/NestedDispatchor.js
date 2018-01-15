import Dispatchor from './Dispatchor'

export default class NestedDispatchor extends Dispatchor {
  constructor(rootDispatcher){
    super()
    this._eventsRegistry = []
    this.rootDispatcher = rootDispatcher
    this.on('*', (eventName, ...args) => {
      this.rootDispatcher.emit(eventName, args)
    })
  }
  on(eventName, listener, context = this){
    this._registerEvent(eventName, listener)
    this.rootDispatcher.on(eventName, listener, context)
  }
  removeListener(eventName, listener, context = this){
    if(eventName === undefined){
      this._unregister()
    }
    this.rootDispatcher.removeListener(eventName, listener, context)
  }
  
  onLocal(...args){
    super.on(...args)
  }
  removeListenerLocal(...args){
    super.removeListener(...args)
  }
  offLocal (...args) {
    return this.removeListenerLocal(...args)
  }
  addListenerLocal (...args) {
    return this.onLocal(...args)
  }
  
  _unregister(eventName, listener){
    Object.keys(this._eventsRegistry).forEach( eventName => {
      this.rootDispatcher.removeListener(eventName, this._eventsRegistry[eventName], this)
    })
  }
  _registerEvent(eventName, listener){
    if(!this._eventsRegistry[eventName]){
      this._eventsRegistry[eventName] = []
    }
    this._eventsRegistry[eventName].push(listener)
  }
}
