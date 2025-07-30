class APIError extends Error {
  constructor(message, status, responseBody) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

/**
 * A helper for making API calls.
 * It handles URL construction, headers, and response/error processing.
 */
class APIHelper {
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  /**
   * Private helper to handle the fetch request and response.
   * @param {string} url - The endpoint path.
   * @param {RequestInit} options - The fetch options.
   * @returns {Promise<any>} - The JSON response body.
   * @throws {APIError} - Throws on network failure or non-2xx response.
   */
  async _request(url, options) {
    const endpoint = new URL(url, this.baseUrl);
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(endpoint, config);

      if (response.ok) {
        return response.json();
      }

      const errorBody = await response.json().catch(() => null);
      const errorMessage =
        errorBody?.message || `Request failed with status ${response.status}`;
      throw new APIError(errorMessage, response.status, errorBody);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new Error(`Network or unexpected error occurred: ${error.message}`);
    }
  }

  /**
   * Performs a GET request.
   * @param {string} url - The endpoint path.
   * @param {Record<string, string>} [params] - URL query parameters.
   * @returns {Promise<any>}
   */
  async get(url, params) {
    const endpoint = new URL(url, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        endpoint.searchParams.append(key, value);
      });
    }
    return this._request(endpoint.pathname + endpoint.search, {
      method: "GET",
    });
  }

  /**
   * Performs a POST request.
   * @param {string} url - The endpoint path.
   * @param {object} body - The request body, will be stringified.
   * @returns {Promise<any>}
   */
  async post(url, body) {
    return this._request(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}

/**
 * Base class for all providers, defining a common interface.
 */
class Provider {
  constructor(name, config, apiHelper) {
    if (!apiHelper) {
      throw new Error("APIHelper instance is required.");
    }
    this.name = name;
    this.config = config;
    this.apiHelper = apiHelper;
  }

  // Abstract methods that must be implemented by subclasses
  async getPackage() {
    return AHCProvider.getPackages(this.name);
  }

  checkServiceability() {
    throw new Error("Method 'checkServiceability' not implemented.");
  }
  getCollectionTimeSlots() {
    throw new Error("Method 'getCollectionTimeSlots' not implemented.");
  }
  createBooking() {
    throw new Error("Method 'createBooking' not implemented.");
  }
}

class RedCliff extends Provider {
  async getElocId(location) {
    const url = "/api/partner/v2/get-partner-location-2-eloc/";
    return this.apiHelper.get(url, { place_query: location });
  }

  async checkServiceability(elocId) {
    const url = "/api/partner/v2/get-partner-location-2-eloc/";
    return this.apiHelper.get(url, { eloc: elocId });
  }

  async getCollectionTimeSlots(collection_date, latitude, longitude) {
    const url = "/api/booking/v2/get-time-slot-list";
    return this.apiHelper.get(url, { collection_date, latitude, longitude });
  }
}

class Healthians extends Provider {
  async getAccessToken() {
    const url = `/api/${this.config.partnerName}/getAccessToken`;
    return this.apiHelper.get(url);
  }

  async checkServiceability(latitude, longitude, zipcode) {
    const url = `/api/${this.config.partnerName}/checkServiceabilityByLocation_v2`;
    const response = await this.apiHelper.post(url, {
      lat: latitude,
      long: longitude,
      zipcode,
    });
    return response.data;
  }

  /**
   * @returns {Promise<object[]>} - Adjusted for the expected structure
   */
  async getCollectionTimeSlots(slot_data, zone_id, latitude, longitude) {
    const url = `/api/${this.config.partnerName}/getSlotsByLocation`;
    const response = await this.apiHelper.post(url, {
      slot_data,
      zone_id,
      lat: latitude,
      long: longitude,
    });
    return response.data;
  }
}

// --- Factory for Creating Providers ---

// Assumes this provider is defined somewhere accessible
// const AHCProvider = { getHostUrl: async (name) => `https://api.${name.toLowerCase()}.com` };

const PROVIDER_CONFIG = {
  RedCliff: {
    apiKey: "redcliff_api_key_from_env", // Best practice: load from environment variables
    partnerName: "MantraCare", // Example of provider-specific config
    class: RedCliff,
  },
  Healthians: {
    apiKey: "healthians_api_key_from_env",
    partnerName: "MantraCare", // Centralized config
    class: Healthians,
  },
};

class ProviderFactory {
  /**
   * @param {'RedCliff' | 'Healthians'} name - The name of the provider.
   * @returns {Promise<Provider>} A fully initialized provider instance.
   */
  static async createProvider(name) {
    const config = PROVIDER_CONFIG[name];
    if (!config) {
      throw new Error(`Invalid provider name: ${name}`);
    }

    const hostUrl = await AHCProvider.getHostUrl(name);

    const apiHelper = new APIHelper(hostUrl, {
      Authorization: `Bearer ${config.apiKey}`,
    });

    const ProviderClass = config.class;
    return new ProviderClass(name, config, apiHelper);
  }
}

const redcliffProvider = await ProviderFactory.createProvider("RedCliff");

export { ProviderFactory, redcliffProvider };
