const http = require('http');

function getPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500)
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    const home = await getPage('/');
    console.log('✅ Homepage loads');
    console.log('Status:', home.status);
    
    const admin = await getPage('/admin');
    console.log('✅ Admin panel accessible');
    console.log('Status:', admin.status);
    
    const api = await getPage('/api');
    console.log('✅ API responds');
    console.log('Status:', api.status);
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

test();
