import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { UserContext } from "../common/common.context.js";
import { QUERY_KEYS } from "../common/common.lib.js";
import { fetchSourceSpectra } from "./sources.requests.js";
import { fetchSources } from "./sources.requests.js";

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