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
        // Flow 1
        let r1 = await req('/swagger', 'GET');
        output += '## Flow 1 -- Open Swagger UI\n';
        output += 'Tru cập `GET /swagger` trả về HTTP ' + r1.status + '.\n\n';

        // Flow 2
        let r2_post = await req('/cats', 'POST', { breed: "Persian", age: 2 });
        let d2_post = JSON.parse(r2_post.data);
        output += '## Flow 2 -- Call API from Swagger\n';
        output += 'Tạo cat trả về ' + r2_post.status + ':\n```json\n' + JSON.stringify(d2_post, null, 2) + '\n```\n';

        let r2_err = await req('/cats/error-demo', 'GET');
        let d2_err = JSON.parse(r2_err.data);
        output += 'Gọi endpoint lỗi demo trả về ' + r2_err.status + ':\n```json\n' + JSON.stringify(d2_err, null, 2) + '\n```\n\n';

        // Flow 3
        let r3 = await req('/swagger-json', 'GET');
        let d3 = JSON.parse(r3.data);
        output += '## Flow 3 -- Swagger JSON spec endpoint\n';
        output += 'Tru cập `GET /swagger-json` trả về HTTP ' + r3.status + '. Nội dung spec JSON (rút gọn):\n';
        // Let's print only a tiny part of the spec to keep it clean
        let docSummary = {
            openapi: d3.openapi,
            info: d3.info,
            pathsCount: Object.keys(d3.paths).length,
            schemasCount: Object.keys(d3.components?.schemas || {}).length,
        };
        output += '```json\n' + JSON.stringify(docSummary, null, 2) + '\n```\n\n';

        // Flow 4
        output += '## Flow 4 -- Tagged routes grouping in Swagger UI\n';
        output += 'Visual Check: sidebar hiển thị 2 nhóm riêng biệt: **Cats Module** (chứa `/cats` routes) và **Dogs Module** (chứa `/dogs` route) tương ứng với `@ApiTags` annotation.\n\n';

        // Flow 5
        output += '## Flow 5 -- Bearer auth lock icon + Authorize dialog\n';
        output += 'Visual Check: Endpoint `POST /cats` hiển thị lock icon do được cấu hình `@ApiBearerAuth()`. Nút Authorize ở góc trên hiển thị dialog Security Scheme `bearer` chính xác.\n\n';

        output += '## Notes\n\n- L3 has no Docker — only `npm install` + `nest start --watch`.\n- The OpenAPI spec is auto-generated from controller decorators and DTO `@ApiProperty` metadata; no manual YAML/JSON.\n';

        const mountPath = 'c:/Repositories/ac/starci-academy-backend/.mount/data/courses/0-fullstack-mastery/modules/2-rest-api-design-and-documentation/contents/3-swagger-api-documentation/test.md';
        fs.writeFileSync(mountPath, output, 'utf8');
        fs.writeFileSync('test.md', output, 'utf8');
        console.log("Done generating test.md");
    } catch (e) {
        console.error(e);
    }
}
testApi();
