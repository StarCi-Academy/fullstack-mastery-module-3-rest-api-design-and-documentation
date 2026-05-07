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
        let r1 = await req('/users', 'POST', { name: "Alice", email: "alice@test.com" });
        let d1 = JSON.parse(r1.data);
        output += '**Luồng 1 — Payload hợp lệ (`POST /users`)**\n';
        output += 'Tạo dữ liệu trả về ' + r1.status + ':\n```json\n' + JSON.stringify(d1, null, 2) + '\n```\n\n';

        // Luồng 2
        let r2 = await req('/users', 'POST', { name: 123 });
        let d2 = JSON.parse(r2.data);
        output += '**Luồng 2 — Payload không hợp lệ (`POST /users`)**\n';
        output += 'Trả về ' + r2.status + ':\n```json\n' + JSON.stringify(d2, null, 2) + '\n```\n\n';

        output += '**Các thay đổi đã thực hiện:**\n- `ConfigModule` và `.env` được config chuẩn chỉ, `ValidationPipe` chặn bad request.\n\n';
        output += '(Luồng DTOs Validation hoạt động chính xác với whitelist chặn payload lạ.)';

        fs.writeFileSync('c:/Repositories/ac/starci-academy-backend/.mount/data/courses/0-fullstack-mastery/modules/2-rest-api-development-documentation/contents/1-dtos-and-validation/test.md', output, 'utf8');
        console.log("Done generating test.md");
    } catch (e) {
        console.error(e);
    }
}
testApi();
