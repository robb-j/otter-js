/**
 * Mapps a set of values on an Object to different keys and removes them from their original key
 * @param  {object} object   The object to peprform the mapping on
 * @param  {object} mapping  The key-newKey mapping to apply
 * @return {object}          The updated object
 */
module.exports = function mapAndRemove(object, mapping) {
  
  // Loop through each key to map
  for (let key in mapping) {
    
    // If it doesn't exist, skip it
    if (object[key] === undefined) continue
    
    // Move the value to the new key
    object[mapping[key]] = object[key]
    
    // Remove the original value
    delete object[key]
  }
  
  // Return the (now updated) object
  return object
}
