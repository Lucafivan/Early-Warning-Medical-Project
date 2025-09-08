import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { loginUser } from '../services/authService';
import spilLogo from "../assets/spil_logo.png";
import containerPicture from "../assets/container.png";
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, setUserEmail } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    toast.loading('Mencoba untuk masuk...'); // Tampilkan notifikasi loading

    try {
      await loginUser({
        email: data.email,
        password: data.password,
      });

      toast.dismiss();
      toast.success('Login berhasil!');
      
      // Jika backend mengirim token, Anda bisa menyimpannya di sini
      // contoh: localStorage.setItem('token', response.data.token);
      
  login(); // Ubah status di AuthContext
  setUserEmail(data.email); // Simpan email user ke context
  navigate('/dashboard');

    } catch (error) {
      toast.dismiss(); // Hapus notifikasi loading
      toast.error('Login gagal. Periksa kembali email dan password Anda.');
      console.error('Error saat login:', error);
    } finally {
      setIsSubmitting(false); // Selalu hentikan loading, baik sukses maupun gagal
    }
  };

  return (
    <div className="fixed inset-0 flex bg-white">
      <div className="hidden md:block w-[45%] h-full">
        <img src={containerPicture} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <img src={spilLogo} alt="SPIL Logo" className="absolute top-6 right-6 h-10 object-contain" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-[92%] max-w-lg">
          <div className="rounded-2xl bg-gray-100/70 shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#2b5b2f]">Login</h2>
            {/* Input fields */}
            <label className="block mt-5 text-xs text-gray-600 text-left">email</label>
            <Input type="email" placeholder="contoh@email.com" hasError={!!errors.email} {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            <label className="block mt-4 text-xs text-gray-600 text-left">password</label>
            <Input type="password" placeholder="" hasError={!!errors.password} {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            <div className="mt-2 text-right">
              <a href="#" className="text-[11px] text-blue-600 hover:underline italic">Forgot Password?</a>
            </div>
            {/* Actions */}
            <div className="mt-6 flex items-center gap-4">
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => navigate("/register")}>Sign up</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Loading...' : 'Sign in'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;