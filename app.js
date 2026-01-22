/* ============================================
   Dev Utilities - Application Logic
   ============================================ */

// ============================================
// Tool Navigation
// ============================================

function showTool(toolId, element) {
  // Hide all tools
  document.querySelectorAll('.tool').forEach(tool => {
    tool.classList.remove('active');
  });

  // Remove active state from all sidebar items
  document.querySelectorAll('.sidebar li').forEach(li => {
    li.classList.remove('active');
  });

  // Show selected tool
  document.getElementById(toolId).classList.add('active');

  // Mark sidebar item as active
  if (element) {
    element.classList.add('active');
  }
}

// ============================================
// Utility Functions
// ============================================

function clearInput(elementId) {
  document.getElementById(elementId).value = '';
  updateCounts();
}

async function pasteClipboard(elementId) {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById(elementId).value = text;
    updateCounts();
  } catch (err) {
    alert('Unable to access clipboard. Please paste manually.');
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent || element.innerText;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!');
  });
}

function downloadOutput(elementId, filename) {
  const element = document.getElementById(elementId);
  const text = element.textContent || element.innerText;

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showToast(message) {
  // Create toast if it doesn't exist
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2000);
}

function toggleCustomInput(prefix) {
  const select = document.getElementById(prefix + 'Type');
  const custom = document.getElementById(prefix + 'Custom');

  if (select.value === 'custom') {
    custom.classList.remove('hidden');
  } else {
    custom.classList.add('hidden');
  }
}

function toggleCustomOutput(prefix) {
  const select = document.getElementById(prefix + 'Type');
  const custom = document.getElementById(prefix + 'Custom');

  if (select.value === 'custom') {
    custom.classList.remove('hidden');
  } else {
    custom.classList.add('hidden');
  }
}

// ============================================
// COMMA QUOTE TOOL
// ============================================

function convertCommaQuote() {
  const input = document.getElementById('commaInput').value;

  // Get input separator
  const inputSepType = document.getElementById('inputSepType').value;
  let inputSep;
  switch (inputSepType) {
    case 'newline': inputSep = /\r?\n/; break;
    case 'comma': inputSep = /,/; break;
    case 'tab': inputSep = /\t/; break;
    case 'space': inputSep = /\s+/; break;
    case 'custom':
      const customSep = document.getElementById('inputSepCustom').value || ',';
      inputSep = new RegExp(escapeRegex(customSep));
      break;
    default: inputSep = /\r?\n/;
  }

  // Split input
  let values = input.split(inputSep);

  // Process options
  if (document.getElementById('trimWhitespace').checked) {
    values = values.map(v => v.trim());
  }

  if (document.getElementById('removeEmpty').checked) {
    values = values.filter(v => v.length > 0);
  }

  if (document.getElementById('removeDuplicates').checked) {
    values = [...new Set(values)];
  }

  if (document.getElementById('sortOutput').checked) {
    values.sort((a, b) => a.localeCompare(b));
  }

  // Get quote style
  const quote = document.querySelector('input[name="quoteType"]:checked').value;

  // Apply quotes
  values = values.map(v => quote + v + quote);

  // Get output separator
  const outputSepType = document.getElementById('outputSepType').value;
  let outputSep;
  if (outputSepType === 'custom') {
    outputSep = document.getElementById('outputSepCustom').value || ',';
  } else {
    outputSep = outputSepType.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  }

  // Join values
  let result = values.join(outputSep);

  // Wrap with brackets if needed
  if (document.getElementById('wrapBrackets').checked) {
    result = '[' + result + ']';
  }

  // Display output
  document.getElementById('commaOutput').textContent = result;
  document.getElementById('commaOutputCount').textContent = values.length;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// LIST DIFF TOOL
// ============================================

function compareListDiff() {
  const listAText = document.getElementById('listA').value;
  const listBText = document.getElementById('listB').value;

  const caseSensitive = document.getElementById('listCaseSensitive').checked;
  const trimSpaces = document.getElementById('listTrimSpaces').checked;
  const ignoreEmpty = document.getElementById('listIgnoreEmpty').checked;

  // Parse lists
  let listA = listAText.split(/\r?\n/);
  let listB = listBText.split(/\r?\n/);

  // Normalize function
  const normalize = (v) => {
    if (trimSpaces) v = v.trim();
    if (!caseSensitive) v = v.toLowerCase();
    return v;
  };

  // Process lists
  const processedA = listA.map(item => ({
    original: trimSpaces ? item.trim() : item,
    normalized: normalize(item)
  })).filter(item => !ignoreEmpty || item.normalized.length > 0);

  const processedB = listB.map(item => ({
    original: trimSpaces ? item.trim() : item,
    normalized: normalize(item)
  })).filter(item => !ignoreEmpty || item.normalized.length > 0);

  // Create sets for comparison
  const setA = new Set(processedA.map(i => i.normalized));
  const setB = new Set(processedB.map(i => i.normalized));

  // Find differences
  const aOnly = processedA.filter(item => !setB.has(item.normalized));
  const bOnly = processedB.filter(item => !setA.has(item.normalized));
  const common = processedA.filter(item => setB.has(item.normalized));

  // Remove duplicates while preserving order
  const uniqueAOnly = [...new Map(aOnly.map(i => [i.normalized, i])).values()];
  const uniqueBOnly = [...new Map(bOnly.map(i => [i.normalized, i])).values()];
  const uniqueCommon = [...new Map(common.map(i => [i.normalized, i])).values()];

  // Display results
  document.getElementById('aOnlyResult').textContent = uniqueAOnly.map(i => i.original).join('\n');
  document.getElementById('bOnlyResult').textContent = uniqueBOnly.map(i => i.original).join('\n');
  document.getElementById('commonResult').textContent = uniqueCommon.map(i => i.original).join('\n');

  // Update badges
  document.getElementById('aOnlyBadge').textContent = uniqueAOnly.length;
  document.getElementById('bOnlyBadge').textContent = uniqueBOnly.length;
  document.getElementById('commonBadge').textContent = uniqueCommon.length;

  // Show summary
  const summaryPanel = document.getElementById('listDiffSummary');
  summaryPanel.style.display = 'flex';

  document.getElementById('summaryATotal').textContent = [...new Set(processedA.map(i => i.normalized))].length;
  document.getElementById('summaryBTotal').textContent = [...new Set(processedB.map(i => i.normalized))].length;

  // Calculate similarity (Jaccard index)
  const union = new Set([...setA, ...setB]);
  const intersection = uniqueCommon.length;
  const similarity = union.size > 0 ? Math.round((intersection / union.size) * 100) : 0;
  document.getElementById('summarySimilarity').textContent = similarity + '%';
}

// ============================================
// JSON TOOLS
// ============================================

function switchJsonMode(mode, element) {
  // Update tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');

  // Show/hide modes
  document.querySelectorAll('.json-mode').forEach(m => m.classList.remove('active'));
  document.getElementById('json' + mode.charAt(0).toUpperCase() + mode.slice(1) + 'Mode').classList.add('active');
}

function formatJSON() {
  const input = document.getElementById('jsonParseInput').value;
  const statusBar = document.getElementById('jsonParseStatus');

  try {
    let parsed = JSON.parse(input);

    // Sort keys if option is checked
    if (document.getElementById('jsonSortKeys').checked) {
      parsed = sortObjectKeys(parsed);
    }

    // Get indentation
    const indentOption = document.getElementById('jsonIndent').value;
    let indent;
    if (indentOption === 'tab') {
      indent = '\t';
    } else {
      indent = parseInt(indentOption);
    }

    const formatted = JSON.stringify(parsed, null, indent);

    // Apply syntax highlighting
    document.getElementById('jsonParseOutput').innerHTML = syntaxHighlightJSON(formatted);

    // Update status
    statusBar.className = 'status-bar valid';
    statusBar.innerHTML = '<span class="status-icon">✓</span> Valid JSON - Formatted successfully';

  } catch (e) {
    document.getElementById('jsonParseOutput').textContent = '';
    statusBar.className = 'status-bar invalid';
    statusBar.innerHTML = '<span class="status-icon">✗</span> Invalid JSON: ' + e.message;
  }
}

function minifyJSON() {
  const input = document.getElementById('jsonParseInput').value;
  const statusBar = document.getElementById('jsonParseStatus');

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);

    document.getElementById('jsonParseOutput').textContent = minified;

    statusBar.className = 'status-bar valid';
    statusBar.innerHTML = '<span class="status-icon">✓</span> Valid JSON - Minified successfully';

  } catch (e) {
    document.getElementById('jsonParseOutput').textContent = '';
    statusBar.className = 'status-bar invalid';
    statusBar.innerHTML = '<span class="status-icon">✗</span> Invalid JSON: ' + e.message;
  }
}

function validateJSON() {
  const input = document.getElementById('jsonParseInput').value;
  const statusBar = document.getElementById('jsonParseStatus');

  if (!input.trim()) {
    statusBar.className = 'status-bar';
    statusBar.innerHTML = '<span class="status-icon">⬤</span> Enter JSON to validate';
    document.getElementById('jsonParseOutput').textContent = '';
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const type = Array.isArray(parsed) ? 'Array' : typeof parsed;
    const size = Array.isArray(parsed) ? parsed.length + ' items' : Object.keys(parsed).length + ' keys';

    statusBar.className = 'status-bar valid';
    statusBar.innerHTML = `<span class="status-icon">✓</span> Valid JSON - Type: ${type}, ${size}`;

    document.getElementById('jsonParseOutput').innerHTML = syntaxHighlightJSON(JSON.stringify(parsed, null, 2));

  } catch (e) {
    statusBar.className = 'status-bar invalid';
    statusBar.innerHTML = '<span class="status-icon">✗</span> Invalid JSON: ' + e.message;
    document.getElementById('jsonParseOutput').textContent = 'Error at: ' + findErrorPosition(input, e.message);
  }
}

function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = sortObjectKeys(obj[key]);
      return sorted;
    }, {});
}

function syntaxHighlightJSON(json) {
  // Escape HTML first
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function(match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    }
  );
}

function findErrorPosition(input, errorMsg) {
  // Try to extract position from error message
  const posMatch = errorMsg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    const before = input.substring(Math.max(0, pos - 20), pos);
    const after = input.substring(pos, Math.min(input.length, pos + 20));
    return `...${before}[HERE]${after}...`;
  }
  return errorMsg;
}

// ============================================
// JSON DIFF
// ============================================

function compareJSONDiff() {
  const jsonAText = document.getElementById('jsonDiffA').value;
  const jsonBText = document.getElementById('jsonDiffB').value;
  const statusA = document.getElementById('jsonAStatus');
  const statusB = document.getElementById('jsonBStatus');
  const output = document.getElementById('jsonDiffOutput');
  const summary = document.getElementById('jsonDiffSummary');

  let jsonA, jsonB;
  let hasError = false;

  // Parse JSON A
  try {
    jsonA = JSON.parse(jsonAText);
    statusA.className = 'status-bar valid';
    statusA.innerHTML = '<span class="status-icon">✓</span> Valid JSON';
  } catch (e) {
    statusA.className = 'status-bar invalid';
    statusA.innerHTML = '<span class="status-icon">✗</span> Invalid: ' + e.message;
    hasError = true;
  }

  // Parse JSON B
  try {
    jsonB = JSON.parse(jsonBText);
    statusB.className = 'status-bar valid';
    statusB.innerHTML = '<span class="status-icon">✓</span> Valid JSON';
  } catch (e) {
    statusB.className = 'status-bar invalid';
    statusB.innerHTML = '<span class="status-icon">✗</span> Invalid: ' + e.message;
    hasError = true;
  }

  if (hasError) {
    output.innerHTML = '<div style="color: #f87171; padding: 20px;">Please fix JSON errors before comparing.</div>';
    summary.style.display = 'none';
    return;
  }

  // Perform diff
  const ignoreOrder = document.getElementById('jsonIgnoreOrder').checked;
  const showUnchanged = document.getElementById('jsonShowUnchanged').checked;

  const diffResult = deepDiff(jsonA, jsonB, '', ignoreOrder);

  // Render diff output
  output.innerHTML = renderDiff(diffResult, showUnchanged);

  // Update summary
  const stats = countDiffStats(diffResult);
  summary.style.display = 'flex';
  document.getElementById('diffAdded').textContent = stats.added;
  document.getElementById('diffRemoved').textContent = stats.removed;
  document.getElementById('diffChanged').textContent = stats.changed;
  document.getElementById('diffUnchanged').textContent = stats.unchanged;
}

function deepDiff(a, b, path = '', ignoreArrayOrder = false) {
  const result = [];

  // Handle null/undefined
  if (a === null || a === undefined || b === null || b === undefined) {
    if (a === b) {
      result.push({ type: 'unchanged', path, value: a });
    } else if (a === null || a === undefined) {
      result.push({ type: 'added', path, value: b });
    } else {
      result.push({ type: 'removed', path, value: a });
    }
    return result;
  }

  // Handle different types
  if (typeof a !== typeof b) {
    result.push({ type: 'changed', path, oldValue: a, newValue: b });
    return result;
  }

  // Handle primitives
  if (typeof a !== 'object') {
    if (a === b) {
      result.push({ type: 'unchanged', path, value: a });
    } else {
      result.push({ type: 'changed', path, oldValue: a, newValue: b });
    }
    return result;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (ignoreArrayOrder) {
      // Compare as sets (ignoring order)
      const aStr = a.map(i => JSON.stringify(i)).sort();
      const bStr = b.map(i => JSON.stringify(i)).sort();

      const aSet = new Set(aStr);
      const bSet = new Set(bStr);

      aStr.forEach((item, i) => {
        if (!bSet.has(item)) {
          result.push({ type: 'removed', path: path + '[' + i + ']', value: a[i] });
        } else {
          result.push({ type: 'unchanged', path: path + '[' + i + ']', value: a[i] });
        }
      });

      bStr.forEach((item, i) => {
        if (!aSet.has(item)) {
          result.push({ type: 'added', path: path + '[' + i + ']', value: b[i] });
        }
      });
    } else {
      const maxLen = Math.max(a.length, b.length);
      for (let i = 0; i < maxLen; i++) {
        const itemPath = path + '[' + i + ']';
        if (i >= a.length) {
          result.push({ type: 'added', path: itemPath, value: b[i] });
        } else if (i >= b.length) {
          result.push({ type: 'removed', path: itemPath, value: a[i] });
        } else {
          result.push(...deepDiff(a[i], b[i], itemPath, ignoreArrayOrder));
        }
      }
    }
    return result;
  }

  // Handle objects
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  allKeys.forEach(key => {
    const keyPath = path ? path + '.' + key : key;

    if (!(key in a)) {
      result.push({ type: 'added', path: keyPath, value: b[key] });
    } else if (!(key in b)) {
      result.push({ type: 'removed', path: keyPath, value: a[key] });
    } else {
      result.push(...deepDiff(a[key], b[key], keyPath, ignoreArrayOrder));
    }
  });

  return result;
}

function renderDiff(diffResult, showUnchanged) {
  if (diffResult.length === 0) {
    return '<div style="color: #94a3b8; padding: 20px; text-align: center;">No differences found - JSON objects are identical</div>';
  }

  let html = '';

  // Group by type for better organization
  const added = diffResult.filter(d => d.type === 'added');
  const removed = diffResult.filter(d => d.type === 'removed');
  const changed = diffResult.filter(d => d.type === 'changed');
  const unchanged = diffResult.filter(d => d.type === 'unchanged');

  // Check if identical
  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    return '<div style="color: #4ade80; padding: 20px; text-align: center;">✓ JSON objects are identical</div>';
  }

  // Render removed items
  removed.forEach(item => {
    html += `<div class="diff-line removed">- <span class="diff-key">${item.path}</span>: ${formatDiffValue(item.value)}</div>`;
  });

  // Render added items
  added.forEach(item => {
    html += `<div class="diff-line added">+ <span class="diff-key">${item.path}</span>: ${formatDiffValue(item.value)}</div>`;
  });

  // Render changed items
  changed.forEach(item => {
    html += `<div class="diff-line changed">~ <span class="diff-key">${item.path}</span>: ${formatDiffValue(item.oldValue)} → ${formatDiffValue(item.newValue)}</div>`;
  });

  // Render unchanged items if requested
  if (showUnchanged) {
    unchanged.forEach(item => {
      html += `<div class="diff-line unchanged">  <span class="diff-key">${item.path}</span>: ${formatDiffValue(item.value)}</div>`;
    });
  }

  return html;
}

function formatDiffValue(value) {
  if (value === null) return '<span class="diff-null">null</span>';
  if (value === undefined) return '<span class="diff-null">undefined</span>';
  if (typeof value === 'string') return '<span class="diff-string">"' + escapeHtml(value) + '"</span>';
  if (typeof value === 'number') return '<span class="diff-number">' + value + '</span>';
  if (typeof value === 'boolean') return '<span class="diff-boolean">' + value + '</span>';
  if (typeof value === 'object') {
    const json = JSON.stringify(value);
    if (json.length > 50) {
      return '<span class="diff-string">' + escapeHtml(json.substring(0, 50)) + '...</span>';
    }
    return '<span class="diff-string">' + escapeHtml(json) + '</span>';
  }
  return String(value);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

function countDiffStats(diffResult) {
  return {
    added: diffResult.filter(d => d.type === 'added').length,
    removed: diffResult.filter(d => d.type === 'removed').length,
    changed: diffResult.filter(d => d.type === 'changed').length,
    unchanged: diffResult.filter(d => d.type === 'unchanged').length
  };
}

// ============================================
// Input Tracking / Counts
// ============================================

function updateCounts() {
  // Comma Quote counts
  const commaInput = document.getElementById('commaInput');
  if (commaInput) {
    const value = commaInput.value;
    document.getElementById('commaInputCount').textContent = value.length;
    document.getElementById('commaLineCount').textContent = value.split(/\r?\n/).filter(l => l.trim()).length;
  }

  // List diff counts
  const listA = document.getElementById('listA');
  const listB = document.getElementById('listB');
  if (listA) {
    document.getElementById('listACount').textContent = listA.value.split(/\r?\n/).filter(l => l.trim()).length;
  }
  if (listB) {
    document.getElementById('listBCount').textContent = listB.value.split(/\r?\n/).filter(l => l.trim()).length;
  }
}

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Add input event listeners for character/line counting
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('input', updateCounts);
  });

  // Initialize counts
  updateCounts();

  // Real-time JSON validation
  const jsonParseInput = document.getElementById('jsonParseInput');
  if (jsonParseInput) {
    jsonParseInput.addEventListener('input', function() {
      const statusBar = document.getElementById('jsonParseStatus');
      const value = this.value.trim();

      if (!value) {
        statusBar.className = 'status-bar';
        statusBar.innerHTML = '<span class="status-icon">⬤</span> Ready';
        return;
      }

      try {
        JSON.parse(value);
        statusBar.className = 'status-bar valid';
        statusBar.innerHTML = '<span class="status-icon">✓</span> Valid JSON';
      } catch (e) {
        statusBar.className = 'status-bar invalid';
        statusBar.innerHTML = '<span class="status-icon">✗</span> ' + e.message;
      }
    });
  }

  // Real-time validation for JSON diff inputs
  ['jsonDiffA', 'jsonDiffB'].forEach(id => {
    const input = document.getElementById(id);
    const statusId = id === 'jsonDiffA' ? 'jsonAStatus' : 'jsonBStatus';

    if (input) {
      input.addEventListener('input', function() {
        const statusBar = document.getElementById(statusId);
        const value = this.value.trim();

        if (!value) {
          statusBar.className = 'status-bar';
          statusBar.innerHTML = '<span class="status-icon">⬤</span> Ready';
          return;
        }

        try {
          JSON.parse(value);
          statusBar.className = 'status-bar valid';
          statusBar.innerHTML = '<span class="status-icon">✓</span> Valid JSON';
        } catch (e) {
          statusBar.className = 'status-bar invalid';
          statusBar.innerHTML = '<span class="status-icon">✗</span> ' + e.message;
        }
      });
    }
  });
});

// Make functions globally available
window.showTool = showTool;

// ============================================
// WORLD CLOCK TOOL
// ============================================

let clockInterval = null;
let clocksRunning = true;

// Timezone configurations
const timezones = {
  UTC: { offset: 0, name: 'UTC', iana: 'UTC' },
  IST: { offset: 5.5 * 60, name: 'IST', iana: 'Asia/Kolkata' },
  CLT: { offset: -3 * 60, name: 'CLT', iana: 'America/Santiago', hasDST: true },
  Lima: { offset: -5 * 60, name: 'Lima', iana: 'America/Lima' },
  Bogota: { offset: -5 * 60, name: 'Bogota', iana: 'America/Bogota' }
};

// Check if date is in Chile DST (first Sunday in September to first Sunday in April)
// Chile DST: CLST (UTC-3) in summer, CLT (UTC-4) in winter
function isChileDST(date) {
  const year = date.getUTCFullYear();

  // First Sunday in September (DST starts - clocks go forward)
  let sepFirst = new Date(Date.UTC(year, 8, 1));
  let dstStart = new Date(Date.UTC(year, 8, 1 + (7 - sepFirst.getUTCDay()) % 7, 4)); // midnight Chile = 4 AM UTC

  // First Sunday in April (DST ends - clocks go back)
  let aprFirst = new Date(Date.UTC(year, 3, 1));
  let dstEnd = new Date(Date.UTC(year, 3, 1 + (7 - aprFirst.getUTCDay()) % 7, 3)); // midnight Chile = 3 AM UTC

  // Chile DST is from September to April (Southern Hemisphere)
  // So DST is active from September to December, and January to April
  return date >= dstStart || date < dstEnd;
}

// Get offset for a timezone considering DST
function getTimezoneOffset(tzName, date = new Date()) {
  const tz = timezones[tzName];
  if (!tz) return 0;

  let offset = tz.offset;

  // Adjust for Chile DST (CLT becomes CLST)
  // In DST (summer): UTC-3, In standard (winter): UTC-4
  if (tz.hasDST && tzName === 'CLT') {
    if (!isChileDST(date)) {
      offset = -4 * 60; // Winter time (CLT)
    }
    // else offset stays at -3 (CLST - summer time)
  }

  return offset;
}

// Format time as HH:MM:SS with AM/PM indicator (using UTC methods to avoid local timezone conversion)
function formatTime(date) {
  const hours24 = date.getUTCHours();
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');

  // 24-hour format
  const h24 = String(hours24).padStart(2, '0');

  // 12-hour format with AM/PM
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 < 12 ? 'AM' : 'PM';

  // Return both formats: "17:09:50 (5:09 PM)"
  return `${h24}:${m}:${s} (${hours12}:${m} ${ampm})`;
}

// Format date as Mon, Jan 22 (using UTC methods to avoid local timezone conversion)
function formatDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

// Get time in a specific timezone (returns a Date where UTC methods show the target timezone time)
function getTimeInTimezone(tzName, sourceDate = new Date()) {
  const offset = getTimezoneOffset(tzName, sourceDate);
  // Get UTC timestamp from source date
  const utcTime = sourceDate.getTime();
  // Add offset to get the target timezone time, stored in UTC position
  return new Date(utcTime + offset * 60000);
}

// Update all live clocks
function updateLiveClocks() {
  const now = new Date();

  // UTC
  const utcTime = getTimeInTimezone('UTC', now);
  document.getElementById('liveUTC').textContent = formatTime(utcTime);
  document.getElementById('liveDateUTC').textContent = formatDate(utcTime);

  // IST
  const istTime = getTimeInTimezone('IST', now);
  document.getElementById('liveIST').textContent = formatTime(istTime);
  document.getElementById('liveDateIST').textContent = formatDate(istTime);

  // CLT (Chile)
  const cltTime = getTimeInTimezone('CLT', now);
  document.getElementById('liveCLT').textContent = formatTime(cltTime);
  document.getElementById('liveDateCLT').textContent = formatDate(cltTime);

  // Update CLT offset display based on DST
  const cltOffsetEl = document.getElementById('cltOffset');
  if (cltOffsetEl) {
    cltOffsetEl.textContent = isChileDST(now) ? 'UTC -3:00 (CLST)' : 'UTC -4:00 (CLT)';
  }

  // Lima
  const limaTime = getTimeInTimezone('Lima', now);
  document.getElementById('liveLima').textContent = formatTime(limaTime);
  document.getElementById('liveDateLima').textContent = formatDate(limaTime);

  // Bogota
  const bogotaTime = getTimeInTimezone('Bogota', now);
  document.getElementById('liveBogota').textContent = formatTime(bogotaTime);
  document.getElementById('liveDateBogota').textContent = formatDate(bogotaTime);
}

// Toggle live clocks
function toggleLiveClocks() {
  const btn = document.getElementById('toggleLiveClocks');

  if (clocksRunning) {
    clearInterval(clockInterval);
    clockInterval = null;
    clocksRunning = false;
    btn.textContent = 'Resume';
  } else {
    startLiveClocks();
    clocksRunning = true;
    btn.textContent = 'Pause';
  }
}

// Start live clocks
function startLiveClocks() {
  updateLiveClocks();
  clockInterval = setInterval(updateLiveClocks, 1000);
}

// Set current time in converter
function setCurrentTime() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 8);

  document.getElementById('inputDate').value = dateStr;
  document.getElementById('inputTime').value = timeStr;
  document.getElementById('sourceTimezone').value = 'UTC';

  convertTime();
}

// Clear converter
function clearConverter() {
  document.getElementById('inputDate').value = '';
  document.getElementById('inputTime').value = '';
  document.getElementById('utcQuickInput').value = '';

  ['UTC', 'IST', 'CLT', 'Lima', 'Bogota'].forEach(tz => {
    document.getElementById('converted' + tz).textContent = '--:--:--';
    document.getElementById('convertedDate' + tz).textContent = '---';
  });
}

// Parse UTC datetime input (format: 2026-01-22 11:23:44.073)
function parseUTCInput() {
  const input = document.getElementById('utcQuickInput').value.trim();

  if (!input) {
    return;
  }

  // Parse format: YYYY-MM-DD HH:MM:SS.mmm or YYYY-MM-DD HH:MM:SS
  const regex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;
  const match = input.match(regex);

  if (!match) {
    return; // Invalid format, just don't convert
  }

  const [, year, month, day, hours, minutes, seconds, ms = '0'] = match;

  // Create UTC date
  const utcDate = new Date(Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds),
    parseInt(ms.padEnd(3, '0'))
  ));

  if (isNaN(utcDate.getTime())) {
    return; // Invalid date
  }

  // Convert to all timezones
  convertFromUTCDate(utcDate);
}

// Paste from clipboard and convert UTC
async function pasteAndConvertUTC() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('utcQuickInput').value = text.trim();
    parseUTCInput();
  } catch (err) {
    alert('Unable to access clipboard. Please paste manually.');
  }
}

// Convert from a UTC Date object to all timezones
function convertFromUTCDate(utcDate) {
  const utcTime = utcDate.getTime();

  ['UTC', 'IST', 'CLT', 'Lima', 'Bogota'].forEach(tz => {
    const offset = getTimezoneOffset(tz, utcDate);
    const convertedTime = new Date(utcTime + offset * 60000);

    // Format with milliseconds for more precision
    const timeStr = formatTime(convertedTime);
    const ms = utcDate.getUTCMilliseconds();
    const timeWithMs = ms > 0 ? `${timeStr}.${ms.toString().padStart(3, '0')}` : timeStr;

    document.getElementById('converted' + tz).textContent = timeWithMs;
    document.getElementById('convertedDate' + tz).textContent = formatDate(convertedTime);
  });
}

// Convert time between timezones
function convertTime() {
  const dateVal = document.getElementById('inputDate').value;
  const timeVal = document.getElementById('inputTime').value;
  const sourceTz = document.getElementById('sourceTimezone').value;

  if (!dateVal || !timeVal) {
    return;
  }

  // Parse input as source timezone
  const [year, month, day] = dateVal.split('-').map(Number);
  const [hours, minutes, seconds = 0] = timeVal.split(':').map(Number);

  // Create date in UTC first, then adjust for source timezone
  const sourceOffset = getTimezoneOffset(sourceTz);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  // Adjust to get actual UTC time (subtract source offset)
  const utcTime = utcDate.getTime() - sourceOffset * 60000;
  const utcDateObj = new Date(utcTime);

  // Convert to all timezones
  ['UTC', 'IST', 'CLT', 'Lima', 'Bogota'].forEach(tz => {
    const offset = getTimezoneOffset(tz, utcDateObj);
    const convertedTime = new Date(utcTime + offset * 60000);

    document.getElementById('converted' + tz).textContent = formatTime(convertedTime);
    document.getElementById('convertedDate' + tz).textContent = formatDate(convertedTime);
  });
}

// Copy all converted times to clipboard
function copyConvertedTimes() {
  const lines = [];
  const dateVal = document.getElementById('inputDate').value;
  const timeVal = document.getElementById('inputTime').value;
  const sourceTz = document.getElementById('sourceTimezone').value;

  if (dateVal && timeVal) {
    lines.push(`Source: ${timeVal} ${sourceTz} on ${dateVal}`);
    lines.push('');
  }

  ['UTC', 'IST', 'CLT', 'Lima', 'Bogota'].forEach(tz => {
    const time = document.getElementById('converted' + tz).textContent;
    const date = document.getElementById('convertedDate' + tz).textContent;
    if (time !== '--:--:--') {
      lines.push(`${tz}: ${time} (${date})`);
    }
  });

  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied all times to clipboard!');
  });
}

// Initialize world clock when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Start live clocks
  if (document.getElementById('liveUTC')) {
    startLiveClocks();
  }

  // Set today's date as default in converter
  const dateInput = document.getElementById('inputDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
});

// Export functions for global access
window.toggleLiveClocks = toggleLiveClocks;
window.setCurrentTime = setCurrentTime;
window.clearConverter = clearConverter;
window.convertTime = convertTime;
window.copyConvertedTimes = copyConvertedTimes;
window.parseUTCInput = parseUTCInput;
window.pasteAndConvertUTC = pasteAndConvertUTC;
window.clearInput = clearInput;
window.pasteClipboard = pasteClipboard;
window.copyToClipboard = copyToClipboard;
window.downloadOutput = downloadOutput;
window.toggleCustomInput = toggleCustomInput;
window.toggleCustomOutput = toggleCustomOutput;
window.convertCommaQuote = convertCommaQuote;
window.compareListDiff = compareListDiff;
window.switchJsonMode = switchJsonMode;
window.formatJSON = formatJSON;
window.minifyJSON = minifyJSON;
window.validateJSON = validateJSON;
window.compareJSONDiff = compareJSONDiff;

// ============================================
// TRANSLATION TOOL
// ============================================

let currentSourceLang = 'en';

// Dictionary for English to Spanish translation
const enToEsDict = {
  // Greetings
  'hello': 'hola',
  'hi': 'hola',
  'goodbye': 'adiós',
  'bye': 'adiós',
  'good morning': 'buenos días',
  'good afternoon': 'buenas tardes',
  'good evening': 'buenas noches',
  'good night': 'buenas noches',
  'see you later': 'hasta luego',
  'see you': 'nos vemos',
  'welcome': 'bienvenido',

  // Common words
  'yes': 'sí',
  'no': 'no',
  'please': 'por favor',
  'thank you': 'gracias',
  'thanks': 'gracias',
  "you're welcome": 'de nada',
  'sorry': 'lo siento',
  'excuse me': 'disculpe',
  'ok': 'vale',
  'okay': 'vale',

  // Questions
  'how are you': 'cómo estás',
  'what is your name': 'cómo te llamas',
  'where is': 'dónde está',
  'how much': 'cuánto cuesta',
  'what time': 'qué hora',
  'why': 'por qué',
  'when': 'cuándo',
  'who': 'quién',
  'what': 'qué',
  'how': 'cómo',
  'where': 'dónde',

  // Common phrases
  'i love you': 'te quiero',
  'i am': 'soy',
  'my name is': 'me llamo',
  'i want': 'quiero',
  'i need': 'necesito',
  'i have': 'tengo',
  'i like': 'me gusta',
  "i don't understand": 'no entiendo',
  'i understand': 'entiendo',
  'i need help': 'necesito ayuda',
  'can you help me': 'puedes ayudarme',

  // Days
  'monday': 'lunes',
  'tuesday': 'martes',
  'wednesday': 'miércoles',
  'thursday': 'jueves',
  'friday': 'viernes',
  'saturday': 'sábado',
  'sunday': 'domingo',
  'today': 'hoy',
  'tomorrow': 'mañana',
  'yesterday': 'ayer',

  // Numbers
  'one': 'uno',
  'two': 'dos',
  'three': 'tres',
  'four': 'cuatro',
  'five': 'cinco',
  'six': 'seis',
  'seven': 'siete',
  'eight': 'ocho',
  'nine': 'nueve',
  'ten': 'diez',
  'zero': 'cero',

  // Common nouns
  'water': 'agua',
  'food': 'comida',
  'house': 'casa',
  'home': 'casa',
  'car': 'coche',
  'book': 'libro',
  'phone': 'teléfono',
  'computer': 'computadora',
  'time': 'tiempo',
  'day': 'día',
  'night': 'noche',
  'friend': 'amigo',
  'family': 'familia',
  'work': 'trabajo',
  'money': 'dinero',
  'love': 'amor',
  'man': 'hombre',
  'woman': 'mujer',
  'child': 'niño',
  'boy': 'niño',
  'girl': 'niña',
  'dog': 'perro',
  'cat': 'gato',
  'city': 'ciudad',
  'country': 'país',
  'world': 'mundo',

  // Verbs
  'to be': 'ser/estar',
  'to have': 'tener',
  'to go': 'ir',
  'to come': 'venir',
  'to eat': 'comer',
  'to drink': 'beber',
  'to sleep': 'dormir',
  'to speak': 'hablar',
  'to read': 'leer',
  'to write': 'escribir',
  'to work': 'trabajar',
  'to live': 'vivir',
  'to know': 'saber',
  'to think': 'pensar',
  'to see': 'ver',
  'to hear': 'oír',

  // Adjectives
  'good': 'bueno',
  'bad': 'malo',
  'big': 'grande',
  'small': 'pequeño',
  'new': 'nuevo',
  'old': 'viejo',
  'beautiful': 'hermoso',
  'ugly': 'feo',
  'hot': 'caliente',
  'cold': 'frío',
  'happy': 'feliz',
  'sad': 'triste',
  'easy': 'fácil',
  'difficult': 'difícil',
  'fast': 'rápido',
  'slow': 'lento',

  // Pronouns
  'i': 'yo',
  'you': 'tú',
  'he': 'él',
  'she': 'ella',
  'we': 'nosotros',
  'they': 'ellos',
  'it': 'eso',
  'this': 'esto',
  'that': 'eso',

  // Prepositions & connectors
  'and': 'y',
  'or': 'o',
  'but': 'pero',
  'with': 'con',
  'without': 'sin',
  'for': 'para',
  'from': 'de',
  'to': 'a',
  'in': 'en',
  'on': 'en',
  'at': 'en',
  'the': 'el/la',
  'a': 'un/una',
  'an': 'un/una',

  // Colors
  'red': 'rojo',
  'blue': 'azul',
  'green': 'verde',
  'yellow': 'amarillo',
  'black': 'negro',
  'white': 'blanco',
  'orange': 'naranja',
  'purple': 'morado',
  'pink': 'rosa',
  'brown': 'marrón'
};

// Create reverse dictionary (Spanish to English)
const esToEnDict = {};
Object.entries(enToEsDict).forEach(([en, es]) => {
  // Handle cases like "ser/estar" -> take first option
  const esWord = es.includes('/') ? es.split('/')[0] : es;
  esToEnDict[esWord.toLowerCase()] = en;
});

// Set source language
function setSourceLanguage(lang) {
  currentSourceLang = lang;

  const sourceBtn = document.getElementById('langSourceBtn');
  const targetBtn = document.getElementById('langTargetBtn');

  if (lang === 'en') {
    sourceBtn.classList.add('active');
    targetBtn.classList.remove('active');
    document.getElementById('sourceLangLabel').textContent = 'English';
    document.getElementById('targetLangLabel').textContent = 'Spanish';
  } else {
    sourceBtn.classList.remove('active');
    targetBtn.classList.add('active');
    document.getElementById('sourceLangLabel').textContent = 'Spanish';
    document.getElementById('targetLangLabel').textContent = 'English';
  }

  translateText();
}

// Swap languages
function swapLanguages() {
  const input = document.getElementById('translateInput');
  const output = document.getElementById('translateOutput');

  // Get current output text
  const outputText = output.textContent;

  // Only swap if there's actual translated content
  if (outputText && outputText !== 'Translation will appear here...') {
    input.value = outputText;
  }

  // Toggle language
  const newLang = currentSourceLang === 'en' ? 'es' : 'en';
  setSourceLanguage(newLang);
}

// Translate text
function translateText() {
  const input = document.getElementById('translateInput').value;
  const output = document.getElementById('translateOutput');
  const sourceCount = document.getElementById('sourceCharCount');
  const targetCount = document.getElementById('targetCharCount');

  // Update source character count
  sourceCount.textContent = input.length;

  if (!input.trim()) {
    output.textContent = 'Translation will appear here...';
    targetCount.textContent = '0';
    return;
  }

  const dict = currentSourceLang === 'en' ? enToEsDict : esToEnDict;
  let result = input;

  // Sort phrases by length (longest first) to match multi-word phrases first
  const phrases = Object.keys(dict).sort((a, b) => b.length - a.length);

  phrases.forEach(phrase => {
    const regex = new RegExp('\\b' + escapeRegexForTranslate(phrase) + '\\b', 'gi');
    result = result.replace(regex, match => {
      const translation = dict[phrase.toLowerCase()];
      // Preserve original case
      if (match[0] === match[0].toUpperCase()) {
        return translation.charAt(0).toUpperCase() + translation.slice(1);
      }
      return translation;
    });
  });

  output.textContent = result;
  targetCount.textContent = result.length;
}

// Escape special regex characters for translation
function escapeRegexForTranslate(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Insert phrase into input
function insertPhrase(english, spanish) {
  const input = document.getElementById('translateInput');
  const phrase = currentSourceLang === 'en' ? english : spanish;

  // Add to existing text or replace
  if (input.value.trim()) {
    input.value += ' ' + phrase;
  } else {
    input.value = phrase;
  }

  translateText();
}

// Toggle phrases panel visibility
function togglePhrasesPanel() {
  const panel = document.getElementById('phrasesPanel');
  if (panel.style.display === 'none') {
    panel.style.display = 'grid';
  } else {
    panel.style.display = 'none';
  }
}

// Export translation functions for global access
window.setSourceLanguage = setSourceLanguage;
window.swapLanguages = swapLanguages;
window.translateText = translateText;
window.insertPhrase = insertPhrase;
window.togglePhrasesPanel = togglePhrasesPanel;
