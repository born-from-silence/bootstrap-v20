// test_fatigue.zig
// Zig test suite for fatigue calculation algorithms

const std = @import("std");
const testing = std.testing;
const fatigue = @import("fatigue_calculator.zig");

const FatigueCalculator = fatigue.FatigueCalculator;
const FatigueProfile = fatigue.FatigueProfile;
const ActivityLevel = fatigue.ActivityLevel;
const FatigueError = fatigue.FatigueError;
const FatigueSummary = fatigue.FatigueSummary;

// Test allocator for memory management
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();

// Default profile for tests
const default_profile = FatigueProfile{
    .sedentary_limit = 5.0,
    .active_limit = 8.0,
    .high_intensity_limit = 10.0,
};

// Profile Tests
test "profile should have correct default values" {
    try testing.expect(default_profile.sedentary_limit == 5.0);
    try testing.expect(default_profile.active_limit == 8.0);
    try testing.expect(default_profile.high_intensity_limit == 10.0);
}

test "getLimit should return correct limit for each activity level" {
    // These use internal getLimit which is tested via calculateFatigue
    const sed_limit = default_profile.getLimit(ActivityLevel.sedentary);
    const act_limit = default_profile.getLimit(ActivityLevel.active);
    const high_limit = default_profile.getLimit(ActivityLevel.high_intensity);
    
    try testing.expect(sed_limit == 5.0);
    try testing.expect(act_limit == 8.0);
    try testing.expect(high_limit == 10.0);
}

// Initialization Tests
test "calculator should initialize with default profile" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    // Just verify it initializes without error
    _ = calc.profile;
}

// calculateFatigue Tests
test "calculateFatigue should return correct score for sedentary" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateFatigue(3.0, ActivityLevel.sedentary);
    try testing.expect(result == 3.0);
}

test "calculateFatigue should return correct score for active" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateFatigue(6.0, ActivityLevel.active);
    try testing.expect(result == 6.0);
}

test "calculateFatigue should return correct score for high intensity" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateFatigue(9.0, ActivityLevel.high_intensity);
    try testing.expect(result == 9.0);
}

test "calculateFatigue should clamp to limit" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateFatigue(15.0, ActivityLevel.sedentary);
    try testing.expect(result == 5.0); // Should clamp to sedentary limit
}

test "calculateFatigue should fail with negative score" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.calculateFatigue(-1.0, ActivityLevel.sedentary);
    try testing.expectError(FatigueError.NegativeScore, result);
}

test "calculateFatigue should handle zero score" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateFatigue(0.0, ActivityLevel.sedentary);
    try testing.expect(result == 0.0);
}

// calculateRecovery Tests
test "calculateRecovery should reduce fatigue based on sleep" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateRecovery(10.0, 8.0);
    try testing.expect(result == 9.2); // 10 - (8 * 0.1)
}

test "calculateRecovery should clamp to zero" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateRecovery(0.5, 10.0);
    try testing.expect(result == 0.0);
}

test "calculateRecovery should fail with negative fatigue" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.calculateRecovery(-1.0, 8.0);
    try testing.expectError(FatigueError.NegativeScore, result);
}

test "calculateRecovery should fail with negative sleep" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.calculateRecovery(10.0, -1.0);
    try testing.expectError(FatigueError.NegativeScore, result);
}

test "calculateRecovery should handle zero fatigue" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.calculateRecovery(0.0, 8.0);
    try testing.expect(result == 0.0);
}

// summarize Tests
test "summarize should calculate correct statistics" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const scores = [_]f64{ 3.0, 5.0, 7.0, 9.0, 11.0 };
    const summary = try calc.summarize(&scores);
    
    try testing.expect(summary.total == 35.0);
    try testing.expect(summary.count == 5);
    try testing.expect(summary.average == 7.0);
    try testing.expect(summary.maximum == 11.0);
    try testing.expect(summary.minimum == 3.0);
    try testing.expect(!summary.recovered); // avg >= 5
}

test "summarize should mark recovered when average below threshold" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const scores = [_]f64{ 1.0, 2.0, 3.0, 4.0 };
    const summary = try calc.summarize(&scores);
    
    try testing.expect(summary.recovered); // avg < 5
}

test "summarize should fail with empty slice" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const scores = [_]f64{};
    const result = calc.summarize(&scores);
    try testing.expectError(FatigueError.EmptySlice, result);
}

test "summarize should handle single value" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const scores = [_]f64{5.0};
    const summary = try calc.summarize(&scores);
    
    try testing.expect(summary.total == 5.0);
    try testing.expect(summary.count == 1);
    try testing.expect(summary.maximum == 5.0);
    try testing.expect(summary.minimum == 5.0);
}

// computeIntensityMetrics Tests
test "computeIntensityMetrics should return correct value" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.computeIntensityMetrics(10.0, 1.5);
    try testing.expect(result == 15.0);
}

test "computeIntensityMetrics should fail with negative multiplier" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.computeIntensityMetrics(10.0, -1.0);
    try testing.expectError(FatigueError.InvalidLevel, result);
}

test "computeIntensityMetrics should handle zero multiplier" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.computeIntensityMetrics(10.0, 0.0);
    try testing.expect(result == 0.0);
}

// adjustForActivityLevel Tests
test "adjustForActivityLevel should adjust by sedentary factor" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.adjustForActivityLevel(10.0, ActivityLevel.sedentary);
    try testing.expect(result == 5.0); // Clamped to limit
}

test "adjustForActivityLevel should adjust by active factor" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.adjustForActivityLevel(5.0, ActivityLevel.active);
    try testing.expect(result == 6.0); // 5 * 1.2 = 6
}

test "adjustForActivityLevel should adjust by high intensity factor" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.adjustForActivityLevel(5.0, ActivityLevel.high_intensity);
    try testing.expect(result == 7.5); // 5 * 1.5 = 7.5
}

// verifyThreshold Tests
test "verifyThreshold should return true when computed exceeds threshold" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.verifyThreshold(10.0, 5.0);
    try testing.expect(result == true);
}

test "verifyThreshold should return false when computed below threshold" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = try calc.verifyThreshold(4.0, 5.0);
    try testing.expect(result == false);
}

test "verifyThreshold should fail with negative computed" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.verifyThreshold(-1.0, 5.0);
    try testing.expectError(FatigueError.NegativeScore, result);
}

test "verifyThreshold should fail with negative threshold" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.verifyThreshold(10.0, -1.0);
    try testing.expectError(FatigueError.NegativeScore, result);
}

// Other Algorithm Tests
test "categorizeFatigueLevel should return mild" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const level = try calc.categorizeFatigueLevel(2.0);
    try testing.expect(level == fatigue.FatigueLevel.mild);
}

test "categorizeFatigueLevel should return moderate" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const level = try calc.categorizeFatigueLevel(5.0);
    try testing.expect(level == fatigue.FatigueLevel.moderate);
}

test "categorizeFatigueLevel should return severe" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const level = try calc.categorizeFatigueLevel(8.0);
    try testing.expect(level == fatigue.FatigueLevel.severe);
}

test "categorizeFatigueLevel should fail with negative score" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const result = calc.categorizeFatigueLevel(-1.0);
    try testing.expectError(FatigueError.NegativeScore, result);
}

test "computeZScore should return correct value" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const values = [_]f64{ 1.0, 2.0, 3.0, 4.0, 5.0 };
    const zScore = try calc.computeZScore(&values);
    
    // First value is below mean, so z-score should be < 0
    try testing.expect(zScore < 0);
}

test "computeZScore should fail with empty slice" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const values = [_]f64{};
    const result = calc.computeZScore(&values);
    try testing.expectError(FatigueError.EmptySlice, result);
}

// calculateRMSE Tests
test "calculateRMSE should return correct value" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const predicted = [_]f64{ 1.0, 2.0, 3.0, 4.0, 5.0 };
    const actual = [_]f64{ 1.1, 1.9, 3.2, 3.8, 5.1 };
    const rmse = try calc.calculateRMSE(&predicted, &actual);
    
    try testing.expect(rmse > 0);
    try testing.expect(rmse < 0.5); // Should be small
}

test "calculateRMSE should fail with mismatched arrays" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const predicted = [_]f64{ 1.0, 2.0, 3.0 };
    const actual = [_]f64{ 1.0, 2.0 };
    const result = calc.calculateRMSE(&predicted, &actual);
    try testing.expectError(FatigueError.EmptySlice, result);
}

test "calculateRMSE should fail with empty arrays" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const predicted = [_]f64{};
    const actual = [_]f64{};
    const result = calc.calculateRMSE(&predicted, &actual);
    try testing.expectError(FatigueError.EmptySlice, result);
}

// generateForecastTrend Tests
test "generateForecastTrend should return correct forecasts" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const historical = [_]f64{ 10.0, 11.0, 12.0, 13.0 };
    const forecasts = try calc.generateForecastTrend(&historical, 3);
    defer allocator.free(forecasts);
    
    try testing.expect(forecasts.len == 3);
    try testing.expect(forecasts[0] == 14.0);
    try testing.expect(forecasts[1] == 15.0);
    try testing.expect(forecasts[2] == 16.0);
}

test "generateForecastTrend should fail with empty historical" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const historical = [_]f64{};
    const result = calc.generateForecastTrend(&historical, 3);
    try testing.expectError(FatigueError.EmptySlice, result);
}

test "generateForecastTrend should fail with zero periods" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    const historical = [_]f64{ 10.0 };
    const result = calc.generateForecastTrend(&historical, 0);
    try testing.expectError(FatigueError.EmptySlice, result);
}

// Memory safety test
test "calculator should handle memory allocation" {
    var calc = FatigueCalculator.init(allocator, default_profile);
    defer calc.deinit();
    
    // This test ensures proper memory cleanup
    const historical = [_]f64{ 10.0, 11.0, 12.0 };
    const forecasts = try calc.generateForecastTrend(&historical, 5);
    defer allocator.free(forecasts);
    
    try testing.expect(forecasts.len == 5);
}
