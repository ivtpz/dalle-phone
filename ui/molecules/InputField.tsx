import React from 'react';

interface InputFieldProps {
  fieldName: string;
  label: string;
  defaultValue?: string | number;
}

export default function InputField({
  fieldName,
  label,
  defaultValue,
}: InputFieldProps) {
  return (
    <div className="input-wrp">
      <input
        className="input-txt"
        type="text"
        name={fieldName}
        id={fieldName}
        defaultValue={defaultValue}
        placeholder=""
        required
      />
      <label className="input-txt-lbl" htmlFor={fieldName}>
        {label}
      </label>
    </div>
  );
}
