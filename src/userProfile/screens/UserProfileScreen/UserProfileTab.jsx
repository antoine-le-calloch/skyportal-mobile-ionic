import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading, IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonAlert
} from "@ionic/react";
import "./UserProfileTab.scss";
import { useUserProfile } from "../../../common/common.hooks.js";
import React, { useContext } from "react";
import { AppContext, UserContext } from "../../../common/common.context.js";
import { logOutOutline, personCircle, swapHorizontal } from "ionicons/icons";
import { useMutation } from "@tanstack/react-query";
import {
  clearPreference,
  QUERY_KEYS,
  setDarkModeInDocument,
  setPreference,
} from "../../../common/common.lib.js";

export const UserProfileTab = () => {
  const { darkMode, updateDarkMode } = useContext(AppContext);
  const { userInfo, updateUserInfo } = useContext(UserContext);
  const [presentAlert] = useIonAlert();
  const { userProfile } = useUserProfile();

  const darkModeMutation = useMutation({
    mutationFn:
      /**
       * @param {Object} params
       * @param {"auto"|"light"|"dark"} params.newDarkMode
       * @returns {Promise<*>}
       */
      async ({ newDarkMode }) => {
        await setPreference(QUERY_KEYS.APP_PREFERENCES, {
          darkMode: newDarkMode,
        });
        return newDarkMode;
      },
    onSuccess: (newDarkMode) => {
      setDarkModeInDocument(newDarkMode);
      updateDarkMode(newDarkMode);
    },
  });

  const onDarkModeChange = (/** @type {any} */ e) => {
    darkModeMutation.mutate({ newDarkMode: e.target.value });
  };

  // use the hash of the username (which is in the gravatarUrl) to
  // select a unique color for this user
  const bgColor = () => {
    if (userProfile && userProfile.gravatar_url) {
      const splitUrl = userProfile.gravatar_url.split("/");
      const hash = splitUrl[splitUrl.length - 1];
      if (hash.length >= 6) {
        return `#${hash.slice(0, 6)}aa`;
      }
    }
    return "#aaaaaaaa";
  };

  const handleDisconnect = async () => {
    await presentAlert({
      header: "Disconnect?",
      message: "Do you want to disconnect from this instance?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: async () => {
            await clearPreference(QUERY_KEYS.USER_INFO);
            updateUserInfo({ token: "", instance: { url: "", name: "" } });
          },
        },
      ],
    });
  };

  const avatarSize = "90";
  return (
    <IonPage className="profile-tab">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {userProfile ? (
          <div className="profile-container">
            <div>
              <div className="profile-top">
                <IonAvatar
                  slot="start"
                  style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
                >
                  <img
                    alt={`${userProfile.first_name} ${userProfile.last_name}`}
                    src={`${userProfile.gravatar_url}&s=${avatarSize}`}
                  />
                  <IonIcon
                    icon={personCircle}
                    className="placeholder-avatar"
                    style={{ color: bgColor(), fontSize: `${avatarSize}px` }}
                  />
                </IonAvatar>
                <IonItem className="profile-name">
                  <IonLabel>
                    <h1>
                      {`${userProfile.first_name} ${userProfile.last_name}`}
                    </h1>
                  </IonLabel>
                </IonItem>
              </div>
              <IonList inset>
                <IonItem color="light">
                  <IonLabel>Instance</IonLabel>
                  <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => handleDisconnect()}
                    className="ion-text-capitalize"
                    style={{ fontSize: "17px" }}
                  >
                    {userInfo.instance.name}
                    <IonIcon slot="end" icon={swapHorizontal} />
                  </IonButton>
                </IonItem>
                <IonItem color="light">
                  <IonSelect
                    label="Dark Mode"
                    value={darkMode}
                    interface="popover"
                    onIonChange={onDarkModeChange}
                  >
                    <IonSelectOption value="auto">Auto</IonSelectOption>
                    <IonSelectOption value="light">Light</IonSelectOption>
                    <IonSelectOption value="dark">Dark</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonList>
            </div>
            <IonButton color="danger" onClick={handleDisconnect} className="disconnect-button">
              <IonIcon icon={logOutOutline} slot="start" />
              Disconnect
            </IonButton>
          </div>
        ) : <IonLoading isOpen />}
      </IonContent>
    </IonPage>
  );
};
