import assert from 'node:assert/strict';
import test from 'node:test';
import { getTemplate, MEME_TEMPLATES } from '../src/lib/templates.ts';
import { validateScene, parseCaption, parseMemeCaption, dailyScene } from '../src/lib/generation.ts';

test('untrusted prompt and topic validation', () => {
  for (const [prompt, topic] of [['short', 'Campus'], ['a'.repeat(501), 'NYC'], ['A valid scene here', 'Unknown'], [null, 'Campus'], [{ toString: () => 'forged scene' }, 'NYC']]) {
    assert.equal(validateScene(prompt, topic), null);
  }
  assert.deepEqual(validateScene('  My laundry has its own zip code  ', 'Dorm life'), { prompt: 'My laundry has its own zip code', topic: 'Dorm life' });
});

test('only complete, bounded AI results are accepted', () => {
  for (const value of ['not json', '{}', 'null', '{"setup":4,"punchline":"hi"}', JSON.stringify({ setup: ' ', punchline: 'hi' }), JSON.stringify({ setup: 'a'.repeat(241), punchline: 'hi' }), JSON.stringify({ setup: 'hi', punchline: 'a'.repeat(301) })]) {
    assert.throws(() => parseCaption(value));
  }
  assert.deepEqual(parseCaption('{"setup":" Setup ","punchline":" Punchline "}'), { setup: 'Setup', punchline: 'Punchline' });
});

test('daily prompt changes at New York midnight, including daylight saving', () => {
  assert.equal(dailyScene(new Date('2026-10-04T00:00:00Z')), dailyScene(new Date('2026-10-04T03:59:59Z')));
  assert.notEqual(dailyScene(new Date('2026-10-04T03:59:59Z')), dailyScene(new Date('2026-10-04T04:00:00Z')));
  assert.equal(dailyScene(new Date('2026-12-04T00:00:00Z')), dailyScene(new Date('2026-12-04T04:59:59Z')));
  assert.notEqual(dailyScene(new Date('2026-12-04T04:59:59Z')), dailyScene(new Date('2026-12-04T05:00:00Z')));
});


test('meme captions require short overlay text and descriptive alt text', () => {
  const valid = { setup: 'When the laundry is finally done', punchline: 'And the dryer ate one sock', image_description: 'A cat with an unimpressed expression.' };
  assert.deepEqual(parseMemeCaption(JSON.stringify(valid)), valid);
  for (const invalid of [{ ...valid, setup: 'a'.repeat(81) }, { ...valid, punchline: 'a'.repeat(101) }, { ...valid, image_description: '' }, { ...valid, image_description: undefined }]) {
    assert.throws(() => parseMemeCaption(JSON.stringify(invalid)));
  }
});

test('template selection accepts only the curated local catalog', () => {
  assert.equal(getTemplate('surprised-pikachu')?.name, 'Surprised Pikachu');
  for (const id of ['../../.env.local', 'https://example.com/image.jpg', 'unknown', null, { id: 'surprised-pikachu' }]) {
    assert.equal(getTemplate(id), undefined);
  }
  assert.equal(new Set(MEME_TEMPLATES.map(template => template.id)).size, MEME_TEMPLATES.length);
});
