import { escapeHtml, formatString } from '../utils';

describe('escapeHtml', () => {
  test('leaves plain text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  test('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('escapes less-than and greater-than', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  test('escapes double quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  test('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });

  test('escapes all special characters together', () => {
    expect(escapeHtml('<a href="test" data-x=\'y\'> & </a>')).toBe(
      '&lt;a href=&quot;test&quot; data-x=&#039;y&#039;&gt; &amp; &lt;/a&gt;'
    );
  });

  test('coerces numbers to string', () => {
    expect(escapeHtml(42)).toBe('42');
  });

  test('coerces null to string', () => {
    expect(escapeHtml(null)).toBe('null');
  });
});

describe('formatString', () => {
  test('replaces a single placeholder', () => {
    expect(formatString('Hello {0}!', 'World')).toBe('Hello World!');
  });

  test('replaces multiple placeholders', () => {
    expect(formatString('{0} and {1}', 'foo', 'bar')).toBe('foo and bar');
  });

  test('replaces all occurrences of the same placeholder', () => {
    expect(formatString('{0} is {0}', 'great')).toBe('great is great');
  });

  test('replaces three placeholders in order', () => {
    expect(formatString('Displaying items {0}-{1} of {2}', 1, 20, 100)).toBe(
      'Displaying items 1-20 of 100'
    );
  });

  test('returns template unchanged when no args', () => {
    expect(formatString('No placeholders')).toBe('No placeholders');
  });

  test('handles number arguments', () => {
    expect(formatString('Count: {0}', 5)).toBe('Count: 5');
  });
});
