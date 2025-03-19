import "./PinnedAnnotations.scss";
import { IonButton, IonIcon, IonItem, IonText } from "@ionic/react";
import {
  extractAnnotationOriginAndKey,
  getAnnotationId,
  useCopyAnnotationLineOnClick,
  sanitizeAnnotationData,
  concat,
} from "../../../scanning.lib.js";
import { copyOutline } from "ionicons/icons";
import { useEffect, useState } from "react";

/**
 * @param {Object} props
 * @param {import("../../../scanning.lib.js").Candidate} props.candidate
 * @param {() => void} props.onButtonClick
 * @param {string[]} [props.pinnedAnnotationIds]
 * @returns {JSX.Element}
 */
export const PinnedAnnotations = ({
  candidate,
  onButtonClick,
  pinnedAnnotationIds = [],
}) => {
  const handleTextCopied = useCopyAnnotationLineOnClick();
  const [pinnedAnnotations, setPinnedAnnotations] = useState(
    pinnedAnnotationIds
      .map((id) => {
        const { key, origin } = extractAnnotationOriginAndKey(id);
        return {
          id: key,
          value: candidate.annotations.find(
            (annotation) => annotation.origin === origin,
          )?.data[key],
        };
      })
      .filter((annotationItem) => annotationItem.value),
  );

  useEffect(() => {
    setPinnedAnnotations((prev) => {
      if (prev.length >= 3) return prev;

      /** @type {{id: string, value: string|number|Array<any>}[]} */
      const otherAnnotationIds = [];
      for (const annotation of candidate.annotations) {
        for (const [key, value] of Object.entries(annotation.data)) {
          const annotationId = getAnnotationId(annotation.origin, key);
          if (
            value &&
            !otherAnnotationIds.some((item) => item.id === annotationId) &&
            !prev.some((item) => item.id === annotationId)
          ) {
            otherAnnotationIds.push({ id: key, value });
            if (otherAnnotationIds.length === 3 - prev.length) {
              return [...prev, ...otherAnnotationIds];
            }
          }
        }
      }
      return prev;
    });
  }, [candidate.annotations]);

  return (
    <div className="pinned-annotations">
      <div className="annotations">
        {pinnedAnnotations.map((annotationLine) => (
          <IonItem
            key={annotationLine.id}
            className="annotation-line"
            lines="none"
            onClick={() =>
              handleTextCopied(annotationLine.id, sanitizeAnnotationData(annotationLine.value))
            }
            detail={false}
            button
          >
            <IonText className="name" color="secondary">
              {annotationLine.id}:
            </IonText>
            {"\u00A0"}
            {annotationLine.value ? (
              <div className="annotation-line-content">
                <span className="annotation-value">
                  {concat(sanitizeAnnotationData(annotationLine.value), 20)}
                </span>
                <IonIcon icon={copyOutline} size="small" color="secondary" />
              </div>
            ) : (
              <>
                <IonText color="warning" className="no-value">
                  No value
                </IonText>
              </>
            )}
          </IonItem>
        ))}
      </div>
      <div className="button-container">
        <IonButton
          onClick={onButtonClick}
          color="secondary"
          expand="block"
          size="small"
          fill="clear"
        >
          Show all
        </IonButton>
      </div>
    </div>
  );
};
