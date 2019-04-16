import rejects from '~/utils/rejects';

test(`rejects w/ error`, async () => {
  await expect(rejects(5)).rejects.toThrowErrorMatchingInlineSnapshot(
    `"An error occurred"`
  );
  await expect(
    rejects({ message: 10 })
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"10"`);
  await expect(rejects('Foo bar')).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Foo bar"`
  );
  await expect(
    rejects(Error('message'))
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"message"`);
  await expect(
    rejects(Error('message'), true)
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"message"`);
});

test(`doesn't reject on condition = false`, async () => {
  await expect(rejects('foo bar', false)).resolves.toBeUndefined();
  await expect(rejects(Error('Foo bar'), false)).resolves.toBeUndefined();
});
