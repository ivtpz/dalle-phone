import React, { useState } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

interface InputFieldProps {
  fieldName: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  error?: false | string;
}

export default function InputField({
  fieldName,
  label,
  defaultValue,
  type = 'text',
  error,
}: InputFieldProps) {
  const [fieldType, setFieldType] = useState(type);
  return (
    <div className="my-4">
      <div className={error ? 'input-wrp input-err' : 'input-wrp'}>
        <input
          className="input-txt"
          type={fieldType}
          name={fieldName}
          id={fieldName}
          defaultValue={defaultValue}
          placeholder=""
          required
        />
        <label className="input-txt-lbl" htmlFor={fieldName}>
          {label}
        </label>
        {type === 'password' && (
          <div className="cursor-pointer">
            {fieldType === 'password' ? (
              <HiEye onClick={() => setFieldType('text')} />
            ) : (
              <HiEyeSlash onClick={() => setFieldType('password')} />
            )}
          </div>
        )}
      </div>
      {!!error && (
        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
