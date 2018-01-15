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
  on(eventName, listener){
    
    this._registerEvent(eventName, listener)
    this.rootDispatcher.on(eventName, listener, this)
  }
  removeListener(eventName, listener){
    
    if(eventName === undefined){
      this._unregister()
    }
    
    this.rootDispatcher.removeListener(eventName, listener, this)
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
