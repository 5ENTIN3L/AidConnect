const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('./index');

async function withServer(run) {
    const server = app.listen(0);

    try {
        const { port } = server.address();
        await run(port);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
}

test('GET / returns service health message', async () => {
    await withServer(async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/`);
        const body = await response.text();

        assert.equal(response.status, 200);
        assert.equal(body, 'AidConnect API is running');
    });
});

test('returns 404 for unknown routes', async () => {
    await withServer(async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/missing-route`);

        assert.equal(response.status, 404);
    });
});

test('applies CORS headers on responses', async () => {
    await withServer(async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/`, {
            headers: {
                Origin: 'http://localhost:3000',
            },
        });

        assert.equal(response.status, 200);
        assert.equal(response.headers.get('access-control-allow-origin'), '*');
    });
});

test('returns 400 for malformed JSON payloads', async () => {
    const errorSpy = console.error;
    console.error = () => {};

    try {
        await withServer(async (port) => {
            const response = await fetch(`http://127.0.0.1:${port}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: '{"badJson":',
            });

            assert.equal(response.status, 400);
        });
    } finally {
        console.error = errorSpy;
    }
});