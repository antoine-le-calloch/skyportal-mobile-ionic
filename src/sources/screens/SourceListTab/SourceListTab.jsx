import {
  IonContent,
  IonFooter,
  IonHeader,
  IonLabel,
  IonLoading,
  IonPage,
  IonSearchbar,
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
  /** @type {import("react").useState<string | null | undefined>} */
  // @ts-ignore
  const [searchName, setSearchName] = useState("");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sources</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            debounce={500}
            value={searchName}
            onIonInput={(e) => setSearchName(e.detail.value)}
            placeholder="Search by name"
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Suspense fallback={<IonLoading isOpen={true} />}>
          <SourceList filter={segment} searchName={searchName} />
        </Suspense>
      </IonContent>
      <IonFooter>
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
      </IonFooter>
    </IonPage>
  );
};
