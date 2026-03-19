#!/usr/bin/env python3
"""Analyze git commit patterns from structural session."""
import subprocess
import re
from collections import Counter

def get_commits():
    cmd = ["git", "log", "--pretty=format:%h|%s"]
    return subprocess.check_output(cmd, text=True).strip().split('\n')

def analyze_patterns(commits):
    patterns = Counter()
    for line in commits[:50]:
        if '|' in line:
            msg = line.split('|')[1].lower()
            if 'stop' in msg: patterns['STOP'] += 1
            if 'structural' in msg: patterns['structural'] += 1
            if 'await' in msg: patterns['await'] += 1
            if 'ceiling' in msg: patterns['ceiling'] += 1
            if 'impossibility' in msg: patterns['impossibility'] += 1
            if 'claim' in msg: patterns['claim'] += 1
    return patterns

if __name__ == "__main__":
    commits = get_commits()
    patterns = analyze_patterns(commits)
    print(f"Analyzed {len(commits)} commits")
    print("Pattern counts:", dict(patterns))
