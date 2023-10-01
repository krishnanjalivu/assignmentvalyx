// Node.js server
import mongoose from 'mongoose';
import express from 'express';
import { mongoDBURL } from './config.js';
import csv from 'csvtojson';

const bankSchema=mongoose.Schema({
    date: { type: Date },
  description: { type: String },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  bank: { type: String }
})

const BankTransaction = mongoose.model('BankTransaction',bankSchema);

const app = express();
app.use(express.json());

// Import the data from the three CSV files
async function importBankTransactions(csvFile) {
  const bankTransactions = await csv().fromFile(csvFile, {
    // Ignore empty fields in the CSV file
    ignoreEmpty: true,
    // Convert empty fields to the null keyword
    converters: {
      date: (value) => {
        if (value === '') {
          return null;
        } else {
          return new Date(value);
        }
      },
      description: (value) => {
        if (value === '') {
          return null;
        } else {
          return value;
        }
      },
      debit: (value) => {
        if (value === '') {
          return null;
        } else {
          return Number(value);
        }
      },
      credit: (value) => {
        if (value === '') {
          return null;
        } else {
          return Number(value);
        }
      },
      balance: (value) => {
        if (value === '') {
          return null;
        } else {
          return Number(value);
        }
      },
      bank: (value) => {
        if (value === '') {
          return null;
        } else {
          return value;
        }
      }
    }
  });

  for (const bankTransaction of bankTransactions) {
    const newBankTransaction = new BankTransaction({
      date: bankTransaction.date,
      description: bankTransaction.description,
      debit: bankTransaction.debit,
      credit: bankTransaction.credit,
      balance: bankTransaction.balance,
      bank: bankTransaction.bank
    });

    await newBankTransaction.save();
  }
}

async function main() {
  await mongoose.connect(mongoDBURL);

  // Import the CSV files containing the bank transaction data
  await importBankTransactions('./axis.csv');
  await importBankTransactions('./hdfc.csv');
  await importBankTransactions('./hdfc.csv');

  mongoose.disconnect();
}

main();

// Search the bank transaction data
app.get('/search', async (req, res) => {
  // Get the keywords, bank accounts, and time range from the request query parameters
  const keywords = req.query.keywords;
  const bankAccounts = req.query.bankAccounts;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Search the bank transaction data
  const bankTransactions = await searchBankTransactions(keywords, bankAccounts, startDate, endDate);

  // Return the search results
  res.json(bankTransactions);
});
app.get("/bankAccount", async (req, res) => {
    const bankAccounts = await BankTransaction.distinct("bank");
    res.send(bankAccounts);
  });

  app.get("/spend-trend", async (req, res) => {
    const { category, startDate, endDate } = req.query;
  
    const query = {};
    if (category) {
      query.description = { $regex: new RegExp(category, "i") };
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
  
    const bankTransactions = await BankTransaction.find(query);
  
    const spendData = [];
    for (const bankTransaction of bankTransactions) {
      const month = bankTransaction.date.getMonth();
      const year = bankTransaction.date.getFullYear();
  
      const existingMonthData = spendData.find(
        (monthData) => monthData.name === `${month}/${year}`
      );
  
      if (existingMonthData) {
        existingMonthData.spend += bankTransaction.amount;
      } else {
        spendData.push({
          name: `${month}/${year}`,
          spend: bankTransaction.amount,
        });
      }
    }
  
    res.send(spendData);
  });
async function searchBankTransactions(keywords, bankAccounts, startDate, endDate) {
  // Create a query object to filter the bank transaction data
  const query = {};
  if (keywords) {
    query.description = { $regex: new RegExp(keywords, 'i') };
  }
  if (bankAccounts) {
    query.bank = { $in: bankAccounts };
  }
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  // Find the bank transactions that match the query criteria
  const bankTransactions = await BankTransaction.find(query);

  // Return the search results
  return bankTransactions;
}

// Start the Node.js server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
