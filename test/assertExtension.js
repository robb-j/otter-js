const assert = require('assert')

async function getAsyncError(block, expectedError = null) {
  
  try {
    await block()
    return null
  }
  catch (error) {
    return error
  }
}


function assertClass(value, type) {
  assert.equal(typeof value, 'object')
  assert.equal(value.constructor.name, type)
}



module.exports = {
  getAsyncError: getAsyncError,
  assertClass: assertClass
}
