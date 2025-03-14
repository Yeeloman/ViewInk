// src/defaults.ts
export const DEFAULTS = {
    STYLES: {
        container: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000',
        },
        content: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '80%',
            position: 'relative',
        },
        iframe: {
            width: '100%',
            height: '80vh',
            border: 'none',
            borderRadius: '4px',
        },
    },
    SANDBOX: 'allow-scripts allow-same-origin',
};