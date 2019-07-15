// @ts-nocheck
import Codeberg from './Codeberg.js';

const codeberg = new Codeberg();
codeberg.configuration = {
    url: 'https://codeberg.org',
};

test('init should set codeberg url', async () => {
    const cb = new Codeberg();
    cb.configuration = {};
    cb.init();
    expect(cb.configuration.url).toBe('https://codeberg.org');
});

test('normalizeImage should return the proper registry v2 endpoint', async () => {
    expect(
        codeberg.normalizeImage({
            name: 'test/image',
            registry: {
                url: 'codeberg.org/test/image',
            },
        }),
    ).toStrictEqual({
        name: 'test/image',
        registry: {
            url: 'https://codeberg.org/v2',
        },
    });
});
