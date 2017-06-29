
module.exports = function(key, value, attribute) {
  
  if (typeof value === 'object') {
    
    if (typeof value['<'] === 'number') {
      return { $gt: value['<'] }
    }
    
    if (typeof value['>'] === 'number') {
      return { $lt: value['>'] }
    }
    
    if (typeof value['<='] === 'number') {
      return { $gte: value['<='] }
    }
    
    if (typeof value['>='] === 'number') {
      return { $lte: value['>='] }
    }
  }
  
  return null
}
