import "./Source.scss";
import {
  IonBackButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonPage, IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useParams } from "react-router";
import { useFetchSource } from "../../sources.hooks.js";
import React, { useEffect, useRef, useState } from "react";
import { THUMBNAIL_TYPES } from "../../sources.lib.js";
import { Thumbnail } from "../../components/Thumbnail/Thumbnail.jsx";
import {
  PinnedAnnotations
} from "../../components/PinnedAnnotations/PinnedAnnotations.jsx";
import {
  PhotometryChart
} from "../../components/PhotometryChart/PhotometryChart.jsx";
import {
  SourceInfo
} from "../../components/SourceInfo/SourceInfo.jsx";
import { Comments } from "../../components/Comments/Comments.jsx";
import { SpectraList } from "../../components/Spectra/SpectraList.jsx";
import { FollowupRequests } from "../../components/FollowupRequests/FollowupRequests.jsx";
import {
  AnnotationsViewerModal
} from "../../components/PinnedAnnotations/AnnotationsViewerModal.jsx";
import { GroupsModal } from "../../components/GroupsModal/GroupsModal.jsx";
import { SourceSkeleton } from "./SourceSkeleton.jsx";

/**
 * @typedef {Object} RouteParams
 * @property {string} sourceId
 * @returns {JSX.Element}
 */
export function Source() {
  /** @type {RouteParams} */
  const { sourceId } = useParams();
  const { source } = useFetchSource({ sourceId });
  const [loading, setLoading] = useState(true);
  /** @type {React.MutableRefObject<any>} */
  const annotationsModal = useRef(null);
  /** @type {React.MutableRefObject<any>} */
  const groupsModal = useRef(null);

  useEffect(() => {
    if (source !== undefined) {
      setLoading(false);
    }
  }, [source]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Source details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {source ? (
          <div className="source-page">
            <div className="source">
              <div className="header">
                <h1>{source.id}</h1>
                <IonChip
                  className="source-groups-chip"
                  color="primary"
                  onClick={() => {groupsModal.current?.present();}}
                >
                  Saved to {source.groups.length} groups
                </IonChip>
              </div>
              <div className="thumbnails-container">
                {source.thumbnails?.length > 0 ? Object.keys(THUMBNAIL_TYPES).map((type) => (
                  <Thumbnail key={type} source={source} type={type} />
                )) : (
                  <div className="">
                    <IonText color="secondary">
                      no thumbnails found...
                    </IonText>
                  </div>
                )}
              </div>
              <PinnedAnnotations
                source={source}
                onButtonClick={() => annotationsModal.current?.present()}
              />
              <div className="plot-container">
                <PhotometryChart
                  sourceId={source.id}
                />
              </div>
              <SourceInfo source={source} />
              <Comments comments={source.comments} />
              <SpectraList sourceId={source.id} />
              <FollowupRequests source={source} requestType={"triggered"} />
              <FollowupRequests source={source} requestType={"forced_photometry"}/>
            </div>
            {/* Modals */}
            <GroupsModal groups={source.groups} title={`Saved to ${source.groups.length} groups`} modal={groupsModal} />
            <AnnotationsViewerModal source={source} modal={annotationsModal}/>
          </div>
          ) :
          <div className="source-page">
            <SourceSkeleton animated={true} visible={loading} />
          </div>
        }
      </IonContent>
    </IonPage>
  );
}
