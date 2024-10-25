export const getStripeDevSuffix = (environment) => {
  return environment === 'production' ? '' : `_test`;
};
