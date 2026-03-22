import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { parseCSV, autoDetectMapping, CSVMapping, generateTransactionHash } from '../../logic/csvMapper';
import './CSVImportView.css';

const CSVImportView: React.FC = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [mapping, setMapping] = useState<CSVMapping | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      if (parsed.length > 0) {
        setCsvData(parsed);
        const headers = parsed[0];
        setMapping(autoDetectMapping(headers));
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData || !mapping || !selectedAccountId) return;

    setImportStatus('Importing...');
    const transactions = csvData.slice(1); // Skip header
    let addedCount = 0;
    let duplicateCount = 0;

    for (const row of transactions) {
      if (row.length < 2) continue;

      const transactionData = {
        accountId: Number(selectedAccountId),
        date: row[mapping.dateIndex],
        amount: parseFloat(row[mapping.amountIndex].replace(/[$,]/g, '')),
        description: row[mapping.descriptionIndex],
        category: mapping.categoryIndex !== undefined ? row[mapping.categoryIndex] : 'Uncategorized',
      };

      const hash = generateTransactionHash(transactionData);
      
      const existing = await db.transactions.where('hash').equals(hash).first();
      if (!existing) {
        await db.transactions.add({ ...transactionData, hash });
        addedCount++;
      } else {
        duplicateCount++;
      }
    }

    setImportStatus(`Import complete: ${addedCount} added, ${duplicateCount} duplicates skipped.`);
    setCsvData(null);
  };

  return (
    <div className="csv-import-container">
      <header className="csv-header">
        <h1>CSV Import Mapper</h1>
        <p>Import your bank statements to keep the engine fueled with real data.</p>
      </header>

      <div className="import-card">
        <div className="form-group">
          <label>Target Account</label>
          <select 
            value={selectedAccountId} 
            onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            required
          >
            <option value="">Select an account...</option>
            {accounts?.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select CSV File</label>
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={!selectedAccountId} />
        </div>

        {csvData && mapping && (
          <div className="mapping-preview">
            <h3>Mapping Configuration</h3>
            <p>Verify that the columns match your CSV structure:</p>
            <div className="mapping-grid">
              <div className="mapping-item">
                <label>Date Column</label>
                <select 
                  value={mapping.dateIndex} 
                  onChange={(e) => setMapping({...mapping, dateIndex: Number(e.target.value)})}
                >
                  {csvData[0].map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
              <div className="mapping-item">
                <label>Amount Column</label>
                <select 
                  value={mapping.amountIndex} 
                  onChange={(e) => setMapping({...mapping, amountIndex: Number(e.target.value)})}
                >
                  {csvData[0].map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
              <div className="mapping-item">
                <label>Description Column</label>
                <select 
                  value={mapping.descriptionIndex} 
                  onChange={(e) => setMapping({...mapping, descriptionIndex: Number(e.target.value)})}
                >
                  {csvData[0].map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="preview-table-wrapper">
              <h4>Data Preview (First 3 rows)</h4>
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1, 4).map((row, ri) => (
                    <tr key={ri}>
                      <td>{row[mapping.dateIndex]}</td>
                      <td>{row[mapping.descriptionIndex]}</td>
                      <td>{row[mapping.amountIndex]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleImport} className="import-button">Start Import</button>
          </div>
        )}

        {importStatus && <p className="status-msg">{importStatus}</p>}
      </div>
    </div>
  );
};

export default CSVImportView;
