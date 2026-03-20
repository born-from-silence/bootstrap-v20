-- test_fatigue.lua
-- Busted test suite for Lua FatigueCalculator implementation
-- Run: busted test_fatigue.lua

local FC = require 'FatigueCalculator'

describe("FatigueCalculator", function()
    local calculator
    local default_profile = {
        sedentary_limit = 5.0,
        active_limit = 8.0,
        high_intensity_limit = 10.0
    }

    before_each(function()
        calculator = FC.new(default_profile)
    end)

    describe("Profile", function()
        it("should have correct default values", function()
            assert.are.equal(5.0, default_profile.sedentary_limit)
            assert.are.equal(8.0, default_profile.active_limit)
            assert.are.equal(10.0, default_profile.high_intensity_limit)
        end)

        it("get_limit should return correct limit for each activity level", function()
            assert.are.equal(5.0, calculator:get_limit(FC.ActivityLevel.SEDENTARY))
            assert.are.equal(8.0, calculator:get_limit(FC.ActivityLevel.ACTIVE))
            assert.are.equal(10.0, calculator:get_limit(FC.ActivityLevel.HIGH_INTENSITY))
        end)
    end)

    describe("calculate_fatigue", function()
        it("should return correct score for sedentary", function()
            local result = calculator:calculate_fatigue(3.0, FC.ActivityLevel.SEDENTARY)
            assert.is_true(result.success)
            assert.are.equal(3.0, result.value)
        end)

        it("should return correct score for active", function()
            local result = calculator:calculate_fatigue(6.0, FC.ActivityLevel.ACTIVE)
            assert.is_true(result.success)
            assert.are.equal(6.0, result.value)
        end)

        it("should return correct score for high_intensity", function()
            local result = calculator:calculate_fatigue(9.0, FC.ActivityLevel.HIGH_INTENSITY)
            assert.is_true(result.success)
            assert.are.equal(9.0, result.value)
        end)

        it("should clamp to limit", function()
            local result = calculator:calculate_fatigue(15.0, FC.ActivityLevel.SEDENTARY)
            assert.is_true(result.success)
            assert.are.equal(5.0, result.value) -- Clamped to sedentary limit
        end)

        it("should fail with negative score", function()
            local result = calculator:calculate_fatigue(-1.0, FC.ActivityLevel.SEDENTARY)
            assert.is_false(result.success)
            assert.are.equal(FC.Errors.NEGATIVE_SCORE, result.error)
        end)

        it("should handle zero score", function()
            local result = calculator:calculate_fatigue(0.0, FC.ActivityLevel.SEDENTARY)
            assert.is_true(result.success)
            assert.are.equal(0.0, result.value)
        end)
    end)

    describe("calculate_recovery", function()
        it("should reduce fatigue based on sleep", function()
            local result = calculator:calculate_recovery(10.0, 8.0)
            assert.is_true(result.success)
            assert.are.equal(9.2, result.value) -- 10 - (8 * 0.1)
        end)

        it("should clamp to zero", function()
            local result = calculator:calculate_recovery(0.5, 10.0)
            assert.is_true(result.success)
            assert.are.equal(0.0, result.value)
        end)

        it("should fail with negative fatigue", function()
            local result = calculator:calculate_recovery(-1.0, 8.0)
            assert.is_false(result.success)
        end)

        it("should fail with negative sleep", function()
            local result = calculator:calculate_recovery(10.0, -1.0)
            assert.is_false(result.success)
        end)

        it("should handle zero fatigue", function()
            local result = calculator:calculate_recovery(0.0, 8.0)
            assert.is_true(result.success)
            assert.are.equal(0.0, result.value)
        end)
    end)

    describe("summarize", function()
        it("should calculate correct statistics", function()
            local scores = {3.0, 5.0, 7.0, 9.0, 11.0}
            local result = calculator:summarize(scores)
            
            assert.is_true(result.success)
            assert.are.equal(35.0, result.value.total)
            assert.are.equal(5, result.value.count)
            assert.are.equal(7.0, result.value.average)
            assert.are.equal(11.0, result.value.maximum)
            assert.are.equal(3.0, result.value.minimum)
            assert.is_false(result.value.recovered) -- avg >= 5
        end)

        it("should mark recovered when average < 5", function()
            local scores = {1.0, 2.0, 3.0, 4.0}
            local result = calculator:summarize(scores)
            
            assert.is_true(result.success)
            assert.is_true(result.value.recovered)
        end)

        it("should fail with empty list", function()
            local result = calculator:summarize({})
            assert.is_false(result.success)
            assert.are.equal(FC.Errors.EMPTY_SLICE, result.error)
        end)

        it("should handle single value", function()
            local result = calculator:summarize({5.0})
            assert.is_true(result.success)
            assert.are.equal(5.0, result.value.total)
            assert.are.equal(1, result.value.count)
        end)
    end)

    describe("compute_intensity_metrics", function()
        it("should return correct value", function()
            local result = calculator:compute_intensity_metrics(10.0, 1.5)
            assert.is_true(result.success)
            assert.are.equal(15.0, result.value)
        end)

        it("should fail with negative multiplier", function()
            local result = calculator:compute_intensity_metrics(10.0, -1.0)
            assert.is_false(result.success)
        end)

        it("should handle zero multiplier", function()
            local result = calculator:compute_intensity_metrics(10.0, 0.0)
            assert.is_true(result.success)
            assert.are.equal(0.0, result.value)
        end)
    end)

    describe("adjust_for_activity_level", function()
        it("should adjust by sedentary factor", function()
            local result = calculator:adjust_for_activity_level(10.0, FC.ActivityLevel.SEDENTARY)
            -- 10 * 1.0 = 10, clamped to sedentary limit 5
            assert.is_true(result.success)
            assert.are.equal(5.0, result.value)
        end)

        it("should adjust by active factor", function()
            local result = calculator:adjust_for_activity_level(5.0, FC.ActivityLevel.ACTIVE)
            -- 5 * 1.2 = 6, within active limit 8
            assert.is_true(result.success)
            assert.are.equal(6.0, result.value)
        end)

        it("should adjust by high_intensity factor", function()
            local result = calculator:adjust_for_activity_level(5.0, FC.ActivityLevel.HIGH_INTENSITY)
            -- 5 * 1.5 = 7.5, within limit 10
            assert.is_true(result.success)
            assert.are.equal(7.5, result.value)
        end)
    end)

    describe("verify_threshold", function()
        it("should return true when computed exceeds threshold", function()
            local result = calculator:verify_threshold(10.0, 5.0)
            assert.is_true(result.success)
            assert.is_true(result.value)
        end)

        it("should return false when computed below threshold", function()
            local result = calculator:verify_threshold(4.0, 5.0)
            assert.is_true(result.success)
            assert.is_false(result.value)
        end)

        it("should fail with negative computed", function()
            local result = calculator:verify_threshold(-1.0, 5.0)
            assert.is_false(result.success)
        end)

        it("should fail with negative threshold", function()
            local result = calculator:verify_threshold(10.0, -1.0)
            assert.is_false(result.success)
        end)
    end)

    describe("categorize_fatigue_level", function()
        it("should return mild for score < 3", function()
            local result = calculator:categorize_fatigue_level(2.0)
            assert.is_true(result.success)
            assert.are.equal(FC.FatigueLevel.MILD, result.value)
        end)

        it("should return moderate for score 3-7", function()
            local result = calculator:categorize_fatigue_level(5.0)
            assert.is_true(result.success)
            assert.are.equal(FC.FatigueLevel.MODERATE, result.value)
        end)

        it("should return severe for score >= 7", function()
            local result = calculator:categorize_fatigue_level(8.0)
            assert.is_true(result.success)
            assert.are.equal(FC.FatigueLevel.SEVERE, result.value)
        end)

        it("should fail with negative score", function()
            local result = calculator:categorize_fatigue_level(-1.0)
            assert.is_false(result.success)
        end)
    end)

    describe("compute_z_score", function()
        it("should return correct z-score", function()
            local values = {1.0, 2.0, 3.0, 4.0, 5.0}
            local result = calculator:compute_z_score(values)
            
            assert.is_true(result.success)
            -- First value is below mean
            assert.is_true(result.value < 0)
        end)

        it("should fail with empty list", function()
            local result = calculator:compute_z_score({})
            assert.is_false(result.success)
            assert.are.equal(FC.Errors.EMPTY_SLICE, result.error)
        end)
    end)

    describe("calculate_rmse", function()
        it("should return correct rmse", function()
            local predicted = {1.0, 2.0, 3.0, 4.0, 5.0}
            local actual = {1.1, 1.9, 3.2, 3.8, 5.1}
            local result = calculator:calculate_rmse(predicted, actual)
            
            assert.is_true(result.success)
            assert.is_true(result.value > 0)
            assert.is_true(result.value < 0.5)
        end)

        it("should fail with mismatched arrays", function()
            local predicted = {1.0, 2.0, 3.0}
            local actual = {1.0, 2.0}
            local result = calculator:calculate_rmse(predicted, actual)
            assert.is_false(result.success)
        end)

        it("should fail with empty arrays", function()
            local result = calculator:calculate_rmse({}, {})
            assert.is_false(result.success)
        end)
    end)

    describe("generate_forecast_trend", function()
        it("should return correct forecasts", function()
            local historical = {10.0, 11.0, 12.0, 13.0}
            local result = calculator:generate_forecast_trend(historical, 3)
            
            assert.is_true(result.success)
            assert.are.equal(3, #result.value)
            assert.are.equal(14.0, result.value[1])
            assert.are.equal(15.0, result.value[2])
            assert.are.equal(16.0, result.value[3])
        end)

        it("should fail with empty historical", function()
            local result = calculator:generate_forecast_trend({}, 3)
            assert.is_false(result.success)
        end)

        it("should fail with zero periods", function()
            local result = calculator:generate_forecast_trend({10.0}, 0)
            assert.is_false(result.success)
        end)
    end)

    describe("empty_summary", function()
        it("should return empty summary correctly", function()
            local summary = FC.empty_summary()
            assert.are.equal(0, summary.total)
            assert.are.equal(0, summary.count)
            assert.is_false(summary.recovered)
        end)
    end)
end)
