import Dispatchor from './Dispatchor'

export default class NestedDispatchor {
  constructor (parentDispatcher, { autoEnable = true } = {}) {
    this.parentDispatcher = parentDispatcher
    this.ownDispatcher = new Dispatchor()
    this.localDispatcher = new Dispatchor()
    this.wildcardCallback = (eventName, ...args) => {
      this.ownDispatcher.emit(eventName, args)
    }
    if(autoEnable){
      this.enable()
    }
  }
  
  enable(){
    if(this.enabled) return
    this.enabled = true
    this.parentDispatcher.on('*', this.wildcardCallback)
  }
  disable(){
    if(!this.enabled) return
    this.enabled = false
    this.parentDispatcher.removeListener('*', this.wildcardCallback)
  }
  
  on (eventName, listener, context = this) {
    this.localDispatcher.on(eventName, listener, context)
    this.ownDispatcher.on(eventName, listener, context)
  }
  removeListener (eventName, listener, context = this) {
    this.localDispatcher.removeListener(eventName, listener, context)
    this.ownDispatcher.removeListener(eventName, listener, context)
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
