import { IonContent, IonHeader, IonModal, IonSearchbar } from "@ionic/react";
import { Annotations } from "../Annotations/Annotations.jsx";

/**
 * @param {Object} props
 * @param {import("../../../scanning/scanning.lib.js").Candidate | import("../../sources.lib.js").Source} props.source
 * @param {React.RefObject<HTMLIonModalElement>} props.modal
 * @returns {JSX.Element}
 */
export const AnnotationsViewerModal = ({ source, modal }) => {
  return (
    <IonModal
      ref={modal}
      isOpen={false}
      initialBreakpoint={0.75}
      breakpoints={[0, 0.25, 0.5, 0.75]}
    >
      <IonHeader>
        <IonSearchbar />
      </IonHeader>
      <IonContent>
        <Annotations source={source} />
      </IonContent>
    </IonModal>
  );
};
