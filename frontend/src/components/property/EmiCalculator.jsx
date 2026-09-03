import React, { useState, useEffect } from "react";
import { HiOutlineCalculator } from "react-icons/hi";

const EmiCalculator = ({ propertyPrice }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [emi, setEmi] = useState(0);

  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const principal = propertyPrice - downPaymentAmount;

  useEffect(() => {
    calculateEmi();
  }, [downPaymentPercent, interestRate, tenureYears, propertyPrice]);

  const calculateEmi = () => {
    if (principal <= 0 || interestRate <= 0 || tenureYears <= 0) {
      setEmi(0);
      return;
    }
    
    // Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
    const r = (interestRate / 12) / 100; // Monthly interest rate
    const n = tenureYears * 12; // Total months
    
    const calculatedEmi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(Math.round(calculatedEmi));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#f0fdf4", padding: "10px", borderRadius: "8px", color: "#16a34a" }}>
          <HiOutlineCalculator size={24} />
        </div>
        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "bold", color: "#1e293b" }}>
          EMI Calculator
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Down Payment Slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#475569" }}>Down Payment ({downPaymentPercent}%)</span>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>{formatCurrency(downPaymentAmount)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#16a34a" }}
          />
        </div>

        {/* Interest Rate Slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#475569" }}>Interest Rate (p.a.)</span>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>{interestRate}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="15"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#16a34a" }}
          />
        </div>

        {/* Tenure Slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#475569" }}>Loan Tenure</span>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>{tenureYears} Years</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#16a34a" }}
          />
        </div>
      </div>

      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed #cbd5e1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "4px" }}>Principal Amount</div>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: "#334155" }}>{formatCurrency(principal)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.875rem", color: "#16a34a", fontWeight: "600", marginBottom: "4px" }}>Estimated Monthly EMI</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#16a34a" }}>{formatCurrency(emi)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiCalculator;
