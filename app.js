window.convert = function () {
  const input = document.getElementById('inputText').value;
  const separator = document.getElementById('separator').value || ',';
  const quoteType = document.querySelector('input[name="quote"]:checked').value;

  let quote = '';
  if (quoteType === 'single') quote = "'";
  if (quoteType === 'double') quote = '"';

  const values = input
    .split(separator)
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .map(v => `${quote}${v}${quote}`);

  document.getElementById('outputText').value =
    values.join(separator + ' ');
};
