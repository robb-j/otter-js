
/** Asserts if awaiting a closure throws an error, returning the error */
module.exports = async function asyncError(block) {
  
  let thrownError = null
  
  try {
    await block()
  }
  catch (error) {
    thrownError = error
  }
  
  if (!thrownError) throw new Error('Error was not thrown')
  
  return thrownError
}
