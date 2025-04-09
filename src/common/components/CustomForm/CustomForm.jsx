import "./CustomForm.scss"
import {
  IonDatetime,
  IonDatetimeButton,
  IonInput,
  IonItem,
  IonLabel, IonModal,
  IonNote,
  IonSelect,
  IonSelectOption
} from "@ionic/react";
import React from "react";


export const SelectWidget = ({id, options, value, required, disabled, readonly, label, onChange}) => {
  const { enumOptions } = options;

  return (
    <IonSelect
      id={id}
      label={label}
      labelPlacement="stacked"
      value={value}
      onIonChange={(e) => onChange(e.detail.value)}
      disabled={disabled || readonly}
      interface="popover"
    >
      {enumOptions.map((opt) => (
        <IonSelectOption key={opt.value} value={opt.value}>
          {opt.label}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};


export const TextWidget = ({ value, onChange, schema, id, label }) => {
  return (
    <IonInput
      label={label}
      labelPlacement="stacked"
      id={id}
      value={value || ''}
      onIonChange={(e) => onChange(e.detail.value)}
      placeholder={schema?.title || ''}
    />
  );
};


export const DateWidget = ({ value, onChange, schema, id, label }) => {
  return (
    <div className="ion-padding-vertical">
      <IonLabel position="stacked">{label}</IonLabel>
      <IonDatetimeButton
        datetime={id + "-datetime"}
      />
      <IonModal keepContentsMounted={true}>
        <IonDatetime
          id={id + "-datetime"}
          value={value || ""}
          onIonChange={(e) => onChange(e.detail.value)}
          presentation="date"
        />
      </IonModal>
    </div>
  );
};

export const FieldTemplate = ({ id, classNames, label, required, description, errors, children }) => {
  const isArray = classNames.includes("field-array");
  return id === "root" ? (
    <div className={classNames} id={id}>
      {children}
    </div>
  ) : (
      <IonItem className={classNames} id={id} color="light">
        {isArray && <IonLabel className="ion-margin-top" position="stacked">{label}</IonLabel>}
        {children}
        {errors && <IonNote color="danger">{errors}</IonNote>}
      </IonItem>
  );
};

export const ErrorListTemplate = (props) => {
  return null
}