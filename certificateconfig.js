export const CERTIFICATE_TEMPLATE = {
  // Layout configuration
  background: {
    image: '/images/cert-bg.jpg', // Path to background image
    size: 'cover', // CSS background-size
    position: 'center', // CSS background-position
    repeat: 'no-repeat', // CSS background-repeat
    opacity: 0.1 // Watermark effect
  },
  
  // Certificate container styling
  container: {
    border: '2px solid #1a5276',
    padding: '40px',
    margin: '20px auto',
    width: '800px',
    minHeight: '600px',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  
  // HTML template with placeholders
  template: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{title}}</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0;
          padding: 20px;
          {{#if background.image}}
          background: url('{{background.image}}') {{background.repeat}} {{background.position}}/{{background.size}};
          {{/if}}
        }
        .certificate {
          border: {{container.border}};
          padding: {{container.padding}};
          margin: {{container.margin}};
          width: {{container.width}};
          min-height: {{container.minHeight}};
          position: {{container.position}};
          background-color: {{container.backgroundColor}};
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        h1 { 
          color: #1a5276;
          font-size: 28px;
          margin-bottom: 30px;
        }
        .signature {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
        }
        .signature-line {
          border-top: 1px solid #333;
          width: 200px;
          display: inline-block;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
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
            <p>Authorized Signature</p>
          </div>
          <div>
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>
        
        <p class="certificate-id">Certificate ID: {{id}}</p>
      </div>
      <script>
        window.onload = function() { window.print(); setTimeout(() => window.close(), 1000); }
      </script>
    </body>
    </html>
  `,
  
  // Data mappings
  fields: {
    title: 'CERTIFICATE OF COMPLETION',
    recipient: {
      prefix: 'This certifies that'
    },
    logo: '/images/company-logo.png'
  }
};
