export default class Event {
  constructor (fn, context, once) {
    this.fn = fn
    this.context = context
    this.once = once || false
  }
}
