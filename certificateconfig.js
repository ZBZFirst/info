// Add to your certificateconfig.js
export const CERTIFICATE_TEMPLATE = {
  // Layout configuration
  background: {
    image: '/images/cert-bg.jpg', // Optional background image
    opacity: 0.1 // For watermark effect
  },
  
  // Fields configuration
  fields: [
    {
      name: 'title',
      type: 'text',
      content: 'CERTIFICATE OF COMPLETION',
      editable: false,
      style: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1a5276',
        position: { top: '50px', left: '0', width: '100%' },
        textAlign: 'center'
      }
    },
    {
      name: 'recipient',
      type: 'text',
      source: 'User', // Pulls from currentCertificate.User
      editable: true,
      prefix: 'This certificate is awarded to ',
      style: {
        fontSize: '20px',
        position: { top: '120px', left: '0', width: '100%' },
        textAlign: 'center'
      }
    },
    {
      name: 'course',
      type: 'text',
      source: 'CourseID',
      editable: false, // Course name is not editable
      style: {
        fontSize: '18px',
        position: { top: '160px', left: '0', width: '100%' },
        textAlign: 'center'
      }
    },
    {
      name: 'logo',
      type: 'image',
      content: '/images/company-logo.png',
      editable: false,
      style: {
        width: '150px',
        position: { top: '20px', right: '20px' }
      }
    },
    {
      name: 'signature',
      type: 'image',
      content: '/images/signature.png',
      editable: true, // Allow changing signature image
      style: {
        width: '120px',
        position: { bottom: '80px', left: '100px' }
      }
    }
  ]
};

export const AUTH_CONFIG = {
  // Editable secret names (without exposing values)
  SECRET_NAMES: {
    ALLOWED_KEYS: "ALLOWED_KEYS",  // Name of the secret containing allowed keys
    ACCESS_PASSWORD: "test1"  // Name of the password secret
  },
