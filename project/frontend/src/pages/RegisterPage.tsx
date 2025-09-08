import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { registerUser } from '../services/authService';
import spilLogo from "../assets/spil_logo.png";
import containerPicture from "../assets/container.png";
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

// Skema validasi untuk form registrasi
const registerSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal harus 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password tidak boleh kosong"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"], // Menampilkan pesan error pada field confirmPassword
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setIsSubmitting(true);
    toast.loading('Membuat akun...');
    console.log("Data pendaftaran yang akan dikirim:", data);

    // Simulasi pengiriman data ke backend
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.dismiss();
      toast.success('Akun berhasil dibuat! Silakan login.');
      navigate('/login');
    } catch (error) {
      toast.dismiss();
      toast.error('Registrasi gagal, silakan coba lagi.');
      console.error("Error saat registrasi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-white">
      {/* Kiri: panel gambar */}
      <div className="hidden md:block w-[45%] h-full">
        <img src={containerPicture} className="w-full h-full object-cover" />
      </div>

      {/* Kanan: area form */}
      <div className="flex-1 relative flex items-center justify-center">
        <img src={spilLogo} alt="SPIL Logo" className="absolute top-6 right-6 h-10 object-contain" />

        {/* Gunakan handleSubmit untuk membungkus form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-[92%] max-w-lg">
          <div className="rounded-2xl bg-gray-100/70 shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#2b5b2f]">Register</h2>

            {/* username */}
            <label className="block mt-5 text-xs text-gray-600 text-left">username</label>
            <Input type="text" hasError={!!errors.username} {...register("username")} />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}

            {/* email */}
            <label className="block mt-4 text-xs text-gray-600 text-left">email</label>
            <Input type="email" hasError={!!errors.email} {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}

            {/* password */}
            <label className="block mt-4 text-xs text-gray-600 text-left">password</label>
            <Input type="password" hasError={!!errors.password} {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}

            {/* confirm password */}
            <label className="block mt-4 text-xs text-gray-600 text-left">confirm password</label>
            <Input type="password" hasError={!!errors.confirmPassword} {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}

            {/* Actions */}
            <div className="mt-6">
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Mendaftar...' : 'Register'}
              </Button>
            </div>

            <div className="mt-3 text-center text-xs italic text-gray-600">
              Sudah punya akun?{" "}
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="text-blue-600 hover:underline italic">
                Login
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;