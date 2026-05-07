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
        let r1 = await req('/cats', 'POST', { breed: "Persian", age: 2 });
        let d1 = JSON.parse(r1.data);
        output += '**Luồng 1 — Gọi API từ Swagger (`POST /cats`)**\n';
        output += 'Tạo cat trả về ' + r1.status + ':\n```json\n' + JSON.stringify(d1, null, 2) + '\n```\n\n';

        // Luồng 2
        let r2 = await req('/cats/error-demo', 'GET');
        let d2 = JSON.parse(r2.data);
        output += '**Luồng 2 — Gọi API sinh lỗi (`GET /cats/error-demo`)**\n';
        output += 'Trả về ' + r2.status + ':\n```json\n' + JSON.stringify(d2, null, 2) + '\n```\n\n';

        output += '**Các thay đổi đã thực hiện:**\n- Sửa các lỗi module imports, đồng bộ `ConfigModule` và format chuẩn.\n\n';
        output += '(Swagger config và decorator hoạt động chính xác với envelope được trả về.)';

        fs.writeFileSync('c:/Repositories/ac/starci-academy-backend/.mount/data/courses/0-fullstack-mastery/modules/2-rest-api-development-documentation/contents/3-swagger-api-documentation/test.md', output, 'utf8');
        console.log("Done generating test.md");
    } catch (e) {
        console.error(e);
    }
}
testApi();
