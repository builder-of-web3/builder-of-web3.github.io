// Switch between tools
window.showTool = function (toolId, el) {
  document.querySelectorAll('.tool').forEach(tool =>
    tool.classList.remove('active')
  );

  document.querySelectorAll('.sidebar li').forEach(li =>
    li.classList.remove('active')
  );

  document.getElementById(toolId).classList.add('active');
  if (el) el.classList.add('active');
};

// Convert logic (supports any separator + newline)
window.convert = function () {
  const input = document.getElementById('inputText').value.trim();
  const separatorInput = document.getElementById('separator').value || ',';
  const quoteType = document.querySelector('input[name="quote"]:checked').value;

  let quote = '';
  if (quoteType === 'single') quote = "'";
  if (quoteType === 'double') quote = '"';

  // Escape regex special characters in separator
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
