import React from 'react';

function InputField({ label, type = 'text', name, value, onChange, placeholder }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.3rem' }}>{label}</label>}
            <input
                type={type}
                name={name}
                value={value}
                placeholder={placeholder || label}
                onChange={onChange}
                style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                }}
            />
        </div>
    );
}

export default InputField;
