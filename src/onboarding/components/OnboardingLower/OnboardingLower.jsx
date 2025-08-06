import {
  IonButton, IonButtons, IonContent,
  IonHeader,
  IonIcon,
  IonInput, IonItem, IonLabel, IonList,
  IonModal, IonSegment, IonSegmentButton,
  IonSelect,
  IonSelectOption, IonTitle,
  IonToolbar, useIonToast
} from "@ionic/react";
import "./OnboardingLower.scss";
import { useCallback, useContext, useState } from "react";
import { checkmarkCircleOutline, qrCode } from "ionicons/icons";
import { CapacitorBarcodeScanner } from "@capacitor/barcode-scanner";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useHistory } from "react-router";
import {
  INSTANCES,
} from "../../../common/common.lib.js";
import {
  login,
  getAllInstances,
  removeInstanceFromLocalStorage,
  saveInstanceToLocalStorage,
} from "../../onboarding.lib.js";
import { UserContext } from "../../../common/common.context.js";
import { useErrorToast } from "../../../common/common.hooks.js";

/** @typedef {import("../../../common/common.lib").SkyPortalInstance} SkyPortalInstance */

/**
 * Check if the instance is one of the default instances
 * @param {SkyPortalInstance} instance
 * @returns {boolean}
 */
const isDefaultInstance = (instance) => {
  return INSTANCES.some((defaultInstance) => defaultInstance.name === instance.name && defaultInstance.url === instance.url);
};

/**
 * The lower part of the onboarding screen
 * @param {Object} props
 * @param {import("../../onboarding.lib.js").OnboardingPage} props.page - The current page of the onboarding screen
 * @param {Function} props.setPage - The function to set the current page of the onboarding screen
 * @returns {JSX.Element}
 */
const OnboardingLower = ({ page, setPage }) => {
  const { updateUserInfo } = useContext(UserContext);
  const errorToast = useErrorToast();
  const [presentToast] = useIonToast();
  const history = useHistory();
  const [typedToken, setTypedToken] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [segment, setSegment] = useState("add");
  const [instances, setInstances] = useState(getAllInstances());
  /** @type {[SkyPortalInstance | null, React.Dispatch<SkyPortalInstance | null>]} */
  const [selectedInstance, setSelectedInstance] = useState(/** @type {SkyPortalInstance | null} */ (null));
  const [newInstance, setNewInstance] = useState({ name: "", url: "" });

  /**
   * Log the user into the selected instance with the provided token
   * @param {string} token - The token to use for login
   */
  const loginToTheSelectedInstance = async (token) => {
    if (!selectedInstance){
      setPage("login");
      return;
    }
    try {
      await login(selectedInstance, token, history, updateUserInfo);
    } catch (/** @type {any} */ error) {
      errorToast(error?.message || "Error trying to log in to the instance");
    }
  }

  const handleScanQRCode = async () => {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: Html5QrcodeSupportedFormats.QR_CODE,
      });
      await loginToTheSelectedInstance(result.ScanResult);
    } catch (/** @type {any} */ error) {
      errorToast(error?.message || "Error scanning QR code. Please try again.");
    }
  };

  const handleTypeTokenSubmit = useCallback(() =>
      loginToTheSelectedInstance(typedToken), [typedToken, selectedInstance]);

  /**
   * Handle the selection of an instance
   * @param {CustomEvent} e - The event
   */
  const handleSelectInstance = (e) => {
    if (e.detail.value === "__add__") {
      setShowModal(true);
      setSelectedInstance(null);
    } else {
      setSelectedInstance(e.detail.value);
    }
  }

  const handleAddInstance = () => {
    const { name, url } = newInstance;
    if (!name || !url || instances.some((i) => i.name === name)) {
      errorToast("Please fill in both fields with a unique instance name.");
      return;
    }
    // Remove trailing slashes from the URL
    const cleanUrl = url.replace(/\/+$/, "");
    const instance = { name, url: cleanUrl };
    setSelectedInstance(instance);
    setInstances((prev) => [...prev, instance]);
    saveInstanceToLocalStorage(instance);
    setNewInstance({ name: "", url: "" });
    presentToast({
      message: `Instance "${name}" added successfully!`,
      duration: 3000,
      position: "top",
      color: "success",
      icon: checkmarkCircleOutline
    })
    setShowModal(false);
  };

  /**
   * Handle the deletion of an instance
   * @param {SkyPortalInstance} instance - The instance to delete
   */
  const handleDeleteInstance = (instance) => {
    setInstances((prev) => prev.filter((i) => i.name !== instance.name));
    removeInstanceFromLocalStorage(instance.name);
    if (selectedInstance?.name === instance.name) setSelectedInstance(null);
  }

  switch (page) {
    case "welcome":
      return (
        <div className="lower">
          <IonButton
            shape="round"
            size="large"
            onClick={() => setPage("login")}
            strong
          >
            Log in
          </IonButton>
        </div>
      );
    case "login":
      return (
        <div className="lower">
          <div className="instance-container">
            <IonSelect
              class="select"
              label="Instance"
              placeholder="Select an instance"
              interface="action-sheet"
              value={selectedInstance}
              onIonChange={(e) => handleSelectInstance(e)}
            >
              {instances.map((/** @type {SkyPortalInstance} */ option) => (
                <IonSelectOption key={option.name} value={option}>
                  {option.name}
                </IonSelectOption>
              ))}
              <IonSelectOption value="__add__">
                ➕ Manage instances...
              </IonSelectOption>
            </IonSelect>
          </div>
          <div className="login-methods">
            {selectedInstance?.token && (
              <IonButton
                onClick={() => loginToTheSelectedInstance(selectedInstance.token || "")}
                shape="round"
                strong
              >
                Reconnect
              </IonButton>
            )}
            <IonButton
              onClick={handleScanQRCode}
              shape="round"
              disabled={!selectedInstance}
              fill={selectedInstance?.token ? "outline" : "solid"}
              strong
            >
              <IonIcon slot="start" icon={qrCode}/>
              Scan QR code
            </IonButton>
            <IonButton
              onClick={() => setPage("type_token")}
              shape="round"
              disabled={!selectedInstance}
              fill="outline"
              strong
            >
              Log in with token
            </IonButton>
          </div>
          <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}
                    initialBreakpoint={0.5} breakpoints={[0, 0.5, 1]}>
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="secondary">
                  <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
                </IonButtons>
                <IonTitle>Manage Instances</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonSegment
                value={segment}
                onIonChange={(e) => setSegment(/** @type { "add" | "delete" } */ (e.detail.value))}
              >
                <IonSegmentButton value="add">
                  <IonLabel>Add</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="delete">
                  <IonLabel>Delete</IonLabel>
                </IonSegmentButton>
              </IonSegment>
              <IonList>
                {segment === "delete" ? instances.filter((instance) => !isDefaultInstance(instance))
                  .map((instance) => (
                  <IonItem key={instance.name}>
                    <IonLabel>
                      <h2>{instance.name}</h2>
                      <p>{instance.url}</p>
                    </IonLabel>
                    <IonButton fill="clear" color="danger" slot="end" onClick={() => handleDeleteInstance(instance)}>
                      Delete
                    </IonButton>
                  </IonItem>
                )) : (
                  <>
                    <IonItem>
                      <IonInput
                        label="Instance Name"
                        placeholder="Enter instance name"
                        value={newInstance.name}
                        // @ts-ignore
                        onIonInput={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                      />
                    </IonItem>
                    <IonItem>
                      <IonInput
                        label="Instance URL"
                        placeholder="Enter instance URL"
                        value={newInstance.url}
                        // @ts-ignore
                        onIonInput={(e) => setNewInstance({ ...newInstance, url: e.target.value })}
                      />
                    </IonItem>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                      <IonButton onClick={handleAddInstance} size="small" disabled={!newInstance?.name || !newInstance?.url}>
                        Add Instance
                      </IonButton>
                    </div>
                  </>
                )}
              </IonList>
            </IonContent>
          </IonModal>
        </div>
      );
    case "type_token":
      if (!selectedInstance) {
        setPage("login");
      }
      return (
        <div className="lower">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IonLabel style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>
              {selectedInstance?.name}
            </IonLabel>
            <IonLabel style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--ion-color-medium)' }}>
              {selectedInstance?.url}
            </IonLabel>
          </div>
          <IonInput
            fill="solid"
            label="Token"
            labelPlacement="stacked"
            placeholder="Enter your token"
            // @ts-ignore
            onInput={(e) => setTypedToken(e.target.value)}
            value={typedToken}
          />
          <IonButton
            onClick={handleTypeTokenSubmit}
            shape="round"
            strong
            disabled={!typedToken}
          >
            Log in
          </IonButton>
        </div>
      );
  }
};

export default OnboardingLower;
