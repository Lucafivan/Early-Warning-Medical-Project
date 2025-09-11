import React, { useState } from "react";
import axios from "axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const ReportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    provider: "",
    principleName: "",
    admissionDate: "",
    dischargeDate: "",
    diagnosisDesc: "",
    memberType: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Cek token terlebih dahulu
    const token = localStorage.getItem("access_token"); // Pastikan key-nya benar! (access_token atau token)
    if (!token) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        // Anda bisa Arahkan ke halaman login di sini jika perlu
        // navigate('/login');
        return;
    }

    // 2. Validasi FE yang lebih ketat
    const newErrors: { [key: string]: boolean } = {};
    // Gunakan .trim() untuk menghapus spasi di awal/akhir dan cek apakah hasilnya kosong
    if (!formData.provider.trim()) newErrors.provider = true;
    if (!formData.diagnosisDesc.trim()) newErrors.diagnosisDesc = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Harap isi semua field yang wajib diisi (Provider dan Diagnosis).");
      return;
    }

    setLoading(true); // Mulai loading

    try {
      const payload = {
        record_type: "inpatient",
        provider: formData.provider.trim(), // Kirim data yang sudah di-trim
        disease_name: formData.diagnosisDesc.trim(), // Kirim data yang sudah di-trim
      };

      const res = await axios.post(
        "http://localhost:5000/health_record",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Sukses simpan:", res.data);
      alert("Berhasil simpan health record!");
      // Reset form jika perlu
      setFormData({
        provider: "",
        principleName: "",
        admissionDate: "",
        dischargeDate: "",
        diagnosisDesc: "",
        memberType: "",
      });

    } catch (err) {
      console.error("Gagal simpan health record:", err);
       // Tampilkan pesan error spesifik dari backend jika ada
      if (axios.isAxiosError(err) && err.response) {
        alert(`Gagal menyimpan: ${err.response.data.error || 'Terjadi kesalahan pada server'}`);
      } else {
        alert("Gagal menyimpan data. Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      // 3. Pastikan loading selalu berhenti
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold max-w-2xl mx-auto">Report Form</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-100 p-4 max-w-2xl mx-auto rounded-xl shadow"
      >
        {/* Provider */}
        <div>
          <label className="block font-medium">Provider</label>
          <Input
            type="text"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            hasError={errors.provider}
            placeholder="Nama provider"
          />
        </div>

        {/* Principle Name */}
        <div>
          <label className="block font-medium">Principle Name</label>
          <Input
            type="text"
            name="principleName"
            value={formData.principleName}
            onChange={handleChange}
            hasError={errors.principleName}
            placeholder="Nama principle"
          />
        </div>

        {/* Admission Date */}
        <div>
          <label className="block font-medium">Admission Date</label>
          <Input
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleChange}
            hasError={errors.admissionDate}
          />
        </div>

        {/* Discharge Date */}
        <div>
          <label className="block font-medium">Discharge Date</label>
          <Input
            type="date"
            name="dischargeDate"
            value={formData.dischargeDate}
            onChange={handleChange}
            hasError={errors.dischargeDate}
          />
        </div>

        {/* Diagnosis Desc */}
        <div>
          <label className="block font-medium">Diagnosis Description</label>
          <textarea
            name="diagnosisDesc"
            value={formData.diagnosisDesc}
            onChange={handleChange}
            placeholder="Deskripsi diagnosis"
            className={`mt-1 w-full h-20 rounded-md border px-3 py-2 outline-none focus:ring-2 ${
              errors.diagnosisDesc
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-green-600"
            }`}
          />
        </div>

        {/* Member Type (tidak dipakai BE, hanya tampil di form) */}
        <div>
          <label className="block font-medium">Member Type</label>
          <Input
            type="text"
            name="memberType"
            value={formData.memberType}
            onChange={handleChange}
            hasError={errors.memberType}
            placeholder="Jenis member"
          />
        </div>

        {/* Button pakai custom component */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportPage;