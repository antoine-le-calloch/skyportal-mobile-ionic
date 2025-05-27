import "./Source.scss";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useParams } from "react-router";
// import { useFetchSource } from "../../sources.hooks.js";
import React from "react";

/**
 * @typedef {Object} RouteParams
 * @property {string} sourceId
 * @returns {JSX.Element}
 */
export function Source() {
  /** @type {RouteParams} */
  const { sourceId } = useParams();
  // const { source } = useFetchSource({ sourceId });

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
        <div className="source-details">
          <h2>Source ID: {sourceId}</h2>
        </div>
      </IonContent>
    </IonPage>
  );
}
