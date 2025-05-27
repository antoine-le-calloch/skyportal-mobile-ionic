import { formatDateTime } from "../../../common/common.lib.js";
import "./SourceListItem.scss";
import { IonIcon } from "@ionic/react";
import { starOutline, star } from "ionicons/icons";
import { useState } from "react";
import { useAddSourceToFavorites, useRemoveSourceFromFavorites } from "../../sources.hooks.js";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").Source} props.source
 * @param {boolean} props.isFavorite
 * @returns {JSX.Element}
 */
export const SourceListItem = ({ source, isFavorite }) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const useAddToFavorites = useAddSourceToFavorites();
  const useRemoveFromFavorites = useRemoveSourceFromFavorites();

  const handleToggleFavorite = () => {
    if (isFavorite) {
      useRemoveFromFavorites.mutate({ sourceId: source.id });
      setFavorite(false);
    }else{
      useAddToFavorites.mutate({ sourceId: source.id });
      setFavorite(true);
    }
  }

  return (
    <div className="source-list-item">
      <div className="header">
        <div className="ids">
          <div className="sky-id">{source.id}</div>
          <div className="tns-name">{source.tns_name}</div>
        </div>
        <IonIcon className={`icon ${favorite ? "toggle" : ""}`}
                 icon={favorite ? star : starOutline}
                 onClick={() => handleToggleFavorite()} />
      </div>
      <div className="created">
        <div className="label">Created:</div>
        <div className="value">
          {formatDateTime(source.created_at)}
        </div>
      </div>
      <div className="coords">
        <div className="ra">
          <div className="label">RA:</div>
          <div className="value">{source.ra}</div>
        </div>
        <div className="dec">
          <div className="label">DEC:</div>
          <div className="value">{source.dec}</div>
        </div>
      </div>
    </div>
  );
};
