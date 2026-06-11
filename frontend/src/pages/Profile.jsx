import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { FiUser, FiMail, FiDollarSign, FiInfo, FiLayers } from "react-icons/fi";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [salary, setSalary] = useState(user?.salary || "");
  const [preferredRegime, setPreferredRegime] = useState(user?.preferredRegime || "not-decided");
  const [financialYear, setFinancialYear] = useState(user?.financialYear || "2024-25");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        name,
        salary: salary ? Number(salary) : 0,
        preferredRegime,
        financialYear,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (nameStr = "") =>
    nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-[20px] font-medium text-gray-900">Profile Settings</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Configure your personal information and default tax preferences.
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        
        {/* User Card Info */}
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-[18px] font-bold shadow-lg shadow-blue-600/15">
            {getInitials(user?.name || "Arjun Kumar")}
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">{user?.name || "Arjun Kumar"}</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{user?.email || "arjun@example.com"}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiUser className="text-sm" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Kumar"
                  className="w-full text-[13px] pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                  <FiMail className="text-sm" />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full text-[13px] pl-9 pr-4 py-2 bg-gray-100 border border-gray-150 rounded-xl outline-none text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Annual Salary */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Base Annual Salary (INR)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 850000"
                  min="0"
                  className="w-full text-[13px] pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Financial Year */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Default Financial Year</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiLayers className="text-sm" />
                </span>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full text-[13px] pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="2024-25">2024-25 (FY)</option>
                  <option value="2025-26">2025-26 (FY)</option>
                  <option value="2023-24">2023-24 (FY)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferred Tax Regime */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Preferred Tax Regime</label>
            <select
              value={preferredRegime}
              onChange={(e) => setPreferredRegime(e.target.value)}
              className="w-full text-[13px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="not-decided">Not Decided / Compare Slabs</option>
              <option value="new">New Tax Regime (FY 2024-25 default)</option>
              <option value="old">Old Tax Regime (claims deductions)</option>
            </select>
          </div>

          {/* Help Info banner */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <FiInfo className="text-blue-500 text-sm mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500 leading-normal">
              Your default preferences configure the comparison sheets and dashboard summary cards. You can modify these settings anytime.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-[13px] rounded-xl cursor-pointer shadow-lg shadow-blue-600/10 transition-colors"
            >
              {submitting ? "Saving changes..." : "Save Profile"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
