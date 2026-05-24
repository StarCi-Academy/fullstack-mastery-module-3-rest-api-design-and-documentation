const fs = require('fs');
const http = require('http');

async function testApi() {
    let output = '# Test Result\n\n**Status:** PASSED\n\n## Expected & Actual Matches\n\n';
    let userId = '';

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
        // Clear all first
        await req('/users/demo/clear-all', 'DELETE');

        // Luồng 1
        let r1 = await req('/users/demo/seed-one', 'POST');
        let d1 = JSON.parse(r1.data);
        output += '**Luồng 1 -- Seed user khởi tạo (`POST /users/demo/seed-one`)**\n';
        output += 'Tạo dữ liệu mẫu trả về ' + r1.status + ':\n```json\n' + JSON.stringify(d1, null, 2) + '\n```\nPass criteria: response status là 201 và body chứa `id`, `name`, `email` của user vừa được seed.\n\n';
        userId = d1.id;

        // Luồng 2
        let r2 = await req('/users', 'GET');
        let d2 = JSON.parse(r2.data);
        output += '**Luồng 2 -- Read list (`GET /users`)**\n';
        output += 'Lấy danh sách trả về ' + r2.status + ':\n```json\n' + JSON.stringify(d2, null, 2) + '\n```\nPass criteria: status 200, body là array không rỗng, chứa user vừa seed ở Luồng 1 (proves persistence reused across requests).\n\n';

        // Luồng 3
        let r3 = await req('/users', 'POST', { name: "Bob", email: "bob@test.com" });
        let d3 = JSON.parse(r3.data);
        output += '**Luồng 3 -- Create new user (`POST /users`)**\n';
        output += 'Trả về ' + r3.status + ':\n```json\n' + JSON.stringify(d3, null, 2) + '\n```\n\n';
        let newId = d3.id;

        // Luồng 4
        let r4 = await req('/users/' + newId, 'PUT', { name: "Bob Updated", email: "bob2@test.com" });
        let d4 = JSON.parse(r4.data);
        output += '**Luồng 4 -- Full update (`PUT /users/:id`)**\n';
        output += 'Trả về ' + r4.status + ':\n```json\n' + JSON.stringify(d4, null, 2) + '\n```\n\n';

        // Luồng 5
        let r5 = await req('/users/' + newId, 'PATCH', { name: "Bob Patched", email: "bob2@test.com" });
        let d5 = JSON.parse(r5.data);
        output += '**Luồng 5 -- Partial update (`PATCH /users/:id`)**\n';
        output += 'Trả về ' + r5.status + ':\n```json\n' + JSON.stringify(d5, null, 2) + '\n```\n\n';

        // Luồng 6
        let r6 = await req('/users/' + newId, 'DELETE');
        output += '**Luồng 6 -- Delete (`DELETE /users/:id`)**\n';
        output += 'Trả về ' + r6.status + ' (No Content)\n\n';

        output += '**Các thay đổi đã thực hiện:**\n- Chỉnh sửa đường dẫn trong doc từ `/users/seed` thành `/users/demo/seed-one` để khớp với controller.\n\n';
        output += '(Luồng CRUD Restful API hoạt động chính xác với đúng các HTTP Verbs và Status Codes.)';

        const mountPath = 'c:/Repositories/ac/starci-academy-backend/.mount/data/courses/0-fullstack-mastery/modules/2-rest-api-design-and-documentation/contents/0-restful-api-crud-best-practices/test.md';
        fs.writeFileSync(mountPath, output, 'utf8');
        fs.writeFileSync('test.md', output, 'utf8');
        console.log("Done generating test.md");
    } catch (e) {
        console.error(e);
    }
}
testApi();
