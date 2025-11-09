import * as React from 'react';

interface EmailTemplateProps {
  children: React.ReactNode;
  title: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  children,
  title,
}) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #eaeaea',
    borderRadius: '5px'
  }}>
    {/* Header */}
    <div style={{
      textAlign: 'center',
      padding: '20px 0',
      borderBottom: '1px solid #eaeaea',
      marginBottom: '20px',
      position: 'relative'
    }}>
      <h1 style={{ margin: 0, color: '#333' }}>EventHosting</h1>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '60px',
        fontWeight: 'bold',
        opacity: 0.05,
        zIndex: -1,
        whiteSpace: 'nowrap'
      }}>
        EventHosting
      </div>
    </div>

    {/* Content */}
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </div>

    {/* Footer */}
    <div style={{
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #eaeaea',
      fontSize: '12px',
      color: '#666',
      textAlign: 'center'
    }}>
      <p>© {new Date().getFullYear()} EventHosting. All rights reserved.</p>
      <p>
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
  </div>
);
