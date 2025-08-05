import { IonContent, IonIcon, IonPage } from "@ionic/react";
import "./LoginOkScreen.scss";
import { checkmarkCircleSharp } from "ionicons/icons";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router";
import { useUserProfile } from "../../../common/common.hooks.js";
import { UserContext } from "../../../common/common.context.js";

export const LoginOkScreen = () => {
  const history = useHistory();
  const { userProfile } = useUserProfile();
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    /** @type {any} */
    const timer = setTimeout(() => {
      history.replace("/app");
    }, 2000);
    return () => clearTimeout(timer);
  }, [userProfile, userInfo]);

  return (
    <IonPage>
      <IonContent>
        <div className="content">
          <IonIcon
            className="check-icon"
            icon={checkmarkCircleSharp}
            color="success"
          />
          <div className="text">
            <p className="success-hint">Successfully connected to {userInfo?.instance?.name || "SkyPortal"}!</p>
            <p className="welcome-hint">
              Welcome {userProfile?.first_name}!
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
