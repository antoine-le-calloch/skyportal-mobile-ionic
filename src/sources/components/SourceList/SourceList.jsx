import "./SourceList.scss";
import { SourceListItem } from "../SourceListItem/SourceListItem.jsx";
import { useState } from "react";
import { useFetchFavoriteSourceIds, useFetchFavoriteSources, useFetchSources } from "../../sources.hooks.js";

/**
 * @param {Object} props
 * @param {string} props.filter - filter for the source list (all or favorites)
 * @returns {JSX.Element}
 */
export const SourceList = ({ filter }) => {
  const [page] = useState(1);
  const [numPerPage] = useState(10);
  const { favoriteSourceIds } = useFetchFavoriteSourceIds()
  const { favoriteSources } = useFetchFavoriteSources()
  const { sources } = useFetchSources({
    page,
    numPerPage,
  });

  return (
    <div className="source-list">
      {(filter === "favorites" ? favoriteSources : sources)?.map((source) => (
        <SourceListItem
          key={source.id}
          source={source}
          isFavorite={favoriteSourceIds?.includes(source.id)} />
      ))}
    </div>
  );
};
