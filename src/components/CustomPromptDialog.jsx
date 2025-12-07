// src/components/CustomPromptDialog.jsx
import React, { useState, useEffect } from 'react';
import '../styles/shadows-theme.css';

/**
 * Custom prompt dialog with Auto-Roll button - Shadows of Brimstone themed
 * Used for Defense/Armor rolls in combat and dice prompts
 *
 * mode: 'number' (default) = input + auto-roll button
 *       'test' = Pass/Fail/Auto-Roll buttons for stat tests
 *       'choice' = Multiple choice buttons
 *       'yesno' = Yes/No buttons
 *       'text' = Text input with OK/Cancel buttons (dice rolls)
 */
export function CustomPromptDialog({
  isOpen,
  title,
  message,
  defaultValue = '',
  min,
  max,
  mode = 'number',
  choices = [],
  onAutoRoll,
  onSubmit,
  onCancel,
  onPass,
  onFail,
  onChoice,
  onYes,
  onNo,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'text') {
      // For text mode, submit the string value
      onSubmit(value);
    } else {
      // For number mode, convert to number
      const numValue = Number(value);
      if (Number.isFinite(numValue)) {
        onSubmit(numValue);
      }
    }
  };

  // Check if this is a dice roll prompt (mode text with roll-related title)
  const isDiceRoll = mode === 'text' && title &&
    (title.toLowerCase().includes('roll') ||
     title.toLowerCase().includes('d6') ||
     title.toLowerCase().includes('d3'));

  return (
    <div className="sob-animate-fadein" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(2px)',
    }}>
      <div className={isDiceRoll ? 'sob-dice-prompt sob-animate-fadein' : 'sob-dialog sob-animate-fadein'}>
        {title && (
          <div className={isDiceRoll ? 'sob-dice-title' : 'sob-dialog-title'}>
            {isDiceRoll && '🎲 '}
            {title}
            {isDiceRoll && ' 🎲'}
          </div>
        )}

        {message && (
          <div className={isDiceRoll ? 'sob-dice-label' : 'sob-dialog-content'}>
            {message}
          </div>
        )}

        {mode === 'yesno' ? (
          // Yes/No mode: Yes/No buttons
          <div className="sob-dialog-actions" style={{ flexDirection: 'column' }}>
            <button
              type="button"
              onClick={onYes}
              autoFocus
              className="sob-btn sob-btn-success"
            >
              ✓ Yes
            </button>

            <button
              type="button"
              onClick={onNo}
              className="sob-btn sob-btn-danger"
            >
              ✗ No
            </button>
          </div>
        ) : mode === 'text' ? (
          // Text mode: Text input + OK/Cancel buttons (used for dice rolls)
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isDiceRoll ? "Enter roll or leave blank to auto-roll" : ""}
              autoFocus
              className={isDiceRoll ? 'sob-dice-input' : ''}
              style={!isDiceRoll ? {
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                backgroundColor: 'var(--sob-bg-secondary)',
                color: 'var(--sob-text-main)',
                border: '2px solid var(--sob-border)',
                borderRadius: '4px',
                marginBottom: '15px',
                boxSizing: 'border-box',
              } : {}}
            />

            <div className="sob-dialog-actions">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="sob-btn"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="sob-btn sob-btn-primary"
              >
                {isDiceRoll ? '🎲 Roll' : 'OK'}
              </button>
            </div>
          </form>
        ) : mode === 'choice' ? (
          // Choice mode: Multiple choice buttons
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {choices.map((choice, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChoice?.(idx)}
                autoFocus={idx === 0}
                className="sob-btn sob-btn-primary"
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              >
                {idx + 1}. {choice.label || choice.key || choice}
              </button>
            ))}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="sob-btn"
                style={{ marginTop: '10px' }}
              >
                Cancel
              </button>
            )}
          </div>
        ) : mode === 'test' ? (
          // Test mode: Pass/Fail/Auto-Roll buttons
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={onPass}
              autoFocus
              className="sob-btn sob-btn-success"
            >
              ✓ I Rolled - PASSED
            </button>

            <button
              type="button"
              onClick={onFail}
              className="sob-btn sob-btn-danger"
            >
              ✗ I Rolled - FAILED
            </button>

            <button
              type="button"
              onClick={onAutoRoll}
              className="sob-btn sob-btn-primary"
            >
              🎲 Auto-Roll
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="sob-btn"
                style={{ marginTop: '10px' }}
              >
                Cancel
              </button>
            )}
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
                backgroundColor: 'var(--sob-bg-secondary)',
                color: 'var(--sob-text-main)',
                border: '2px solid var(--sob-border)',
                borderRadius: '4px',
                marginBottom: '15px',
                boxSizing: 'border-box',
              }}
            />

            <div className="sob-dialog-actions">
              {onAutoRoll && (
                <button
                  type="button"
                  onClick={onAutoRoll}
                  className="sob-btn sob-btn-primary"
                >
                  🎲 Auto-Roll
                </button>
              )}

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="sob-btn"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="sob-btn sob-btn-success"
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
