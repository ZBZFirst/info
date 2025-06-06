  // certificateconfig.js

export const CERTIFICATE_TEMPLATE = {  
  template: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{title}}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/info/_css/certificate.css">
      <style>
        @page { size: auto; margin: 0; }
      </style>
    </head>
    <body>
      <div class="certificate" style="aspect-ratio:1/1; width:80vmin;">
        <h1>{{title}}</h1>
        
        <p>{{recipient.prefix}}</p> 
        <p><strong>{{recipient.name}}</strong></p>
        
        <p>has successfully completed the course</p>
        <h2>{{course}}</h2>
        
        <p>with a score of <strong>{{score}}</strong></p>
        
        <div class="logos-container">
          <div class="logo left-logo">
            <img src="{{logo}}" alt="Company Logo" width="150">
          </div>
          <div class="logo right-logo">
            <img src="{{secondLogo}}" alt="Partner Logo" width="150">
          </div>
        </div>
        
        <div class="signature">
          <div class="signature-block">
            <img src="{{educatorSignature}}" alt="Educator Signature" class="signature-image">
            <div class="educator-signature-line"></div>
            <p>Educator Signature</p>
          </div>
          <div class="signature-block">
            <p>{{date}}</p>
            <div class="date-line"></div>
            <p>Date</p>
          </div>
        </div>
        
        <p class="certificate-id">{{recipient.name}} License ID: {{id}}</p>
      </div>
    </body>
    </html>
  `,
  
  fields: {
    title: {
      content: 'CERTIFICATE OF COMPLETION',
      editable: false,
      style: { fontSize: '28px', fontWeight: 'bold' }
    },
    recipient: {
      prefix: 'This certificate is awarded to ',
      editable: true,
      style: { fontSize: '20px' }
    },
    logo: {
      image: 'https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/quiz1/company-logo.jpg',
      editable: false,
      style: { width: '150px' }
    },
    secondLogo: {
      image: 'https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/quiz1/another-company-logo.jpg',
      editable: false,
      style: { width: '150px' }
    },
    educatorSignature: {
      image: 'https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/quiz1/digital.jpg',
      editable: false,
      style: { width: '150px' }
    }
  }
};










