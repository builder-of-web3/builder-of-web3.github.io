window.convert = function () {
  const input = document.getElementById('inputText').value.trim();
  const separatorInput = document.getElementById('separator').value || ',';
  const quoteType = document.querySelector('input[name="quote"]:checked').value;

  let quote = '';
  if (quoteType === 'single') quote = "'";
  if (quoteType === 'double') quote = '"';

  // Escape special regex characters in separator
  const escapedSeparator = separatorInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Split by newline OR custom separator
  const splitRegex = new RegExp(`\\r?\\n|${escapedSeparator}`);

  const values = input
    .split(splitRegex)
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .map(v => `${quote}${v}${quote}`);

  document.getElementById('outputText').value =
    values.join(',\n');
};
