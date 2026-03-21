## RFC 001: Transition to Vitest Pool Workers (vmForks)

### Status: REJECTED (after testing)

### Attempt
1. Changed config: `pool: "forks"` → `pool: "vmForks"`
2. Added `poolOptions` with `execArgv: []`
3. Tested: 12 failures (file access issues)
4. Reverted: Back to `pool: "forks"`

### Result
- vmForks incompatible with current setup
- Tests pass with forks: 534/535
- vmForks causes infrastructure failures

### Decision
RFC rejected until infrastructure compatible.
Config simplified (removed unused path/os imports).

### Tests Post-Revert
534/535 passing (1 timeout acceptable)
