import { CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {[r:number, g:number, b:number]} BandpassColors
 */

/**
 * @typedef {{[bandpass: string]: BandpassColors}} BandpassesColors
 */

/**
 * @typedef {Object} SkyPortalConfig
 * @property {BandpassesColors} bandpassesColors
 */

/**
 * Fetch the configuration from the server
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo - The user info
 * @returns {Promise<SkyPortalConfig>}
 */
export const fetchConfig = async (userInfo) => {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/config`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
};

/**
 * @param {import("../onboarding/onboarding.lib.js").UserInfo} userInfo
 * @returns {Promise<import("./common.lib.js").GroupsResponse>}
 */
export async function fetchGroups(userInfo) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/groups`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
}