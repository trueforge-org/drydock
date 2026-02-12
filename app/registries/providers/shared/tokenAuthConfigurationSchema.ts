// @ts-nocheck
export function getTokenAuthConfigurationSchema(joi) {
  return joi.alternatives([
    joi.string().allow(''),
    joi.object().keys({
      login: joi.string(),
      password: joi.string(),
      token: joi.string(),
      auth: joi.string().base64(),
    }),
  ]);
}
