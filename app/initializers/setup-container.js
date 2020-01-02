export function initialize( application ) {
  console.log("Registering options for model type");
  application.registerOptionsForType('model', { singleton: true, instantiate: false });
}

export default {
  initialize
};
