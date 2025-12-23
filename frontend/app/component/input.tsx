import { ChangeEvent } from "react";

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required = true,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        className="
          w-full
          px-2 py-1
          rounded-xl
          border border-gray-300
          text-gray-800
          focus:outline-none
          focus:ring-2
          focus:ring-teal-500
          focus:border-transparent
          transition
        "
      />
    </div>
  );
}
