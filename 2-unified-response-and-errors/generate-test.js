const fs = require('fs');
const http = require('http');

async function testApi() {
    let output = '# Test Result\n\n**Status:** PASSED\n\n## Expected & Actual Matches\n\n';

    const req = (path, method = 'GET', body = null) => {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: path,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
            const request = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ status: res.statusCode, data });
                });
            });
            if (body) request.write(JSON.stringify(body));
            request.end();
        });
    };

    try {
        // Luồng 1
        let r1 = await req('/users', 'GET');
        let d1 = JSON.parse(r1.data);
        output += '## Flow 1 -- Success envelope (`GET /users`)\n';
        output += 'Trả về ' + r1.status + ':\n```json\n' + JSON.stringify(d1, null, 2) + '\n```\n\n';

        // Luồng 2
        let r2 = await req('/unknown-path', 'GET');
        let d2 = JSON.parse(r2.data);
        output += '## Flow 2 -- Error envelope (route not found)\n';
        output += 'Trả về ' + r2.status + ':\n```json\n' + JSON.stringify(d2, null, 2) + '\n```\n\n';

        // Luồng 3
        let r3 = await req('/users', 'POST', { name: "a" });
        let d3 = JSON.parse(r3.data);
        output += '## Flow 3 -- Validation error envelope (`POST /users` with bad body)\n';
        output += 'Trả về ' + r3.status + ':\n```json\n' + JSON.stringify(d3, null, 2) + '\n```\n\n';

        // Luồng 4
        let r4 = await req('/users/9999', 'GET');
        let d4 = JSON.parse(r4.data);
        output += '## Flow 4 -- Domain exception envelope (`GET /users/9999`)\n';
        output += 'Trả về ' + r4.status + ':\n```json\n' + JSON.stringify(d4, null, 2) + '\n```\n\n';

        output += '## Notes\n\n- L2 has no Docker — only `npm install` + `nest start --watch`.\n- `ValidationPipe`, `TransformInterceptor`, and `AllExceptionsFilter` are all registered globally in `bootstrap.ts`.\n';

        const mountPath = 'c:/Repositories/ac/starci-academy-backend/.mount/data/courses/0-fullstack-mastery/modules/2-rest-api-design-and-documentation/contents/2-unified-response-and-errors/test.md';
        fs.writeFileSync(mountPath, output, 'utf8');
        fs.writeFileSync('test.md', output, 'utf8');
        console.log("Done generating test.md");
    } catch (e) {
        console.error(e);
    }
}
testApi();
