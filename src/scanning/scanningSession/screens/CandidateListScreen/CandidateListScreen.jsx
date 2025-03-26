import "./CandidateListScreen.scss";
import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import { CandidateList } from "../../components/CandidateList/CandidateList.jsx";
import React, { Suspense } from "react";

export const CandidateListScreen = () => {
  return (
    <IonPage className="candidate-list-screen">
      <IonContent forceOverscroll={false} className="content">
        <Suspense
          fallback={
            <div
              className="candidate-list-loading"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <IonSpinner />
            </div>
          }
        >
          <CandidateList />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
