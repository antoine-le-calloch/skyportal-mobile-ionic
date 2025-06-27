import "./SpectraList.scss";
import {
  IonItem, IonList,
  IonText
} from "@ionic/react";
import { formatDateTime } from "../../../common/common.lib.js";
import { SpectraModal } from "./SpectraModal.jsx";
import { useState } from "react";
import { useSourceSpectra } from "../../sources.hooks.js";

/** @typedef {import("../../sources.lib.js").Spectra} Spectra */
/** @typedef {import("../../../scanning/scanning.lib.js").Candidate} Candidate */
/** @typedef {import("../../sources.lib.js").Source} Source */


/**
 * @param {Object} props
 * @param {string} props.sourceId - The ID of the source to fetch spectra for
 * @param {boolean} [props.isInView] - Whether the component is currently in view
 * @returns {JSX.Element | null}
 */
export const SpectraList = ({sourceId, isInView = true}) => {
  const { spectraList } = useSourceSpectra(sourceId, isInView);
  /** @type {[Spectra | null, React.Dispatch<React.SetStateAction<Spectra | null>>]} */
  // @ts-ignore
  const [openSpectra, setOpenSpectra] = useState(null);

  const handleSpectraClick = (/** @type {string} */ spectraId) => {
    if (!spectraList) return;
    setOpenSpectra(spectraList.find((/** @type {Spectra} */ spectra) => spectra.id === spectraId) || null);
  }


  return (
    <div className="spectra-list section">
      <div className="section-title section-padding">
        Spectra
      </div>
      {spectraList && spectraList.length > 0 ? (
        <IonList lines="full" color="light">
          {spectraList.map((/** @type {Spectra} */ spectra) => (
            <IonItem key={spectra.id}
                     onClick={() => handleSpectraClick(spectra.id)}
                     color="light">
              <div className="spectra">
                <div className="instrument-name">
                  {spectra.instrument_name}
                </div>
                <div className="observed-at">
                  {formatDateTime(spectra.observed_at)}
                </div>
              </div>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <div className="no-spectra">
          <IonText color="secondary">
            no spectra found...
          </IonText>
        </div>
      )}
      <SpectraModal spectra={openSpectra} setOpenSpectra={setOpenSpectra} />
    </div>
  );
};
