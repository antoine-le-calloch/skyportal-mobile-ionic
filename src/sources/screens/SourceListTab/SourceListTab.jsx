import {
  IonContent,
  IonHeader,
  IonLabel,
  IonLoading,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { Suspense, useState } from "react";
import { SourceList } from "../../components/SourceList/SourceList.jsx";

export const SourceListTab = () => {
  /** @type {import("react").useState<"all" | "favorites">} */
  // @ts-ignore
  const [segment, setSegment] = useState("all");

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sources</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonSegment
        value={segment}
        onIonChange={(e) => setSegment(e.detail.value)}
      >
        <IonSegmentButton value="all">
          <IonLabel>All</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="favorites">
          <IonLabel>Favorites</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      <IonContent>
        <Suspense fallback={<IonLoading isOpen={true} />}>
          <SourceList filter={segment} />
        </Suspense>
      </IonContent>
    </>
  );
};
