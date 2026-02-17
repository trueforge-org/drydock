import SelfHostedBasic from './SelfHostedBasic.js';

test('init should add protocol and strip trailing slash', async () => {
  const registry = new SelfHostedBasic();
  registry.configuration = {
    url: 'registry.acme.com///',
    login: 'robot',
    password: 'secret',
  };

  registry.init();

  expect(registry.configuration.url).toBe('https://registry.acme.com');
});

test('init should keep existing protocol and strip trailing slash', async () => {
  const registry = new SelfHostedBasic();
  registry.configuration = {
    url: 'http://registry.acme.com///',
    login: 'robot',
    password: 'secret',
  };

  registry.init();

  expect(registry.configuration.url).toBe('http://registry.acme.com');
});

test('match should compare hosts and handle malformed URLs', async () => {
  const registry = new SelfHostedBasic();
  registry.configuration = {
    url: 'https://registry.acme.com',
  };

  expect(
    registry.match({
      registry: {
        url: 'registry.acme.com/library/nginx',
      },
    }),
  ).toBeTruthy();

  expect(
    registry.match({
      registry: {
        url: '%',
      },
    }),
  ).toBeFalsy();
});

test('normalizeImage should point to configured v2 endpoint', async () => {
  const registry = new SelfHostedBasic();
  registry.configuration = {
    url: 'https://registry.acme.com',
  };

  expect(
    registry.normalizeImage({
      name: 'library/nginx',
      registry: {
        url: 'ignored.local',
      },
    }),
  ).toStrictEqual({
    name: 'library/nginx',
    registry: {
      url: 'https://registry.acme.com/v2',
    },
  });
});

test('maskConfiguration should mask password and auth', async () => {
  const registry = new SelfHostedBasic();
  registry.configuration = {
    url: 'https://registry.acme.com',
    password: 'secret',
    auth: Buffer.from('robot:secret', 'utf-8').toString('base64'),
  };

  expect(registry.maskConfiguration()).toEqual({
    url: 'https://registry.acme.com',
    password: 's****t',
    auth: 'c**************0',
  });
});

test('authenticate should apply basic auth from credentials', async () => {
  const registry = new SelfHostedBasic();
  registry.configuration = {
    url: 'https://registry.acme.com',
    login: 'robot',
    password: 'secret',
  };

  await expect(
    registry.authenticate(
      {
        name: 'library/nginx',
        registry: { url: 'registry.acme.com' },
      },
      { headers: {} },
    ),
  ).resolves.toEqual({
    headers: {
      Authorization: `Basic ${Buffer.from('robot:secret', 'utf-8').toString('base64')}`,
    },
  });
});
