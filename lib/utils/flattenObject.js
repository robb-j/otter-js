
/**
 * Flattens nested objects to dot.notation key values
 * @param  {object} object The object to flatten
 * @return {object} The flattened output
 */
function flattenObject(object) {
  
  // Where to put the flat object
  let flat = {}
  
  // Loop through each property
  for (let i in object) {
    
    // Skip if not our own property
    if (!object.hasOwnProperty(i)) continue
    
    // If its a nested property
    if (typeof object[i] === 'object') {
      
      // Recursively process the nested property
      var cluster = flattenObject(object[i])
      
      // For each of the recursed flat values, add to our result
      for (var j in cluster) {
        if (!cluster.hasOwnProperty(j)) continue
        flat[`${i}.${j}`] = cluster[j]
      }
    }
    else {
      
      // If not an object, just copy the value
      flat[i] = object[i]
    }
  }
  
  return flat
}

module.exports = flattenObject
