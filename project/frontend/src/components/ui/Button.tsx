import type { ComponentProps } from 'react';

// Tentukan tipe props yang bisa diterima oleh komponen Button
type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({ 
  children, 
  variant = 'primary', // Set 'primary' sebagai default
  className = '', 
  ...props // ...props akan menampung semua sisa props (misal: onClick, disabled, type)
}: ButtonProps) => {

  // Tentukan gaya dasar yang dimiliki semua tombol
  const baseStyle = 
    "w-40 h-10 p-0 flex items-center justify-center mx-auto rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // Tentukan gaya spesifik berdasarkan varian
  const variantStyles = {
    primary: "bg-[#3a9542] text-white hover:brightness-95",
    secondary: "border border-[#3a9542] text-[#2b5b2f] bg-transparent hover:bg-green-50",
  };

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};