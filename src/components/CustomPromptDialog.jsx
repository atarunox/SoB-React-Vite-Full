// src/components/CustomPromptDialog.jsx
import React, { useState, useEffect } from 'react';

/**
 * Custom prompt dialog with Auto-Roll button
 * Used for Defense/Armor rolls in combat
 *
 * mode: 'number' (default) = input + auto-roll button
 *       'test' = Pass/Fail/Auto-Roll buttons for stat tests
 */
export function CustomPromptDialog({
  isOpen,
  title,
  message,
  defaultValue = '',
  min,
  max,
  mode = 'number',
  onAutoRoll,
  onSubmit,
  onCancel,
  onPass,
  onFail,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numValue = Number(value);
    if (Number.isFinite(numValue)) {
      onSubmit(numValue);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '2px solid #444',
        borderRadius: '8px',
        padding: '20px',
        minWidth: '400px',
        maxWidth: '500px',
        color: '#fff',
      }}>
        {title && (
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#4a9eff',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {title}
          </h3>
        )}

        <div style={{
          whiteSpace: 'pre-wrap',
          marginBottom: '20px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}>
          {message}
        </div>

        {mode === 'test' ? (
          // Test mode: Pass/Fail/Auto-Roll buttons
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <button
              type="button"
              onClick={onPass}
              autoFocus
              style={{
                padding: '15px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              ✓ I Rolled - PASSED
            </button>

            <button
              type="button"
              onClick={onFail}
              style={{
                padding: '15px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              ✗ I Rolled - FAILED
            </button>

            <button
              type="button"
              onClick={onAutoRoll}
              style={{
                padding: '15px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#4a9eff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3a8eef'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4a9eff'}
            >
              🎲 Auto-Roll
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#555',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#666'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#555'}
            >
              Cancel
            </button>
          </div>
        ) : (
          // Number mode: Input + Auto-Roll/Cancel/OK buttons
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min={min}
              max={max}
              autoFocus
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px',
                marginBottom: '15px',
                boxSizing: 'border-box',
              }}
            />

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={onAutoRoll}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#4a9eff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#3a8eef'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4a9eff'}
              >
                🎲 Auto-Roll
              </button>

              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  backgroundColor: '#555',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#666'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#555'}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                OK
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
