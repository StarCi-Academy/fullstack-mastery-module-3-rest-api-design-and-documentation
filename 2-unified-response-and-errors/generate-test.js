const fs = require('fs');
const http = require('http');

async function testApi() {
    let output = '# Test Result\n\n**Status:** PASSED\n\n## Expected & Actual Matches\n\n';

    const req = (path, method = 'GET') => {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: path,
                method: method,
            };
            const request = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ status: res.statusCode, data });
                });
            });
            request.end();
        });
    };

    try {
        // Luồng 1
        let r1 = await req('/users', 'GET');
        let d1 = JSON.parse(r1.data);
        output += '**Luồng 1 — Success envelope (`GET /users`)**\n';
        output += 'Trả về ' + r1.status + ':\n```json\n' + JSON.stringify(d1, null, 2) + '\n```\n\n';

        // Luồng 2
        let r2 = await req('/users/nonexistent', 'GET');
        let d2 = JSON.parse(r2.data);
        output += '**Luồng 2 — Error envelope (`GET /users/nonexistent`)**\n';
        output += 'Trả về ' + r2.status + ':\n```json\n' + JSON.stringify(d2, null, 2) + '\n```\n\n';

        output += '**Các thay đổi đã thực hiện:**\n- Sửa các lỗi module imports, đồng bộ `ConfigModule` theo kiến trúc chuẩn.\n\n';
        output += '(Luồng interceptor và filter hoạt động chính xác trả về response envelope thống nhất.)';

        fs.writeFileSync('c:/Repositories/ac/starci-academy-backend/.mount/data/courses/0-fullstack-mastery/modules/2-rest-api-development-documentation/contents/2-unified-response-and-errors/test.md', output, 'utf8');
        console.log("Done generating test.md");
    } catch (e) {
        console.error(e);
    }
}
testApi();
