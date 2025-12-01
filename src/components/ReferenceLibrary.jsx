import React, { useState } from 'react';
import { LIBRARY_ENTRIES } from '../data/LibraryFormattedData.jsx'; // Adjust path if necessary

function ReferenceLibrary() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});

  const toggleCategory = (category) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredEntries = LIBRARY_ENTRIES.map(({ category, entries }) => ({
    category,
    entries: entries.filter(entry =>
      entry.item.toLowerCase().includes(query.toLowerCase()) ||
      entry.description.toLowerCase().includes(query.toLowerCase()) ||
      entry.source.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(group => group.entries.length > 0);

  return (
    <div style={{ padding: '1rem' }}>
      <input
        type="text"
        placeholder="Search item, effect, or location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          border: '1px solid #8b6d3c',
          borderRadius: '5px',
          backgroundColor: '#fffaf0'
        }}
      />

      {filteredEntries.map(({ category, entries }) => (
        <div key={category} style={{ marginBottom: '1rem', border: '1px solid #c1a76e', borderRadius: '6px' }}>
          <div
  role="button"
  tabIndex={0}
  onClick={() => toggleCategory(category)}
  onKeyPress={e => { if (e.key === 'Enter') toggleCategory(category); }}
  style={{
    backgroundColor: '#f2e4ba',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontWeight: 'bold',
    color: '#4a3b28',
    borderBottom: '1px solid #c1a76e'
  }}
>
  {expanded[category] ? '▼' : '▶'} {category}
</div>

          {expanded[category] && (
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fdfbf3' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7f1d5' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #e6dab0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{entry.item}</td>
                    <td style={{ padding: '0.5rem' }}>{entry.description}</td>
                    <td style={{ padding: '0.5rem', fontStyle: 'italic' }}>{entry.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default ReferenceLibrary;
