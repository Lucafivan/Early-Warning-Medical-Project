import { useNavigate } from "react-router-dom";
import spilLogo from "../assets/spil_logo.png";
import containerPicture from "../assets/container.png";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    // Fullscreen, abaikan padding #root dari App.css
    <div className="fixed inset-0 flex bg-white">
      {/* Kiri: panel gambar */}
      <div className="hidden md:block w-[45%] h-full">
        <img src={containerPicture} className="w-full h-full object-cover" />
      </div>

      {/* Kanan: area form */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Logo kanan-atas */}
        <img
          src={spilLogo}
          alt="SPIL Logo"
          className="absolute top-6 right-6 h-10 object-contain"
        />

        {/* Card Register */}
        <div className="w-[92%] max-w-lg rounded-2xl bg-gray-100/70 shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#2b5b2f]">Register</h2>

          {/* full name */}
          <label className="block mt-5 text-xs text-gray-600 text-left">username</label>
          <input
            type="text"
            placeholder=""
            className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* email */}
          <label className="block mt-4 text-xs text-gray-600 text-left">email</label>
          <input
            type="email"
            placeholder=""
            className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* password */}
          <label className="block mt-4 text-xs text-gray-600 text-left">password</label>
          <input
            type="password"
            placeholder=""
            className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* confirm password */}
          <label className="block mt-4 text-xs text-gray-600 text-left">confirm password</label>
          <input
            type="password"
            placeholder=""
            className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* Actions */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full h-10 p-0 flex items-center justify-center rounded-full bg-[#3a9542] text-white hover:brightness-95"
              onClick={() => navigate("/login")}
            >
              Register
            </button>
          </div>

          <div className="mt-3 text-center text-xs italic text-gray-600">
              Sudah punya akun?{" "}
              <a
                href="/login"
                onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                className="text-blue-600 hover:underline italic"
              >
                Login
              </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;