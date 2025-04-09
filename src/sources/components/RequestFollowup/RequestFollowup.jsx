import "./RequestFollowup.scss";

import React, { useEffect, useRef, useState } from "react";

import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

import {
  useAllocationsApiClassname,
  useInstrumentForms,
  useUserAccessibleGroups
} from "../../../common/common.hooks.js";
import {
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonSelect,
  IonSelectOption, useIonToast
} from "@ionic/react";
import {
  TextWidget,
  SelectWidget,
  FieldTemplate,
  ErrorListTemplate, DateWidget
} from "../../../common/components/CustomForm/CustomForm.jsx";
import { warningOutline } from "ionicons/icons";

/**
 * @param {object} props - The component props.
 * @param {string | undefined} props.obj_id - The object ID.
 * @param {string} props.requestType - The type of request, either "triggered" or "forced_photometry".
 * @param {boolean} props.submitRequest - The flag to submit the request.
 * @param {function} props.submitRequestCallback - The callback function to handle when the request is submitted.
 */
export const RequestFollowup = ({ obj_id, requestType= "triggered", submitRequest, submitRequestCallback }) => {
  const { allocationsApiClassname } = useAllocationsApiClassname();
  const { userAccessibleGroups } = useUserAccessibleGroups();
  const { instrumentForms } = useInstrumentForms();
  const defaultAllocationId = null;

  const [selectedAllocationId, setSelectedAllocationId] =
    useState(defaultAllocationId);
  /** @type {[number[], React.Dispatch<React.SetStateAction<number[]>>]} */
  // @ts-ignore
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** @type {[import("../../../common/common.lib.js").AllocationApiClassname[], React.Dispatch<React.SetStateAction<import("../../../common/common.lib.js").AllocationApiClassname[]>>]} */
  // @ts-ignore
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [settingFilteredList, setSettingFilteredList] = useState(false);
  const formRef = useRef(null);

  let schema = null;
  let uiSchema = null;

  const [presentToast] = useIonToast();

  useEffect(() => {
    const displayError = async () => {
      await presentToast({
        message: "No allocation selected, please select one.",
        duration: 2000,
        position: "top",
        color: "danger",
        icon: warningOutline,
      });
    };

    if (submitRequest) {
      if (selectedAllocationId === null) {
        displayError().then();
      } else {
        formRef.current?.submit();
      }
    }
    submitRequestCallback();
  }, [submitRequest]);

  useEffect(() => {
    const getAllocations = async () => {
      if (!allocationsApiClassname) return;
      /** @type {Record<string, import("../../../common/common.lib.js").AllocationApiClassname>} */
      const tempAllocationLookUp = {};
      allocationsApiClassname?.forEach((allocation) => {
        tempAllocationLookUp[allocation.id] = allocation;
      });

      if (!selectedAllocationId) {
        if (allocationsApiClassname[0]?.default_share_group_ids?.length > 0) {
          setSelectedGroupIds(
            allocationsApiClassname[0]?.default_share_group_ids,
          );
        } else {
          setSelectedGroupIds([allocationsApiClassname[0]?.group_id]);
        }
      } else if (
        tempAllocationLookUp[selectedAllocationId]?.default_share_group_ids
          ?.length > 0
      ) {
        setSelectedGroupIds(
          tempAllocationLookUp[selectedAllocationId]?.default_share_group_ids,
        );
      } else {
        setSelectedGroupIds([
          tempAllocationLookUp[selectedAllocationId]?.group_id,
        ]);
      }
    };

    getAllocations();
  }, [setSelectedAllocationId, setSelectedGroupIds]);

  useEffect(() => {
    async function filterAllocations() {
      setSettingFilteredList(true);
      if (requestType === "triggered") {
        const filtered = (allocationsApiClassname || []).filter(
          (allocation) =>
            instrumentForms[allocation.instrument_id]?.formSchema !== null &&
            instrumentForms[allocation.instrument_id]?.formSchema !==
              undefined &&
            allocation.types.includes("triggered"),
        );
        setFilteredAllocations(filtered);
      } else if (requestType === "forced_photometry") {
        const filtered = (allocationsApiClassname || []).filter(
          (allocation) =>
            instrumentForms[allocation.instrument_id]
              ?.formSchemaForcedPhotometry !== null &&
            instrumentForms[allocation.instrument_id]
              ?.formSchemaForcedPhotometry !== undefined &&
            allocation.types.includes("forced_photometry"),
        );
        setFilteredAllocations(filtered);
      }
      setSettingFilteredList(false);
    }
    if (settingFilteredList === false && instrumentForms) {
      filterAllocations();
    }
  }, [allocationsApiClassname, instrumentForms, settingFilteredList]);

  if (filteredAllocations.length === 0) {
    return (
      <IonList>
        <IonItem lines="none">
          <IonLabel color="secondary">
            {`No allocations with an API class ${
              requestType === "forced_photometry"
                ? "(for forced photometry) "
                : ""
            } where found..`}
            .
          </IonLabel>
        </IonItem>
      </IonList>
    );
  }

  /** @type {Record<string, import("../../../common/common.lib.js").Group>} */
  const groupLookUp = {};
  userAccessibleGroups?.forEach((group) => {
    groupLookUp[group.id] = group;
  });

  /** @type {Record<string, import("../../../common/common.lib.js").AllocationApiClassname>} */
  const allocationLookUp = {};
  allocationsApiClassname?.forEach((allocation) => {
    allocationLookUp[allocation.id] = allocation;
  });

  const handleSelectedAllocationChange = (e) => {
    setSelectedAllocationId(e.target.value);
    if (allocationLookUp[e.target.value]?.default_share_group_ids?.length > 0) {
      setSelectedGroupIds(
        allocationLookUp[e.target.value]?.default_share_group_ids,
      );
    } else {
      setSelectedGroupIds([allocationLookUp[e.target.value]?.group_id]);
    }
  };

  /**
   * @param {object} props
   * @param {object} props.formData
   */
  const handleSubmit = async ({ formData }) => {
    setIsSubmitting(true);
    const json = {
      obj_id,
      allocation_id: selectedAllocationId,
      target_group_ids: selectedGroupIds,
      payload: formData,
    };
    setIsSubmitting(false);
  };

  /**
   * @param {{start_date: string, end_date: string}} formData
   * @param {{start_date: {addError: function}, end_date: {addError: function}}} errors
   */
  const validate = (formData, errors) => {
    if (formData?.start_date && formData?.end_date) {
      if (formData.start_date > formData.end_date) {
        errors.start_date.addError("Start Date must come before End Date");
      }
    }

    return errors;
  };

  if (selectedAllocationId) {
    schema =
      requestType === "forced_photometry"
        ? instrumentForms[allocationLookUp[selectedAllocationId].instrument_id]
            .formSchemaForcedPhotometry
        : instrumentForms[allocationLookUp[selectedAllocationId].instrument_id]
            .formSchema;
    uiSchema =
      instrumentForms[allocationLookUp[selectedAllocationId].instrument_id]
        .uiSchema;

    if (!schema) {
      return (
        <IonList>
          <IonItem lines="none">
            <IonLabel color="secondary">
              {`No schema found for the selected allocation...`}
            </IonLabel>
          </IonItem>
        </IonList>
      );
    } else {
      if (requestType === "forced_photometry") {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (schema.properties.start_date) {
          schema.properties.start_date.default = startDate
            .toISOString()
            .replace("Z", "")
            .replace("T", " ")
            .split(".")[0];
        }
        if (schema.properties.end_date) {
          schema.properties.end_date.default = endDate
            .toISOString()
            .replace("Z", "")
            .replace("T", " ")
            .split(".")[0];
        }
      } else {
        const { start_date, end_date } = schema.properties;
        if (start_date) {
          const newStartDate =
            start_date.format === "date"
              ? new Date().toISOString().split("T")[0]
              : new Date().toISOString();
          schema.properties.start_date.default = newStartDate
            .replace("Z", "")
            .replace("T", " ")
            .split(".")[0];

          if (end_date) {
            const range = new Date(end_date.default).getTime() - new Date(start_date.default).getTime();
            const newEndDate =
              end_date.format === "date"
                ? new Date(new Date().getTime() + range)
                    .toISOString()
                    .split("T")[0]
                : new Date(new Date().getTime() + range).toISOString();
            schema.properties.end_date.default = newEndDate
              .replace("Z", "")
              .replace("T", " ")
              .split(".")[0];
          }
        }
      }
    }
  }

  return (
    <div className="request-followup">
      <IonList>
        <IonItem color="light">
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
            value={selectedAllocationId}
            onIonChange={handleSelectedAllocationChange}
          >
            {filteredAllocations?.map((allocation) => (
              <IonSelectOption
                value={allocation.id}
                key={allocation.id}
                className="allocation-option"
              >
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
        <IonItem color="light">
          <IonSelect
            label="Share Data With"
            multiple
            labelPlacement="stacked"
            interface="popover"
            value={selectedGroupIds}
            onChange={(e) => setSelectedGroupIds(e)}
          >
            {userAccessibleGroups?.map((group) => (
              <IonSelectOption value={group.id} key={group.id}>
                {group.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </IonList>
      {selectedAllocationId && (
        <Form
          schema={schema || {}}
          validator={validator}
          uiSchema={uiSchema || {}}
          customValidate={validate}
          onSubmit={handleSubmit}
          disabled={isSubmitting}
          className="form"
          widgets={{
            SelectWidget: SelectWidget,
            TextWidget: TextWidget,
            DateWidget: DateWidget,
          }}
          templates={{
            FieldTemplate: FieldTemplate,
            ErrorListTemplate: ErrorListTemplate,
          }}
          ref={formRef}
        />
      )}
      <IonLoading isOpen={isSubmitting} message={"Submitting..."} />
    </div>
  );
};