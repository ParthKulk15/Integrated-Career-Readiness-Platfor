const http = require('http');

const data = JSON.stringify({
  interviewDate: '2026-05-01T10:00:00',
  interviewLink: 'https://meet.google.com/abc',
  recruiterId: 1
});

// Assuming application 15 is valid. First let's get applications to find a valid one.
http.get('http://localhost:8080/applications/recent', (res1) => {
  let appData = '';
  res1.on('data', chunk => appData += chunk);
  res1.on('end', () => {
    try {
      const apps = JSON.parse(appData);
      if (apps.length === 0) {
        console.log("No applications found.");
        return;
      }
      const validAppId = apps[0].id;
      
      const req = http.request(`http://localhost:8080/applications/${validAppId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`Status for app ${validAppId}:`, res.statusCode);
          console.log("Response:", body);
        });
      });

      req.on('error', e => console.error(e));
      req.write(data);
      req.end();

    } catch (e) {
      console.error(e);
    }
  });
});
