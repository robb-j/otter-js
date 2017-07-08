const { undefOrNull } = require('./utils')

/**
 * A query in Otter, responsible for parsing raw queries passed to model classes and parsing them.
 * There are serveral shorthands:
 *  - null | {} => makes a query for everything
 *  - string | int => makes a query for a specific id
 *  - { key: val } => makes a query for that matches those values
 *  - { where: {}, limit: {}, sort: [], pluck: [] } is the full form, shorthands are parsed into this
 * @type {Otter.Types.Query}
 */
class Query {
  
  /**
   * Creates a new Query
   * @param  {String} modelName The name of the model being queried
   * @param  {String|Number|Object} [input={}] The query options
   * @return {Otter.Types.Query}
   */
  constructor(modelName, input = {}) {
    
    // Store the model name
    this.modelName = modelName
    
    // Setup properties
    this.where = null
    this.sort = null
    this.limit = null
    this.pluck = null
    
    
    // The keywords to look for in input
    let reserved = [ 'where', 'sort', 'limit', 'pluck' ]
    
    
    // Map those values onto ourself
    Object.keys(input).forEach((key) => {
      if (reserved.includes(key)) {
        this[key] = input[key]
      }
    })
    
    
    // Work out if all reserved values are missing
    let allMissing = reserved.reduce((allMissing, key) => {
      return allMissing && undefOrNull(this[key])
    }, true)
    
    
    // If all reserved values are missing, we're using a shorthand
    if (allMissing) {
      
      if (typeof input === 'string' || typeof input === 'number') {
        
        // If a string was passed, do an id query
        this.where = { id: input }
      }
      else if (Array.isArray(input)) {
        
        // If an array of strings, map to an id array
        let allStrings = input.reduce((all, id) => {
          return all && typeof id === 'string'
        }, true)
        
        if (allStrings) {
          this.where = { id: input }
        }
      }
      else if (typeof input === 'object') {
        
        // If an object, set that to our where
        this.where = input
      }
    }
  }
  
}

module.exports = Query
