/** General utilities to make javascript-ing easier */
module.exports = {
  AddTraits: require('./AddTraits'),
  collectObjectProperty: require('./collectObjectProperty'),
  flattenObject: require('./flattenObject'),
  getClass: require('./getClass'),
  isEmptyObject: require('./isEmptyObject'),
  makePluginable: require('./makePluginable'),
  mapAndRemove: require('./mapAndRemove'),
  parseAttribute: require('./parseAttribute'),
  undefOrNull: require('./undefOrNull'),
  valOrCallFunc: require('./valOrCallFunc'),
  prepareClusters: require('./prepareClusters'),
  
  RelationType: require('./traits/RelationType'),
  PolymorphicType: require('./traits/PolymorphicType'),
  
  getUsingDot: require('./dot/get'),
  setUsingDot: require('./dot/set')
}
