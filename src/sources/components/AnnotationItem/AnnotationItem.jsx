import "./AnnotationItem.scss";
import { IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonText } from "@ionic/react";
import { sanitizeAnnotationData, useCopyAnnotationLineOnClick } from "../../sources.lib.js";
import { copyOutline } from "ionicons/icons";

/**
 * @param {Object} props
 * @param {import("../../sources.lib.js").Annotation} props.annotation
 * @returns {JSX.Element}
 */
export const AnnotationItem = ({ annotation }) => {
  const handleTextCopied = useCopyAnnotationLineOnClick();

  return (
    <div className="annotation-item">
      <IonList lines="full">
        <IonListHeader>
          <h6>
            <IonLabel>{annotation.origin}</IonLabel>
          </h6>
        </IonListHeader>
        {Object.entries(annotation.data)
          .map(([key, value]) => (
            <IonItem
              key={key}
              onClick={() => handleTextCopied(key, sanitizeAnnotationData(value, true))}
              detail={false}
              button
            >
              <IonText color="secondary">{key}:</IonText>
              {"\u00A0"}
              <IonText>{sanitizeAnnotationData(value,false)}</IonText>
              {"\u00A0"}
              {"\u00A0"}
              {"\u00A0"}
              <IonIcon icon={copyOutline} size="small" color="secondary" />
            </IonItem>
          ))}
      </IonList>
    </div>
  );
};
