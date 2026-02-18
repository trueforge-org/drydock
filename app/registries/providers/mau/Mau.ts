// @ts-nocheck
import axios from 'axios';
import Gitlab from '../gitlab/Gitlab.js';

/**
 * dock.mau.dev (GitLab-based) Container Registry integration.
 */
class Mau extends Gitlab {
  /**
   * Get the mau configuration schema.
   * @returns {*}
   */
  getConfigurationSchema() {
    return this.joi.alternatives([
      this.joi.string().allow(''),
      this.joi.object().keys({
        url: this.joi.string().uri().default('https://dock.mau.dev'),
        authurl: this.joi.string().uri().default('https://dock.mau.dev'),
        token: this.joi.string(),
      }),
    ]);
  }

  /**
   * Custom init behavior.
   */
  init() {
    this.configuration = this.configuration || {};
    if (typeof this.configuration === 'string') {
      this.configuration = {};
    }
    this.configuration.url = this.configuration.url || 'https://dock.mau.dev';
    this.configuration.authurl = this.configuration.authurl || 'https://dock.mau.dev';
  }

  /**
   * Sanitize sensitive data.
   * @returns {*}
   */
  maskConfiguration() {
    return this.maskSensitiveFields(['token']);
  }

  /**
   * Return true if image registry matches dock.mau.dev.
   * @param image the image
   * @returns {boolean}
   */
  match(image) {
    return /^.*\.?dock\.mau\.dev$/i.test(image.registry.url);
  }

  /**
   * Authenticate to dock.mau.dev.
   * @param image
   * @param requestOptions
   * @returns {Promise<*>}
   */
  async authenticate(image, requestOptions) {
    const request = {
      method: 'GET',
      url: `${this.configuration.authurl}/jwt/auth?service=container_registry&scope=repository:${image.name}:pull`,
      headers: {
        Accept: 'application/json',
      },
    };

    if (this.configuration.token) {
      request.headers.Authorization = `Basic ${Mau.base64Encode('', this.configuration.token)}`;
    }

    const response = await axios(request);
    const requestOptionsWithAuth = requestOptions;
    requestOptionsWithAuth.headers.Authorization = `Bearer ${response.data.token}`;
    return requestOptionsWithAuth;
  }

  /**
   * Return auth for pull when token is configured.
   * @returns {{password: *, username: string}|undefined}
   */
  async getAuthPull() {
    if (!this.configuration.token) {
      return undefined;
    }
    return {
      username: '',
      password: this.configuration.token,
    };
  }
}

export default Mau;
