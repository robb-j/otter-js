/** General utilities to make javascript-ing easier */
module.exports = {
  AddTraits: require('./AddTraits'),
  usesTrait: require('./usesTrait'),
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
  
  AssociativeType: require('./traits/AssociativeType'),
  NestingType: require('./traits/NestingType'),
  PolymorphicType: require('./traits/PolymorphicType'),
  RelationType: require('./traits/RelationType'),
  
  getUsingDot: require('./dot/get'),
  setUsingDot: require('./dot/set'),
  mergeUsingDot: require('./dot/merge')
}
