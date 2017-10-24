/**
 * A promise for a query with extra methods to mutate the query
 * @type {[type]}
 */
class QueryPromise extends Promise {
  
  /** Creates a new promise with a query */
  constructor(executor, query) {
    super(executor)
    this.query = query
  }
  
  
  /**
   * Sets the limit on the query
   * @param  {number} length The length to set the limit to
   * @return {QueryPromise} The promise for chaining
   */
  limit(length) {
    this.query.limit = length
    return this
  }
  
  /**
   * Adds a where clause to the query. Either pass a key and a value as two parameters or an object of key-value pairs.
   * @param  {object} query Extra values to query by
   * @return {QueryPromise} The promise for chaining
   */
  where(...args) {
    // If 2 args passed, use them as a key and value
    if (args.length === 2) {
      this.query.where[args[0]] = args[1]
    }
    else if (args.length === 1 && typeof args[0] === 'object') {
      
      // If 1 parameter, assign the object into the query
      Object.assign(this.query.where, args[0])
    }
    else {
      
      // Anythin else, throw an error
      throw new Error('Incorrect Arguements')
    }
    return this
  }
  
}


module.exports = QueryPromise
