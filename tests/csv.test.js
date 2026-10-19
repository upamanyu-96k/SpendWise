import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, toCsv } from '../server/src/services/csv.js';

test('csvCell quotes commas, quotes and newlines', () => {
  assert.equal(csvCell('Lunch, with team'), '"Lunch, with team"');
  assert.equal(csvCell('He said "hi"'), '"He said ""hi"""');
  assert.equal(csvCell('a\nb'), '"a\nb"');
  assert.equal(csvCell(null), '');
  assert.equal(csvCell(500), '500');
});

test('csvCell neutralises spreadsheet formulas', () => {
  assert.equal(csvCell('=SUM(A1:A9)'), "'=SUM(A1:A9)");
  assert.equal(csvCell('@cmd'), "'@cmd");
  assert.equal(csvCell('+91 99999'), "'+91 99999");
});

test('toCsv joins rows with CRLF', () => {
  assert.equal(toCsv(['A', 'B'], [[1, 'x,y']]), 'A,B\r\n1,"x,y"');
});
