import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

interface DiseaseSuggestion {
  id: number;
  disease_name: string;
}

const ReportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    provider: "",
    admissionDate: "",
    dischargeDate: "",
    disease_name: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<DiseaseSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [suggestionsProvider, setSuggestionsProvider] = useState<string[]>([]);
  const [isSuggestionsProviderOpen, setIsSuggestionsProviderOpen] = useState(false);
  const [searchProviderTerm, setSearchProviderTerm] = useState("");

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get<DiseaseSuggestion[]>(
          `http://localhost:5000/diseases/search?q=${searchTerm}`
        );
        setSuggestions(res.data);
        setIsSuggestionsOpen(true);
      } catch (error) {
        console.error("Failed to fetch disease suggestions:", error);
        setSuggestions([]);
      }
    }, 0); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); 

  useEffect(() => {
    if (searchProviderTerm.trim() === "") {
      setSuggestionsProvider([]);
      setIsSuggestionsProviderOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get<string[]>(
          `http://localhost:5000/providers/search?q=${searchProviderTerm}`
        );
        setSuggestionsProvider(res.data);
        setIsSuggestionsProviderOpen(true);
      } catch {
        setSuggestionsProvider([]);
      }
    }, 0); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchProviderTerm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "disease_name") {
      setSearchTerm(value);
    }
    if (name === "provider") {
      setSearchProviderTerm(value);
    }
    
    setErrors({ ...errors, [name]: false });
  };

  const handleSuggestionClick = (suggestion: DiseaseSuggestion) => {
    setFormData({ ...formData, disease_name: suggestion.disease_name });
    setSearchTerm(suggestion.disease_name); 
    setIsSuggestionsOpen(false); 
    setSuggestions([]);
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await axios.get("http://localhost:5000/health_records/download", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'health_records.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      toast.error("Gagal mengunduh data CSV");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) { /* ... */ return; }
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.provider.trim()) newErrors.provider = true;
    if (!formData.disease_name.trim()) newErrors.disease_name = true;
    if (!formData.admissionDate) newErrors.admissionDate = true;
    if (!formData.dischargeDate) newErrors.dischargeDate = true;
    if (Object.keys(newErrors).length > 0) { /* ... */ return; }
    const admission = new Date(formData.admissionDate);
    const discharge = new Date(formData.dischargeDate);
    if (discharge < admission) { /* ... */ return; }
    setLoading(true);
    try {
      const diffTime = discharge.getTime() - admission.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const duration_stay = Math.max(1, diffDays).toString();
      const payload = {
        provider: formData.provider.trim(),
        disease_name: formData.disease_name.trim(),
        admission_date: formData.admissionDate,
        duration_stay: duration_stay,
      };
      await axios.post("http://localhost:5000/health_record", payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Berhasil menyimpan health record!");
      setFormData({ provider: "", admissionDate: "", dischargeDate: "", disease_name: "" });
      setSearchTerm(""); // Reset juga search term
    } catch (err) { /* ... */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">

      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Report Form</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white border p-6 max-w-2xl mx-auto rounded-xl shadow-sm"
      >
        {/* Disease Name - Auto Suggestion */}
        <div className="relative"> 
          <label className="block font-medium">Disease Name</label>
          <Input
            type="text"
            name="disease_name"
            value={formData.disease_name}
            onChange={handleChange}
            hasError={errors.disease_name}
            placeholder="Ketik untuk mencari nama penyakit"
            autoComplete="off" 
          />
          {/*Tampilkan daftar saran */}
          {isSuggestionsOpen && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
              {suggestions.slice().sort((a, b) => a.disease_name.localeCompare(b.disease_name)).map((s) => (
                <li
                  key={s.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.disease_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Provider Name - Auto Suggestion */}
        <div className="relative">
          <label className="block font-medium">Provider</label>
          <Input
            type="text"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            hasError={errors.provider}
            placeholder="Ketik untuk mencari nama klinik atau rumah sakit"
            autoComplete="off"
          />
          {/* Tampilkan daftar saran provider */}
          {isSuggestionsProviderOpen && suggestionsProvider.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
              {suggestionsProvider.slice().sort().map((prov) => (
                <li
                  key={prov}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setFormData({ ...formData, provider: prov });
                    setSearchProviderTerm(prov);
                    setIsSuggestionsProviderOpen(false);
                    setSuggestionsProvider([]);
                  }}
                >
                  {prov}
                </li>
              ))}
            </ul>
          )}
        </div>

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

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
      <div className="max-w-2xl mx-auto flex justify-end mt-4">
        <Button type="button" variant="secondary" onClick={handleDownloadCSV}>
          Download CSV
        </Button>
      </div>
    </div>
  );
};

export default ReportPage;