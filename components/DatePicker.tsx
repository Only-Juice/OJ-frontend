import React, { useRef } from "react";
import {
  toSystemDateFormat,
  toDatetimeLocalString,
} from "@/utils/datetimeUtils";


interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      {/* 隱藏但可觸發原生選擇器的 input 疊在上面 */}
      <input
        ref={hiddenInputRef}
        type="datetime-local"
        value={
          value && !isNaN(new Date(value).getTime())
            ? toDatetimeLocalString(value)
            : ""
        }
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0"
        tabIndex={-1}
      />
      {/* 顯示格式化後的時間 */}
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder={placeholder}
        value={
          value && !isNaN(new Date(value).getTime())
            ? toSystemDateFormat(new Date(value))
            : ""
        }
        readOnly
        onClick={() => hiddenInputRef.current?.showPicker()}
      />
    </div>
  );
};

export default DateTimePicker;
