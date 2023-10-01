import React, { useState,useEffect } from "react";
import axios from "axios";

const SearchBankTransactionsPage = () => {
  const [keywords, setKeywords] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [bankTransactions, setBankTransactions] = useState([]);

  const fetchBankAccounts = async () => {
    const response = await axios.get("http://localhost:3000/bankAccount");
    setBankAccounts(response.data);
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleChangeKeywords = (event) => {
    setKeywords(event.target.value);
  };

  const handleChangeStartDate = (event) => {
    setStartDate(event.target.value);
  };

  const handleChangeEndDate = (event) => {
    setEndDate(event.target.value);
  };

  const handleSelectBankAccount = (event) => {
    setSelectedBankAccount(event.target.value);
  };

  const handleSubmit = async () => {
    const response = await axios.get("http://localhost:3000/search", {
      params: {
        keywords,
        bankAccounts: selectedBankAccount,
        startDate,
        endDate,
      },
    });

    setBankTransactions(response.data);
  };

  return (
    <div>
      <h1>Search Bank Transactions</h1>
      <input
        type="text"
        placeholder="Keywords"
        value={keywords}
        onChange={handleChangeKeywords}
      />
      <select
        value={selectedBankAccount}
        onChange={handleSelectBankAccount}
      >
        <option value="">All bank accounts</option>
        {bankAccounts.map((bankAccount) => (
          <option key={bankAccount._id} value={bankAccount.name}>
            {bankAccount.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        placeholder="Start date"
        value={startDate}
        onChange={handleChangeStartDate}
      />
      <input
        type="date"
        placeholder="End date"
        value={endDate}
        onChange={handleChangeEndDate}
      />
      <button onClick={handleSubmit}>Search</button>
      <ul>
        {bankTransactions.map((bankTransaction) => (
          <li key={bankTransaction._id}>
            {bankTransaction.date} - {bankTransaction.description} - {bankTransaction.bank}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBankTransactionsPage;
