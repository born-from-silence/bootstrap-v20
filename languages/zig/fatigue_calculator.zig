// fatigue_calculator.zig
// Zig implementation of fatigue calculation algorithms
// Zero-cost abstractions with safety guarantees

const std = @import("std");
const Allocator = std.mem.Allocator;

pub const ActivityLevel = enum {
    sedentary,
    active,
    high_intensity,
};

pub const FatigueLevel = enum {
    mild,
    moderate,
    severe,
};

pub const FatigueError = error{
    NegativeScore,
    InvalidLevel,
    EmptySlice,
    AllocationFailed,
    MathError,
};

pub const FatigueProfile = struct {
    sedentary_limit: f64 = 5.0,
    active_limit: f64 = 8.0,
    high_intensity_limit: f64 = 10.0,
    
    fn getLimit(self: FatigueProfile, level: ActivityLevel) f64 {
        return switch (level) {
            .sedentary => self.sedentary_limit,
            .active => self.active_limit,
            .high_intensity => self.high_intensity_limit,
        };
    }
};

pub const FatigueSummary = struct {
    total: f64,
    count: usize,
    average: f64,
    maximum: f64,
    minimum: f64,
    recovered: bool,
};

pub const FatigueCalculator = struct {
    profile: FatigueProfile,
    allocator: Allocator,
    
    pub fn init(allocator: Allocator, profile: FatigueProfile) FatigueCalculator {
        return FatigueCalculator{
            .profile = profile,
            .allocator = allocator,
        };
    }
    
    pub fn deinit(self: *FatigueCalculator) void {
        _ = self; // Nothing to free currently
    }
    
    pub fn calculateFatigue(self: FatigueCalculator, score: f64, level: ActivityLevel) FatigueError!f64 {
        if (score < 0) {
            return FatigueError.NegativeScore;
        }
        const limit = self.profile.getLimit(level);
        return if (score < limit) score else limit;
    }
    
    pub fn calculateRecovery(self: FatigueCalculator, fatigue: f64, sleep: f64) FatigueError!f64 {
        if (fatigue < 0 or sleep < 0) {
            return FatigueError.NegativeScore;
        }
        const recovered = fatigue - (sleep * 0.1);
        return if (recovered > 0) recovered else 0;
    }
    
    pub fn summarize(self: FatigueCalculator, scores: []const f64) FatigueError!FatigueSummary {
        if (scores.len == 0) {
            return FatigueError.EmptySlice;
        }
        
        var total: f64 = 0;
        var maximum: f64 = scores[0];
        var minimum: f64 = scores[0];
        
        for (scores) |score| {
            total += score;
            if (score > maximum) maximum = score;
            if (score < minimum) minimum = score;
        }
        
        const average = total / @as(f64, @floatFromInt(scores.len));
        const recovered = average < 5.0;
        
        return FatigueSummary{
            .total = total,
            .count = scores.len,
            .average = average,
            .maximum = maximum,
            .minimum = minimum,
            .recovered = recovered,
        };
    }
    
    pub fn computeIntensityMetrics(_: FatigueCalculator, base: f64, multiplier: f64) FatigueError!f64 {
        if (multiplier < 0) {
            return FatigueError.InvalidLevel;
        }
        return base * multiplier;
    }
    
    pub fn adjustForActivityLevel(self: FatigueCalculator, base: f64, activity: ActivityLevel) FatigueError!f64 {
        const factors = .{ .sedentary = 1.0, .active = 1.2, .high_intensity = 1.5 };
        const factor = switch (activity) {
            .sedentary => factors.sedentary,
            .active => factors.active,
            .high_intensity => factors.high_intensity,
        };
        const limit = self.profile.getLimit(activity);
        const adjusted = base * factor;
        return if (adjusted < limit) adjusted else limit;
    }
    
    pub fn verifyThreshold(_: FatigueCalculator, computed: f64, threshold: f64) FatigueError!bool {
        if (computed < 0 or threshold < 0) {
            return FatigueError.NegativeScore;
        }
        return computed >= threshold;
    }
    
    pub fn metricsToJSON(self: *FatigueCalculator, metrics: FatigueSummary) FatigueError![]u8 {
        var json = std.ArrayList(u8).init(self.allocator);
        defer json.deinit();
        
        // Manual JSON serialization for Zig
        const writer = json.writer();
        
        writer.print("{{", .{}) catch return FatigueError.AllocationFailed;
        writer.print("\"total\":{d:.2},", .{metrics.total}) catch return FatigueError.AllocationFailed;
        writer.print("\"count\":{d},", .{metrics.count}) catch return FatigueError.AllocationFailed;
        writer.print("\"average\":{d:.2},", .{metrics.average}) catch return FatigueError.AllocationFailed;
        writer.print("\"maximum\":{d:.2},", .{metrics.maximum}) catch return FatigueError.AllocationFailed;
        writer.print("\"minimum\":{d:.2},", .{metrics.minimum}) catch return FatigueError.AllocationFailed;
        writer.print("\"recovered\":{s}", .{if (metrics.recovered) "true" else "false"}) catch return FatigueError.AllocationFailed;
        writer.print("}}", .{}) catch return FatigueError.AllocationFailed;
        
        return json.toOwnedSlice() catch FatigueError.AllocationFailed;
    }
    
    pub fn metricsFromJSON(_: FatigueCalculator, json_str: []const u8) FatigueError!FatigueSummary {
        // Simplified JSON parsing - assumes valid JSON with known structure
        // In production would use proper JSON parser
        _ = json_str;
        return FatigueError.InvalidLevel; // Placeholder for complex parsing
    }
    
    pub fn serializeMetrics(self: *FatigueCalculator, metrics: FatigueSummary) FatigueError![]u8 {
        return self.metricsToJSON(metrics);
    }
    
    pub fn categorizeFatigueLevel(_: FatigueCalculator, score: f64) FatigueError!FatigueLevel {
        if (score < 0) {
            return FatigueError.NegativeScore;
        }
        return if (score < 3.0) FatigueLevel.mild
            else if (score < 7.0) FatigueLevel.moderate
            else FatigueLevel.severe;
    }
    
    pub fn computeZScore(_: FatigueCalculator, values: []const f64) FatigueError!f64 {
        if (values.len == 0) {
            return FatigueError.EmptySlice;
        }
        
        var sum: f64 = 0;
        for (values) |v| {
            sum += v;
        }
        const mean = sum / @as(f64, @floatFromInt(values.len));
        
        var variance_sum: f64 = 0;
        for (values) |v| {
            const diff = v - mean;
            variance_sum += diff * diff;
        }
        const variance = variance_sum / @as(f64, @floatFromInt(values.len));
        const std_dev = std.math.sqrt(variance);
        
        return if (std_dev == 0) 0 else (values[0] - mean) / std_dev;
    }
    
    pub fn calculateRMSE(_: FatigueCalculator, predicted: []const f64, actual: []const f64) FatigueError!f64 {
        if (predicted.len != actual.len or predicted.len == 0) {
            return FatigueError.EmptySlice;
        }
        
        var sum_squared_error: f64 = 0;
        var i: usize = 0;
        while (i < predicted.len) : (i += 1) {
            const err = predicted[i] - actual[i];
            sum_squared_error += err * err;
        }
        
        const mse = sum_squared_error / @as(f64, @floatFromInt(predicted.len));
        return std.math.sqrt(mse);
    }
    
    pub fn generateForecastTrend(self: *FatigueCalculator, historical: []const f64, periods: usize) FatigueError![]f64 {
        if (historical.len == 0 or periods == 0) {
            return FatigueError.EmptySlice;
        }
        
        const forecasts = self.allocator.alloc(f64, periods) catch {
            return FatigueError.AllocationFailed;
        };
        
        const last = historical[historical.len - 1];
        
        var i: usize = 0;
        while (i < periods) : (i += 1) {
            forecasts[i] = last + @as(f64, @floatFromInt(i + 1));
        }
        
        return forecasts;
    }
};

// Export for package use
pub fn createCalculator(allocator: Allocator, profile: FatigueProfile) FatigueCalculator {
    return FatigueCalculator.init(allocator, profile);
}
