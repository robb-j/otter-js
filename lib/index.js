

console.log('\n\nStarting')

const otter = require('./Otter')



let myPlugin = {
  install(otter, a, b) {
    console.log(otter)
  }
}


otter.use(myPlugin, 42, 'hello')


// console.log(otter)
