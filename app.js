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
  CST: { offset: -6 * 60, name: 'CST', iana: 'America/Chicago', hasDST: true },
  Lima: { offset: -5 * 60, name: 'Lima', iana: 'America/Lima' },
  Bogota: { offset: -5 * 60, name: 'Bogota', iana: 'America/Bogota' }
};

// Check if date is in US DST (second Sunday in March to first Sunday in November)
function isUSDST(date) {
  const year = date.getUTCFullYear();

  // Second Sunday in March
  let marchFirst = new Date(Date.UTC(year, 2, 1));
  let dstStart = new Date(Date.UTC(year, 2, 8 + (7 - marchFirst.getUTCDay()) % 7, 8)); // 2 AM CST = 8 AM UTC

  // First Sunday in November
  let novFirst = new Date(Date.UTC(year, 10, 1));
  let dstEnd = new Date(Date.UTC(year, 10, 1 + (7 - novFirst.getUTCDay()) % 7, 7)); // 2 AM CDT = 7 AM UTC

  return date >= dstStart && date < dstEnd;
}

// Get offset for a timezone considering DST
function getTimezoneOffset(tzName, date = new Date()) {
  const tz = timezones[tzName];
  if (!tz) return 0;

  let offset = tz.offset;

  // Adjust for US DST (CST becomes CDT)
  if (tz.hasDST && isUSDST(date)) {
    offset += 60; // Add 1 hour during DST
  }

  return offset;
}

// Format time as HH:MM:SS
function formatTime(date) {
  return date.toTimeString().slice(0, 8);
}

// Format date as Mon, Jan 22
function formatDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

// Get time in a specific timezone
function getTimeInTimezone(tzName, sourceDate = new Date()) {
  const offset = getTimezoneOffset(tzName, sourceDate);
  const utcTime = sourceDate.getTime() + sourceDate.getTimezoneOffset() * 60000;
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

  // CST
  const cstTime = getTimeInTimezone('CST', now);
  document.getElementById('liveCST').textContent = formatTime(cstTime);
  document.getElementById('liveDateCST').textContent = formatDate(cstTime);

  // Update CST offset display based on DST
  const cstOffsetEl = document.getElementById('cstOffset');
  if (cstOffsetEl) {
    cstOffsetEl.textContent = isUSDST(now) ? 'UTC -5:00 (CDT)' : 'UTC -6:00 (CST)';
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

  ['UTC', 'IST', 'CST', 'Lima', 'Bogota'].forEach(tz => {
    document.getElementById('converted' + tz).textContent = '--:--:--';
    document.getElementById('convertedDate' + tz).textContent = '---';
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
  ['UTC', 'IST', 'CST', 'Lima', 'Bogota'].forEach(tz => {
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

  ['UTC', 'IST', 'CST', 'Lima', 'Bogota'].forEach(tz => {
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

