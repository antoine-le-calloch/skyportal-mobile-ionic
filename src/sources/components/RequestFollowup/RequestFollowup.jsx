import "./RequestFollowup.scss";
import {
  useAllocationsApiClassname,
  useInstrumentForms,
  useUserAccessibleGroups
} from "../../../common/common.hooks.js";
import { IonItem, IonList, IonSelect, IonSelectOption } from "@ionic/react";
import {useState} from "react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";

/**
 * Component for requesting follow-up from a candidate.
 * @param {Object} props
 * @param {import("../../../scanning/scanning.lib.js").Candidate | undefined} props.candidate - The candidate object.
 * @param {React.MutableRefObject<import("@ionic/react").IonModal<any> | undefined>} props.modal
 * @returns {JSX.Element}
 */
export const RequestFollowup = ({candidate, modal}) => {
  const { allocationsApiClassname } = useAllocationsApiClassname()
  const { instrumentForms } = useInstrumentForms();
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const [ selectedAllocation, setSelectedAllocation ] = useState(null);

  const handleSubmit = async (formData) => {

  }

  return (
    <IonList className="request-followup">
      <IonItem>
        <IonSelect
          label="Allocation"
          labelPlacement="stacked"
          placeholder="Select allocation"
          interface="modal"
          interfaceOptions={{
            initialBreakpoint: 0.75,
            breakpoints: [0, 0.25, 0.5, 0.75, 1],
            expandToScroll: false,
          }}
          value={selectedAllocation}
          onIonChange={(e) => setSelectedAllocation(e.detail.value)}
        >
          {allocationsApiClassname?.map((allocation) => (
            <IonSelectOption value={allocation} key={allocation.id} className="allocation-option">
              {allocation.instrument?.telescope?.name + " / \n"}
              {allocation.instrument?.name} -{" "}
              {
                userAccessibleGroups?.find(
                  (group) => group.id === allocation.group_id,
                )?.name
              }{" "}
              (PI {allocation.pi})
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      {selectedAllocation && (
        <IonItem>
          {instrumentForms[selectedAllocation?.instrument?.id]?.formSchema && (
            <Form
              schema={
                instrumentForms[selectedAllocation.instrument.id].formSchema
              }
              onSubmit={({ formData }) =>
                handleSubmit(formData)
              }
              validator={validator}
            />
          )}
        </IonItem>
      )}
    </IonList>
  );
};
