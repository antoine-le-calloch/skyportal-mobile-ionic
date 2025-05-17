import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../common/common.context.js";
import { QUERY_KEYS } from "../common/common.lib.js";
import {
  addToFavorites,
  fetchFavorites,
  fetchFavoriteSources,
  fetchSourceSpectra,
  removeFromFavorites,
  submitFollowupRequest
} from "./sources.requests.js";
import { fetchSources } from "./sources.requests.js";
import { checkmarkCircleOutline } from "ionicons/icons";
import { useIonToast } from "@ionic/react";
import { useErrorToast } from "../common/common.hooks.js";

/** @typedef {import("../common/common.hooks.js").QueryStatus} QueryStatus */

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.numPerPage
 * @returns {{sources: import("../sources/sources.lib.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSources = ({ page, numPerPage }) => {
  const { userInfo } = useContext(UserContext);
  const {
    /** @type {import("../sources/sources.lib.js").Source[]} */ data: sources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCES, page, numPerPage],
    queryFn: () =>
      fetchSources({
        userInfo,
        page,
        numPerPage,
      }),
    // @ts-ignore
    suspense: true,
  });
  return {
    sources,
    status,
    error,
  };
};

/**
 * @param {string} sourceId
 * @returns {{spectraList: import("./sources.lib.js").Spectra[] | undefined, status: import("@tanstack/react-query").QueryStatus, error: any | undefined }}
 */
export const useSourceSpectra = (sourceId) => {
  const { userInfo } = useContext(UserContext);
  const {
    data: spectraList,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCE_SPECTRA, sourceId],
    queryFn: async () => {
      if (!sourceId) {
        throw new Error("Missing sourceId");
      }
      return await fetchSourceSpectra({ userInfo, sourceId });
    },
    enabled: !!sourceId,
  });
  return {
    spectraList,
    status,
    error,
  };
}

// Followup request related hooks

export const useSubmitFollowupRequest = () => {
  const { userInfo } = useContext(UserContext);
  const [presentToast] = useIonToast();
  const errorToast = useErrorToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @param {number} params.allocationId
     * @param {number[]} params.groupIds
     * @param {Object} params.payload
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId, allocationId, groupIds, payload }) =>
      submitFollowupRequest({ userInfo, sourceId, allocationId, groupIds, payload }),
    onSuccess: (response) => {
      if (response.status === 200) {
        presentToast({
          message: response.data?.data?.request_status || "Request submitted",
          duration: 3000,
          position: "top",
          color: "success",
          icon: checkmarkCircleOutline
        }).then()
      }else{
        errorToast(response.data.message || "Failed to submit request", true);
      }
    },
    onError: () =>
      errorToast("Failed to submit request"),
  });
}

// Favorite sources related hooks

export const useFetchFavoriteSourceIds = () => {
  const { userInfo } = useContext(UserContext);
  const {
    data,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_SOURCE_IDS],
    queryFn: () =>
      fetchFavorites({
        userInfo,
      }),
    // @ts-ignore
    suspense: true,
  });
  const favoriteSourceIds = Array.isArray(data)
    ? data.map((source) => source.obj_id)
    : [];

  return {
    favoriteSourceIds,
    status,
    error,
  };
}

/**
 * @returns {{favoriteSources: import("../sources/sources.lib.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchFavoriteSources = () => {
  const { userInfo } = useContext(UserContext);
  const {
    data: favoriteSources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_SOURCES],
    queryFn: () =>
      fetchFavoriteSources({
        userInfo,
      }),
    // @ts-ignore
    suspense: true,
  });
  return {
    favoriteSources,
    status,
    error,
  };
}

export const useAddSourceToFavorites = () => {
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId }) =>
      addToFavorites({ userInfo, sourceId }),
    onSuccess: (response) => {
      if (response.status !== 200) {
        errorToast("Failed to add this source to favorites");
      }else{
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITE_SOURCE_IDS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITE_SOURCES] });
      }
    },
    onError: () =>
      errorToast("Failed to add this source to favorites"),
  });
}

export const useRemoveSourceFromFavorites = () => {
  const { userInfo } = useContext(UserContext);
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  return useMutation({
    /**
     * @param {Object} params
     * @param {string} params.sourceId
     * @returns {Promise<*>}
     */
    mutationFn: ({ sourceId }) =>
      removeFromFavorites({ userInfo, sourceId }),
    onSuccess: (response) => {
      if (response.status !== 200) {
        errorToast("Failed to remove this source from favorites");
      }else{
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITE_SOURCE_IDS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITE_SOURCES] });
      }
    },
    onError: () =>
      errorToast("Failed to remove this source from favorites"),
  });
}
