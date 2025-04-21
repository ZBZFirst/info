  // certificateconfig.js


export const CERTIFICATE_TEMPLATE = {
  container: {
    border: '20px solid #1a5276', // Changed from 2px to 20px for thicker border
    padding: '2%', 
    margin: '0 auto',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '15px', // Optional: Add rounded corners
    boxShadow: '0 0 20px rgba(0,0,0,0.3)' // Optional: Add shadow for depth
  },
  
  template: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{title}}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/info/_css/certificate.css">
      <style>
        /* Inline critical CSS for print reliability */
        @page {
          size: auto;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="certificate" style="aspect-ratio:1/1; width:80vmin;">
        <h1>{{title}}</h1>
        
        <p>{{recipient.prefix}} <strong>{{recipient.name}}</strong></p>
        
        <p>has successfully completed the course</p>
        <h2>{{course}}</h2>
        
        <p>with a score of <strong>{{score}}</strong></p>
        <p>on {{date}}</p>
        
        {{#if logo}}
        <div class="logo">
          <img src="{{logo}}" alt="Logo" width="150">
        </div>
        {{/if}}
        
        <div class="signature">
          <div>
            <div class="signature-line"></div>
            <p>Signature</p>
          </div>
          <div>
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>
        
        <p class="certificate-id">Certificate ID: {{id}}</p>
      </div>
    </body>
    </html>
  `,
  
  fields: {
    title: {
      content: 'CERTIFICATE OF COMPLETION',
      editable: false,
      style: {
        fontSize: '28px',
        fontWeight: 'bold'
      }
    },
    recipient: {
      prefix: 'This certificate is awarded to ',
      editable: true,
      style: {
        fontSize: '20px'
      }
    },
    logo: {
      image: 'https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/quiz1/company-logo.jpg',
      editable: false,
      style: {
        width: '150px'
      }
    }
  }
};
