import UUID from './UUID';

test('UUID v5 test with "helloworld" and URL namespace', () => {
  expect(UUID.v5('helloworld')).toBe('3fc82e1a-b051-595a-8564-27a096716d37');
});

test('UUID v5 test with "helloworld" and "e210405a-5a26-11eb-8d5f-f7c3d6b31759" namespace', () => {
  expect(UUID.v5('helloworld', 'e210405a-5a26-11eb-8d5f-f7c3d6b31759')).toBe(
    'f311befb-57c4-5645-8d4d-5e46f48530b8'
  );
});
