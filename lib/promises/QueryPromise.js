class QueryPromise extends Promise {
  
  constructor(executor, query) {
    super(executor)
    this.query = query
  }
  
  
  limit(n) {
    this.query.limit = n
    return this
  }
  
  where(...args) {
    if (args.length === 2) {
      this.query.where[args[0]] = args[1]
    }
    else if (args.length === 1 && typeof args[0] === 'object') {
      Object.assign(this.query.where, args[0])
    }
    else {
      throw new Error('Incorrect Arguements')
    }
    return this
  }
  
  // sort(key, direction = 'asc') {
  //   // ...
  //   return this
  // }
}


module.exports = QueryPromise
