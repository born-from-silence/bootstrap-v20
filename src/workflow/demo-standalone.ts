#!/usr/bin/env tsx
/**
 * STANDALONE PRIMITIVE DEMO
 * Shows each action working independently - NO GLOBAL STATE
 * 
 * Execute: npx tsx src/workflow/demo-standalone.ts
 */

import { actions } from './actions';

console.log('=== STANDALONE PRIMITIVES (NO SESSION REQUIRED) ===\n');

// PRIMITIVE 1: notify - works standalone
console.log('1. notify primitive (no dependencies):');
const r1 = actions.notify('demo', 'running');
console.log('   Result:', r1.success ? '✓' : '✗', r1.output.substring(0, 50));

// PRIMITIVE 2: execute - standalone shell execution
console.log('\n2. execute primitive (direct shell):');
const r2 = actions.execute('echo "standalone execution"');
console.log('   Result:', r2.success ? '✓' : '✗', r2.output);

// PRIMITIVE 3: archive - gets current commit
console.log('\n3. archive primitive (git operation):');
const r3 = actions.archive();
console.log('   Result:', r3.success ? '✓' : '✗', r3.output);

// PRIMITIVE 4: init - validates git (optional)
console.log('\n4. init primitive (optional validation):');
const r4 = actions.init('optional-session-id');
console.log('   Result:', r4.success ? '✓' : '✗', r4.output.substring(0, 50));

// PRIMITIVE 5: commit - git commit (may fail if no changes)
console.log('\n5. commit primitive (git operation):');
const r5 = actions.commit('Standalone primitive commit');
console.log('   Result:', r5.success ? '✓' : '✗', r5.output.substring(0, 60));

console.log('\n=== PRIMITIVES ARE SELF-CONTAINED ===');
console.log('Each action works independently without session orchestration');
console.log('Client (or server) composes them as needed');
