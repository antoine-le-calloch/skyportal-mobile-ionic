import "./SourceInfo.scss";
import { IonButton, IonChip, IonItem, IonLabel, IonList, IonText } from "@ionic/react";

/**
 * @param {Object} props
 * @param {import("../../../scanning/scanning.lib.js").Candidate | import("../../sources.lib.js").Source} props.source
 * @returns {JSX.Element | null}
 */
export const SourceInfo = ({source}) => {
  const mostRecentHumanClassification =
    source.classifications?.filter((c) => (c?.ml === false || c?.ml === null) && c.probability > 0)
      ?.sort((a, b) => b.modified.localeCompare(a.modified))[0]?.classification || null;

  return (
    <div className="section source-info">
      <div className="section-title section-padding">
        Source Info
      </div>
      <IonList>
        <IonItem color="light">
          <IonLabel className="classification">
            Latest classification:
          </IonLabel>
          {mostRecentHumanClassification ? (
            <IonChip>{mostRecentHumanClassification}</IonChip>
          ) : (<IonText>...</IonText>)}
        </IonItem>
        <IonItem color="light" lines="none">
          <IonLabel className="name">
            TNS Name:
          </IonLabel>
          { source.tns_name ? (
            <IonButton
              fill="outline"
              color="secondary"
              href={`https://www.wis-tns.org/object/${source.tns_name.split(" ").pop()}`}
              target="_blank"
              className="tns-name"
              >
              {source.tns_name}
            </IonButton>
          ) : (<IonText>...</IonText>)}
        </IonItem>
      </IonList>
    </div>
  );
};
