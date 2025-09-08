import React from 'react';

type BaseProps = {
  children?: React.ReactNode;
};

type SelectRootProps = BaseProps & {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select: React.FC<SelectRootProps> = ({
  children,
  value,
  onValueChange,
  className,
  ...rest
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange?.(e.target.value)}
    className={['border rounded p-2', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </select>
);

/** no-op wrappers เพื่อให้ API เหมือนเดิม */
type WrapperProps = BaseProps & { className?: string };

export const SelectTrigger: React.FC<WrapperProps> = ({ children }) => <>{children}</>;
export const SelectContent: React.FC<WrapperProps> = ({ children }) => <>{children}</>;

/** รายการตัวเลือก (option) */
type SelectItemProps = {
  value: string;
  children: React.ReactNode;
} & React.OptionHTMLAttributes<HTMLOptionElement>;

export const SelectItem: React.FC<SelectItemProps> = ({ children, ...props }) => (
  <option {...props}>{children}</option>
);

/** ตัว placeholder สำหรับ select (ไม่ต้องมี children) */
type SelectValueProps = {
  placeholder?: string;
};

/**
 * ควรใส่ไว้ก่อน option อื่นๆ และใช้ร่วมกับ value=''
 * hidden ช่วยไม่ให้แสดงในดรอปดาวน์ ส่วน disabled กันการเลือกค่าดังกล่าว
 */
export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => (
  <option value="" disabled hidden>
    {placeholder ?? 'Select...'}
  </option>
);
