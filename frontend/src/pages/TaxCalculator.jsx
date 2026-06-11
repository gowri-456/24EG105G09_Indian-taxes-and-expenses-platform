import { useState } from "react";
import { taxService } from "../services/taxService";
import { toast } from "react-hot-toast";
import {
  FiPercent,
  FiFileText,
  FiHelpCircle,
  FiGrid,
  FiAward,
  FiCompass,
  FiActivity,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";

function formatCurrency(value) {
  if (value === undefined || value === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRecommendedRegime(results) {
  return results?.comparison?.recommended || "Either";
}

function getTaxSavingsText(results) {
  const recommended = getRecommendedRegime(results);
  const savings = results?.comparison?.savings || 0;

  if (recommended === "Either") return "Both regimes are equal for these inputs.";
  return `${recommended} saves ${formatCurrency(savings)} compared with the other regime.`;
}

// Tooltip helper component
function HelpTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1 text-gray-300 hover:text-blue-500 transition-colors"
      >
        <FiInfo className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 text-white text-[11px] p-2 rounded-lg z-50 shadow-lg">
          {text}
          <div className="absolute top-full left-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export default function TaxCalculator() {
  const [grossIncome, setGrossIncome] = useState("");
  const [financialYear, setFinancialYear] = useState("2024-25");

  // Deductions state
  const [sec80C, setSec80C] = useState("");
  const [sec80D, setSec80D] = useState("");
  const [nps, setNps] = useState("");
  const [homeLoanInterest, setHomeLoanInterest] = useState("");
  const [hra, setHra] = useState("");
  const [lta, setLta] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");

  // Results state
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  // Trigger manual calculation
  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!grossIncome || Number(grossIncome) <= 0) {
      toast.error("Please enter a valid gross annual income");
      return;
    }

    setLoading(true);
    const deductions = {
      section80C: sec80C ? Number(sec80C) : 0,
      section80D: sec80D ? Number(sec80D) : 0,
      nps: nps ? Number(nps) : 0,
      homeLoanInterest: homeLoanInterest ? Number(homeLoanInterest) : 0,
      hra: hra ? Number(hra) : 0,
      lta: lta ? Number(lta) : 0,
      otherDeductions: otherDeductions ? Number(otherDeductions) : 0,
    };

    try {
      const compareRes = await taxService.compareTax(Number(grossIncome), deductions);
      const suggestionsRes = await taxService.getSuggestions(Number(grossIncome), deductions);
      setResults(compareRes.data);
      setSuggestions(suggestionsRes.data || []);
      toast.success("Tax regimes calculated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to calculate tax regimes");
    } finally {
      setLoading(false);
    }
  };

  // Auto fill income from database records
  const handleAutoFill = async () => {
    setAutoFilling(true);
    const deductions = {
      section80C: sec80C ? Number(sec80C) : 0,
      section80D: sec80D ? Number(sec80D) : 0,
      nps: nps ? Number(nps) : 0,
      homeLoanInterest: homeLoanInterest ? Number(homeLoanInterest) : 0,
      hra: hra ? Number(hra) : 0,
      lta: lta ? Number(lta) : 0,
      otherDeductions: otherDeductions ? Number(otherDeductions) : 0,
    };

    try {
      const autoRes = await taxService.autoCalculateTax(financialYear, deductions);
      if (autoRes.success && autoRes.data) {
        const income = autoRes.data.grossIncome;
        if (income === 0) {
          toast.error("No income records found in ledger for this financial year.");
          setAutoFilling(false);
          return;
        }
        setGrossIncome(income);
        setResults(autoRes.data);
        setSuggestions(autoRes.data.suggestions || []);
        toast.success(`Fetched gross income from database: ${formatCurrency(income)}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to auto-fill income details");
    } finally {
      setAutoFilling(false);
    }
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Simple Tax Calculator</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Find out which tax option saves you more money. Compare & save wisely! 💰
          </p>
        </div>
        <button
          onClick={handleAutoFill}
          disabled={autoFilling}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <FiRefreshCw className={`text-sm ${autoFilling ? "animate-spin" : ""}`} />
          Use My Transactions
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Inputs Column */}
        <div className="col-span-1 bg-white border border-gray-100 rounded-xl p-5 shadow-sm h-fit">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-1.5 border-b border-gray-50 pb-2">
            <FiPercent className="text-blue-500" />
            Your Income & Savings
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            {/* FY Selection */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">TAX YEAR</label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full text-[13px] px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
              >
                <option value="2024-25">April 2024 - March 2025</option>
              </select>
            </div>

            {/* Gross Annual Income */}
            <div>
              <div className="flex items-center gap-1">
                <label className="block text-[11px] font-medium text-gray-400">YOUR ANNUAL SALARY *</label>
                <HelpTooltip text="Total money you earn in a year before any deductions" />
              </div>
              <input
                type="number"
                required
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                placeholder="e.g. 1200000"
                min="1000"
                className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            {/* Deductions Header - Simplified */}
            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-[12px] font-bold text-gray-700 mb-3 flex items-center gap-1">
                💡 Money You Can Save From Tax
                <HelpTooltip text="These are investments & expenses that reduce your taxable income" />
              </h3>
              <p className="text-[11px] text-gray-500 mb-3 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                Only for Old Tax System (saves more tax = better choice for you)
              </p>
            </div>

            {/* Category: Investments */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <h4 className="text-[12px] font-bold text-blue-700 mb-2">🏦 Your Investments</h4>
              
              {/* Savings Section */}
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">Savings & Insurance (Max ₹1,50,000)</label>
                  <HelpTooltip text="PPF, Mutual Funds, Life Insurance, Fixed Deposits" />
                </div>
                <input
                  type="number"
                  value={sec80C}
                  onChange={(e) => setSec80C(e.target.value)}
                  placeholder="0"
                  max="150000"
                  className="w-full text-[12px] px-3 py-1.5 border border-blue-200 rounded-lg outline-none bg-white"
                />
              </div>

              {/* Health Insurance */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">Health Insurance (Max ₹75,000)</label>
                  <HelpTooltip text="Medical/Health Insurance premiums paid for you & family" />
                </div>
                <input
                  type="number"
                  value={sec80D}
                  onChange={(e) => setSec80D(e.target.value)}
                  placeholder="0"
                  max="75000"
                  className="w-full text-[12px] px-3 py-1.5 border border-blue-200 rounded-lg outline-none bg-white"
                />
              </div>
            </div>

            {/* Category: Retirement */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <h4 className="text-[12px] font-bold text-green-700 mb-2">🎯 Retirement Savings</h4>
              
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">Pension Plan (Max ₹50,000)</label>
                  <HelpTooltip text="National Pension System contributions for your retirement" />
                </div>
                <input
                  type="number"
                  value={nps}
                  onChange={(e) => setNps(e.target.value)}
                  placeholder="0"
                  max="50000"
                  className="w-full text-[12px] px-3 py-1.5 border border-green-200 rounded-lg outline-none bg-white"
                />
              </div>
            </div>

            {/* Category: Home & Travel */}
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <h4 className="text-[12px] font-bold text-purple-700 mb-2">🏠 Home & Travel Benefits</h4>
              
              <div className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">Home Loan Interest (Max ₹2,00,000)</label>
                  <HelpTooltip text="Interest paid on your home loan (not the principal amount)" />
                </div>
                <input
                  type="number"
                  value={homeLoanInterest}
                  onChange={(e) => setHomeLoanInterest(e.target.value)}
                  placeholder="0"
                  max="200000"
                  className="w-full text-[12px] px-3 py-1.5 border border-purple-200 rounded-lg outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-[11px] font-medium text-gray-600">House Rent Paid</label>
                    <HelpTooltip text="Rent paid for your accommodation" />
                  </div>
                  <input
                    type="number"
                    value={hra}
                    onChange={(e) => setHra(e.target.value)}
                    placeholder="0"
                    className="w-full text-[12px] px-3 py-1.5 border border-purple-200 rounded-lg outline-none bg-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-[11px] font-medium text-gray-600">Travel Allowance</label>
                    <HelpTooltip text="Annual travel/vacation allowance from employer" />
                  </div>
                  <input
                    type="number"
                    value={lta}
                    onChange={(e) => setLta(e.target.value)}
                    placeholder="0"
                    className="w-full text-[12px] px-3 py-1.5 border border-purple-200 rounded-lg outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Category: Donations */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
              <h4 className="text-[12px] font-bold text-orange-700 mb-2">❤️ Charitable Giving</h4>
              
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-[11px] font-medium text-gray-600">Donations to Charities</label>
                  <HelpTooltip text="Donations to approved charitable organizations" />
                </div>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  placeholder="0"
                  className="w-full text-[12px] px-3 py-1.5 border border-orange-200 rounded-lg outline-none bg-white"
                />
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold text-[13px] rounded-xl cursor-pointer transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                "💰 Calculate My Taxes"
              )}
            </button>
          </form>
        </div>

        {/* Results Columns */}
        <div className="col-span-2 space-y-5">
          {results ? (
            <>
              {/* Recommendation Banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-green-600/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="text-xl text-yellow-300" />
                  <span className="text-[13px] uppercase tracking-wider font-bold">✅ Best Choice for You</span>
                </div>
                <h3 className="text-[18px] font-bold">
                  {getRecommendedRegime(results)} is the better option
                </h3>
                <p className="text-[13px] text-green-50 mt-2">{results.comparison?.reason}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Old regime tax</p>
                  <p className="text-[20px] font-bold text-blue-700 mt-1">{formatCurrency(results.oldRegime?.totalTax)}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">New regime tax</p>
                  <p className="text-[20px] font-bold text-green-700 mt-1">{formatCurrency(results.newRegime?.totalTax)}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tax difference</p>
                  <p className="text-[20px] font-bold text-gray-900 mt-1">{formatCurrency(results.comparison?.taxDifference || 0)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{getTaxSavingsText(results)}</p>
                </div>
              </div>

              {/* Slabs Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Old Regime Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-[14px] font-bold text-blue-700 mb-3 pb-2 border-b border-blue-100 flex items-center gap-2">
                    📋 Old Tax System
                    <HelpTooltip text="You claim deductions for investments, medical, home loan, etc." />
                  </h3>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Your Income:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(results.oldRegime?.grossIncome)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Money Saved (Deductions):</span>
                      <span className="font-medium text-green-600">-{formatCurrency(results.oldRegime?.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5 font-bold">
                      <span className="text-gray-700">Taxable Income:</span>
                      <span className="text-gray-900">{formatCurrency(results.oldRegime?.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Income Tax:</span>
                      <span className="text-gray-900">{formatCurrency(results.oldRegime?.baseTax)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Additional Tax (4%):</span>
                      <span className="text-gray-900">{formatCurrency(results.oldRegime?.cess)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Extra Charges (Surcharge):</span>
                      <span className="text-gray-900">{formatCurrency(results.oldRegime?.surcharge)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-[14px] font-bold text-gray-900 bg-blue-50 -mx-5 px-5 py-2.5 rounded-lg">
                      <span>💸 Total Tax You Pay:</span>
                      <span className="text-blue-600">{formatCurrency(results.oldRegime?.totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                      <span>% of your income:</span>
                      <span className="font-medium">{results.oldRegime?.effectiveRate || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* New Regime Card */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-[14px] font-bold text-green-700 mb-3 pb-2 border-b border-green-100 flex items-center gap-2">
                    ✨ New Tax System
                    <HelpTooltip text="Lower tax rates but no deductions. You pay less tax directly." />
                  </h3>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Your Income:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(results.newRegime?.grossIncome)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Standard Deduction:</span>
                      <span className="font-medium text-green-600">-{formatCurrency(results.newRegime?.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5 font-bold">
                      <span className="text-gray-700">Taxable Income:</span>
                      <span className="text-gray-900">{formatCurrency(results.newRegime?.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Income Tax:</span>
                      <span className="text-gray-900">{formatCurrency(results.newRegime?.baseTax)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Additional Tax (4%):</span>
                      <span className="text-gray-900">{formatCurrency(results.newRegime?.cess)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-500">Extra Charges (Surcharge):</span>
                      <span className="text-gray-900">{formatCurrency(results.newRegime?.surcharge)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-[14px] font-bold text-gray-900 bg-green-50 -mx-5 px-5 py-2.5 rounded-lg">
                      <span>💸 Total Tax You Pay:</span>
                      <span className="text-green-600">{formatCurrency(results.newRegime?.totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                      <span>% of your income:</span>
                      <span className="font-medium">{results.newRegime?.effectiveRate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Savings Tips & Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                    <FiCompass className="text-blue-500" />
                    💡 Ways to Save More Tax (Old System Only)
                  </h3>
                  <p className="text-[12px] text-gray-500 mb-3">
                    These suggestions show the deduction limits you still have available.
                  </p>
                  <div className="space-y-3.5">
                    {suggestions.map((item, index) => (
                      <div key={index} className="text-[12px] bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-blue-800 text-[13px]">💰 {item.section}</span>
                          <span className="text-[11px] text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full font-semibold">
                            Max Limit: {formatCurrency(item.maxLimit)}
                          </span>
                        </div>
                        <p className="text-gray-800 mb-2 leading-relaxed">{item.tip}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.instruments.map((ins) => (
                            <span key={ins} className="text-[10px] bg-white border border-blue-200 px-2.5 py-1 rounded-full text-gray-700 font-medium">
                              ✓ {ins}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-[350px]">
              <FiFileText className="text-gray-200 text-5xl mb-3" />
              <h3 className="text-[14px] font-semibold text-gray-800">Ready to Calculate Your Taxes? 📊</h3>
              <p className="text-[12px] text-gray-500 mt-2 max-w-sm leading-relaxed">
                Enter your annual income and any savings/investments on the left side, then click "Calculate My Taxes" to see which system saves you more money!
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                <p className="text-[11px] text-gray-400">💡 Tip: Check the "House Rent Paid" field if you pay rent for your home</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
