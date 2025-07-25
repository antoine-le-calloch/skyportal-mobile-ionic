import "./ScanningOptionsScreen.scss";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner
} from "@ionic/react";
import { ScanningOptionsForm } from "../../components/ScanningOptionsForm/ScanningOptionsForm.jsx";
import React, { Suspense } from "react";

export const ScanningOptionsScreen = () => {
  return (
    <IonPage className="scanning-options-screen">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Scanning options</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent force-overscroll="false">
        <Suspense fallback={<div className="suspense-spinner"><IonSpinner /></div>}>
          <div className="scanning-options-container">
            <ScanningOptionsForm />
          </div>
        </Suspense>
      </IonContent>
    </IonPage>
  );
};
