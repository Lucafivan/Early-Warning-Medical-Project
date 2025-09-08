import { forwardRef, type ComponentProps } from 'react';

// Tentukan tipe props yang bisa diterima
type InputProps = ComponentProps<'input'> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, ...props }, ref) => {
    
    // Tentukan gaya dasar untuk semua input
    const baseStyle = 
      "mt-1 w-full h-10 rounded-md border px-3 outline-none focus:ring-2";
    
    // Tentukan gaya kondisional jika ada error
    const errorStyle = "border-red-500 focus:ring-red-500";
    
    // Tentukan gaya default (jika tidak ada error)
    const defaultStyle = "border-gray-300 focus:ring-green-600";

    return (
      <input
        className={`${baseStyle} ${hasError ? errorStyle : defaultStyle} ${className}`}
        ref={ref} // Teruskan ref ke elemen input
        {...props} // Teruskan sisa props (type, placeholder, dll.)
      />
    );
  }
);

// Beri nama display untuk kemudahan debugging
Input.displayName = 'Input';