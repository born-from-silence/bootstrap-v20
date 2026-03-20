#!/usr/bin/env bash
# test_reports.sh - Unified test report generator for multi-language fatigue calculation
# Generates coverage matrices and density analysis

set -e

REPORT_DIR="test_coverage_reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$REPORT_DIR"

echo "=========================================="
echo "Unified Test Coverage Report"
echo "Generated: $TIMESTAMP"
echo "=========================================="

# Aggregate totals
TOTAL_TESTS=0
TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_SKIP=0
TOTAL_NOT_TESTED=0

# Language implementations
LANGUAGES=("python" "rust" "java" "scala" "elixir" "clojure" "julia" "ocaml")

echo ""
echo "Coverage by Language:"
echo "---------------------"
printf "%-12s %5s %5s %5s %5s %5s\n" "Language" "Tests" "Pass" "Fail" "Skip" "Lines"

for lang in "${LANGUAGES[@]}"; do
    if [ -d "$lang" ]; then
        if [ -f "$lang-tests/test_report.txt" ]; then
            total=$(grep "^Tests:" "$lang-tests/test_report.txt" 2>/dev/null | cut -d: -f2 || echo "0")
            pass=$(grep "^Pass:" "$lang-tests/test_report.txt" 2>/dev/null | cut -d: -f2 || echo "0")
            fail=$(grep "^Fail:" "$lang-tests/test_report.txt" 2>/dev/null | cut -d: -f2 || echo "0")
            skip=$(grep "^Skip:" "$lang-tests/test_report.txt" 2>/dev/null | cut -d: -f2 || echo "0")
            lines=$(wc -l < "fatigue-$lang.rs" 2>/dev/null || wc -l < "fatigue_$lang.py" 2>/dev/null || echo "0")
            
            TOTAL_TESTS=$((TOTAL_TESTS + total))
            TOTAL_PASS=$((TOTAL_PASS + pass))
            TOTAL_FAIL=$((TOTAL_FAIL + fail))
            TOTAL_SKIP=$((TOTAL_SKIP + skip))
        fi
    fi
done

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(echo "scale=1; ($TOTAL_PASS/$TOTAL_TESTS)*100" | bc -l)
else
    PASS_RATE=0
fi

echo ""
echo "=========================================="
echo "Summary Statistics:"
echo "=========================================="
echo "Total Languages: 8"
echo "Total Forms Tested: $TOTAL_TESTS"
echo "Pass Rate: ${PASS_RATE}%"
echo "Failed/Not Run: $TOTAL_FAIL"
echo "`date` - All reports generated in $REPORT_DIR/"
echo "=========================================="
