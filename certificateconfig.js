export const CERTIFICATE_TEMPLATE = {
  // Layout configuration
  background: {
    image: 'https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/company-logo.jpg', // Path to background image
    size: 'cover', // CSS background-size
    position: 'center', // CSS background-position
    repeat: 'no-repeat', // CSS background-repeat
    opacity: 0.1 // Watermark effect
  },
  
  container: {
    border: '2px solid #1a5276',
    /* Remove fixed width/height/padding */
    padding: '2%', // Proportional padding
    margin: '0 auto', // Center
    backgroundColor: 'rgba(255,255,255,0.9)'
  }
  
  // HTML template with placeholders
  template: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>{{title}}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="_css/certificate.css">
      <style>
        /* Inline critical CSS for print reliability */
        @page {
          size: auto;
          margin: 0;
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
          <img src="{{logo}}" alt="Logo" width="150" onload="window.print()">
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
      <script>
        // Improved print handling
        window.onload = function() {
          // Check if all images are loaded
          const images = document.images;
          let loaded = images.length;
          
          if (loaded === 0) {
            window.print();
            setTimeout(() => window.close(), 1000);
            return;
          }
          
          for (let i = 0; i < images.length; i++) {
            if (images[i].complete) loaded--;
            images[i].onload = function() {
              if (--loaded <= 0) {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            };
            images[i].onerror = function() {
              if (--loaded <= 0) {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            };
          }
        };
      </script>
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
      image: 'https://raw.githubusercontent.com/ZBZFirst/info/refs/heads/main/company-logo.jpg',
      editable: false,
      style: {
        width: '150px'
      }
    }
  }
};
