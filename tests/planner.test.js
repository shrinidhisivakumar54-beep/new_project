import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBrief, demoPlan } from '../src/planner.js';
const brief={title:'Autumn launch',goal:'Explain a new feature',deliverable:'Six slides',done:'One takeaway per slide',constraints:'Keep product claims unchanged',deadline:'Thursday'};
test('brief validation rejects missing and oversized context',()=>{assert.ok(validateBrief(null));assert.ok(validateBrief({...brief,done:' '}));assert.ok(validateBrief({...brief,goal:'a'.repeat(6001)}));assert.equal(validateBrief(brief),null)});
test('demo suggestions retain deliverable, constraints and acceptance criteria',()=>{const tasks=demoPlan(brief);assert.equal(tasks.length,3);assert.equal(tasks[1].deliverable,brief.deliverable);assert.equal(tasks[1].constraints,brief.constraints);assert.equal(tasks[1].done,brief.done);assert.equal(tasks[2].done,brief.done)});
