/** @typedef {import("../common/common.lib.js").Group} Group */
/** @typedef {import("../sources/sources.lib.js").Source} Source */
/** @typedef {import("../sources/sources.lib.js").FollowupRequest} FollowupRequest */
/** @typedef {import("../sources/sources.lib.js").Comment} Comment */
/** @typedef {import("../sources/sources.lib.js").Thumbnail} Thumbnail */
/** @typedef {import("../sources/sources.lib.js").Spectra} Spectra */
/** @typedef {import("../sources/sources.lib.js").Photometry} Photometry */

/**
 * @typedef {Object} Candidate
 * @property {number} ra - Right ascension
 * @property {number} dec - Declination
 * @property {string} id - Source id
 * @property {Thumbnail[]} thumbnails - Thumbnails of the candidate
 * @property {CandidateAnnotation[]} annotations - Annotations of the candidate
 * @property {boolean} is_source - Is the candidate has been saved
 * @property {Group[]} saved_groups - Groups the candidate has been saved to
 * @property {CandidateClassification[]} classifications - Classifications of the candidate
 * @property {FollowupRequest[]} followup_requests - Follow-up requests
 * @property {Comment[]} comments - Comments on the follow-up request
 * @property {string} tns_name - TNS name
 * @property {Spectra[]} spectra - Spectra of the candidate
 */

/**
 * @typedef {Object} CandidateAnnotation
 * @property {number} id - Annotation ID
 * @property {string} origin - Annotation origin
 * @property {string} obj_id - Object ID
 * @property {{[key: string]: string|number|Array<any>|undefined}} data - Annotation data
 * @property {number} author_id - Author ID
 * @property {Group[]} groups - Groups the annotation belongs to
 */

/**
 * @typedef {Object} CandidateClassification
 * @property {string} modified - Modified date
 * @property {boolean} ml - Is the classification from machine learning
 * @property {number} probability - Probability of the classification
 * @property {string} classification - Classification
 */

/**
 * @typedef {"specific"|"all"|"ask"} DiscardBehavior
 */

/**
 * @typedef {Object} ScanningConfig
 * @property {string} startDate
 * @property {string} endDate
 * @property {import("../common/common.lib.js").SavedStatus} savedStatus
 * @property {DiscardBehavior} discardBehavior
 * @property {number[]} saveGroupIds
 * @property {Group[]} saveGroups
 * @property {number[]} junkGroupIDs
 * @property {Group[]} junkGroups
 * @property {string[]} pinnedAnnotations
 * @property {string} queryID
 * @property {number} totalMatches
 */

/**
 * @typedef {Object} ScanningRecap
 * @property {string} queryId
 * @property {number} totalMatches
 * @property {Candidate[]} assigned
 * @property {Candidate[]} notAssigned
 */

import config from "../config.js";
import { Clipboard } from "@capacitor/clipboard";
import { useIonToast } from "@ionic/react";
import { useCallback } from "react";
import moment from "moment-timezone";

import { SAVED_STATUS } from "../common/common.lib.js";

/**
 * @param {Object} params
 * @param {Photometry[]} params.photometry
 * @param {number} params.titleFontSize
 * @param {number} params.labelFontSize
 * @param {import("../common/common.requests.js").BandpassesColors} params.bandpassesColors
 * @returns {import("vega-embed").VisualizationSpec}
 */
export const getVegaPlotSpec = ({
  photometry,
  titleFontSize,
  labelFontSize,
  bandpassesColors,
}) => {
  /** @type {{domain: string[], range: string[]}} */
  const colorScale = { domain: [], range: [] };
  new Set(photometry.map((p) => p.filter)).forEach((f) => {
    colorScale.domain.push(f);
    colorScale.range.push(`rgb(${bandpassesColors[f].join(",")})`);
  });
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const mjdNow = Date.now() / 86400000.0 + 40587.0;
  return /** @type {any} */ ({
    $schema: "https://vega.github.io/schema/vega-lite/v5.2.0.json",
    background: "transparent",
    width: "container",
    height: "container",
    data: {
      values: photometry,
    },
    layer: [
      {
        selection: {
          filterMags: {
            type: "multi",
            fields: ["filter"],
            bind: "legend",
          },
          grid: {
            type: "interval",
            bind: "scales",
          },
        },
        mark: {
          type: "point",
          shape: "circle",
          filled: "true",
          size: 24,
        },
        transform: [
          {
            calculate:
              "join([format(datum.mag, '.2f'), ' ± ', format(datum.magerr, '.2f'), ' (', datum.magsys, ')'], '')",
            as: "magAndErr",
          },
          { calculate: `${mjdNow} - datum.mjd`, as: "daysAgo" },
        ],
        encoding: {
          x: {
            field: "daysAgo",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
            axis: {
              title: "days ago",
              titleFontSize,
              labelFontSize,
            },
          },
          y: {
            field: "mag",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
            axis: {
              title: "mag",
              titleFontSize,
              labelFontSize,
              titleColor: isDarkMode ? "white" : "black",
              labelColor: isDarkMode ? "white" : "black",
            },
          },
          color: {
            field: "filter",
            type: "nominal",
            scale: colorScale,
            legend: {
              titleAnchor: "start",
              offset: 5,
            },
          },
          tooltip: [
            { field: "magAndErr", title: "mag", type: "nominal" },
            { field: "filter", type: "ordinal" },
            { field: "mjd", type: "quantitative" },
            { field: "daysAgo", type: "quantitative" },
            { field: "limiting_mag", type: "quantitative", format: ".2f" },
          ],
          opacity: {
            condition: { selection: "filterMags", value: 1 },
            value: 0,
          },
        },
      },

      // Render error bars
      {
        selection: {
          filterErrBars: {
            type: "multi",
            fields: ["filter"],
            bind: "legend",
          },
        },
        transform: [
          { filter: "datum.mag != null && datum.magerr != null" },
          { calculate: "datum.mag - datum.magerr", as: "magMin" },
          { calculate: "datum.mag + datum.magerr", as: "magMax" },
          { calculate: `${mjdNow} - datum.mjd`, as: "daysAgo" },
        ],
        mark: {
          type: "rule",
          size: 0.5,
        },
        encoding: {
          x: {
            field: "daysAgo",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
              padding: 0,
            },
            axis: {
              title: "days ago",
              titleFontSize,
              labelFontSize,
              titleColor: isDarkMode ? "white" : "black",
              labelColor: isDarkMode ? "white" : "black",
            },
          },
          y: {
            field: "magMin",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
          },
          y2: {
            field: "magMax",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
          },
          color: {
            field: "filter",
            type: "nominal",
            legend: {
              orient: "bottom",
              titleFontSize,
              labelFontSize,
              titleColor: isDarkMode ? "white" : "black",
              labelColor: isDarkMode ? "white" : "black",
            },
          },
          opacity: {
            condition: { selection: "filterErrBars", value: 1 },
            value: 0,
          },
        },
      },

      // Render limiting mags
      {
        transform: [
          { filter: "datum.mag == null" },
          { calculate: `${mjdNow} - datum.mjd`, as: "daysAgo" },
        ],
        selection: {
          filterLimitingMags: {
            type: "multi",
            fields: ["filter"],
            bind: "legend",
          },
        },
        mark: {
          type: "point",
          shape: "triangle-down",
        },
        encoding: {
          x: {
            field: "daysAgo",
            type: "quantitative",
            scale: {
              zero: false,
              reverse: true,
            },
            axis: {
              title: "days ago",
              titleFontSize,
              labelFontSize,
            },
          },
          y: {
            field: "limiting_mag",
            type: "quantitative",
          },
          color: {
            field: "filter",
            type: "nominal",
          },
          opacity: {
            condition: { selection: "filterLimitingMags", value: 0.3 },
            value: 0,
          },
        },
      },
    ],
  });
};

export const useCopyAnnotationLineOnClick = () => {
  const [present] = useIonToast();
  return useCallback(
    /**
     * @param {string} key
     * @param {string|number|undefined} value
     */
    async (key, value) => {
      if (value === undefined) {
        return;
      }
      await Clipboard.write({
        string: `${key}: ${value}`,
      });
      await present({
        message: "Annotation copied to clipboard!",
        duration: 2000,
      });
    },
    [present],
  );
};

/**
 * Parse a string of integers separated by commas
 * @param {string} intListString
 * @returns {number[]}
 */
export const parseIntList = (intListString) => {
  try {
    return intListString
      .split(",")
      .filter((/** @type {string} **/ id) => id !== "")
      .map((/** @type {string} **/ id) => parseInt(id));
  } catch (e) {
    return [];
  }
};

/**
 *
 * @param {import("../onboarding/onboarding.lib.js").ScanningProfile} scanningProfile
 * @returns {string}
 */
export const getStartDate = (scanningProfile) => {
  return moment()
    .subtract(parseInt(scanningProfile.timeRange), "hours")
    .format();
};

/**
 * @param {import("../onboarding/onboarding.lib.js").ScanningProfile} scanningProfile
 */
export const getFiltering = (scanningProfile) => {
  switch (scanningProfile.savedStatus) {
    case SAVED_STATUS.ALL:
      return {
        filterCandidates: false,
        filteringType: "include",
        filteringAnyOrAll: "all",
      };
    case SAVED_STATUS.SAVED_TO_ALL_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "include",
        filteringAnyOrAll: "all",
      };
    case SAVED_STATUS.SAVED_TO_ANY_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "include",
        filteringAnyOrAll: "any",
      };
    case SAVED_STATUS.NOT_SAVED_TO_ALL_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "exclude",
        filteringAnyOrAll: "all",
      };
    case SAVED_STATUS.NOT_SAVED_TO_ANY_SELECTED:
      return {
        filterCandidates: true,
        filteringType: "exclude",
        filteringAnyOrAll: "any",
      };
    default:
      throw new Error("Invalid savedStatus");
  }
};

/**
 * @param {Object} data
 * @param {boolean} data.filterCandidates
 * @param {string} data.filteringType
 * @param {string} data.filteringAnyOrAll
 * @returns {import("../common/common.lib.js").SavedStatus}
 */
export const computeSavedStatus = ({
  filterCandidates,
  filteringType,
  filteringAnyOrAll,
}) => {
  if (!filterCandidates) {
    return SAVED_STATUS.ALL;
  }
  if (filteringType === "include" && filteringAnyOrAll === "all") {
    return SAVED_STATUS.SAVED_TO_ALL_SELECTED;
  }
  if (filteringType === "include" && filteringAnyOrAll === "any") {
    return SAVED_STATUS.SAVED_TO_ANY_SELECTED;
  }
  if (filteringType === "exclude" && filteringAnyOrAll === "all") {
    return SAVED_STATUS.NOT_SAVED_TO_ALL_SELECTED;
  }
  if (filteringType === "exclude" && filteringAnyOrAll === "any") {
    return SAVED_STATUS.NOT_SAVED_TO_ANY_SELECTED;
  }
  throw new Error(
    "Invalid filterCandidates, filteringType, or filteringAnyOrAll",
  );
};

export const getDefaultValues = () => ({
  startDate: config.SCANNING_START_DATE || moment().format(),
  endDate: moment().format(),
  filterCandidates: false,
  filteringType: "include",
  filteringAnyOrAll: "all",
  selectedGroups: [],
  junkGroups: [],
  discardBehavior: "specific",
  discardGroup: null,
  pinnedAnnotations: [],
});

/**
 * @typedef {"REQUEST_OBSERVING_RUN"|"REQUEST_FOLLOW_UP"|"ADD_REDSHIFT"|"SHOW_SURVEYS"|"SAVE"|"DISCARD"|"EXIT"} ScanningToolbarAction
 */

/**
 * @type {Object<ScanningToolbarAction, ScanningToolbarAction>}
 */
export const SCANNING_TOOLBAR_ACTION = {
  REQUEST_FOLLOW_UP: "REQUEST_FOLLOW_UP",
  REQUEST_OBSERVING_RUN: "REQUEST_OBSERVING_RUN",
  ADD_REDSHIFT: "ADD_REDSHIFT",
  SHOW_SURVEYS: "SHOW_SURVEYS",
  SAVE: "SAVE",
  DISCARD: "DISCARD",
  EXIT: "EXIT",
};

/**
 * @param {string} group
 * @param {string} annotationKey
 * @returns {`${string}/${string}`}
 */
export const getAnnotationId = (group, annotationKey) =>
  `${group}/${annotationKey}`;

/**
 * @param {string} annotationId
 * @returns {{key: string, origin: string}}
 */
export const extractAnnotationOriginAndKey = (annotationId) => {
  const lastIndexOfSlash = annotationId.lastIndexOf("/");
  const origin = annotationId.slice(0, lastIndexOfSlash);
  const key = annotationId.slice(lastIndexOfSlash + 1);
  return { origin, key };
};


/**
 * @param {string|number|undefined} value
 * @param {number} length
 * @returns {string|number|undefined}
 */
export const concat = (value, length) => {
  if (typeof value === "string" && value.length > length) {
    value = value.slice(0, length) + ".."
  }
  return value;
}

/**
 * @param {string|number|Array<any>|undefined} data
 * @param {boolean} withIndentation
 * @returns {string|number|undefined}
 */
export const sanitizeAnnotationData = (data, withIndentation) => {
  if (Array.isArray(data)) {
    data = JSON.stringify(data, null, withIndentation ? 2 : 0);
  }else if (typeof data === "boolean") {
    data = data ? "true" : "false";
  }
  return data;
}