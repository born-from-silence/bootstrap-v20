-- FatigueCalculator.lua
-- Lua implementation of fatigue calculation algorithms
-- Portable across Lua 5.1-5.4, LuaJIT, and embedded contexts

local FatigueCalculator = {}
FatigueCalculator.__index = FatigueCalculator

-- Activity levels
FatigueCalculator.ActivityLevel = {
    SEDENTARY = "sedentary",
    ACTIVE = "active",
    HIGH_INTENSITY = "high_intensity"
}

-- Fatigue levels
FatigueCalculator.FatigueLevel = {
    MILD = "mild",
    MODERATE = "moderate",
    SEVERE = "severe"
}

-- Error types
FatigueCalculator.Errors = {
    NEGATIVE_SCORE = "negative score",
    INVALID_LEVEL = "invalid level",
    EMPTY_SLICE = "empty slice"
}

-- Default profile
local DEFAULT_PROFILE = {
    sedentary_limit = 5.0,
    active_limit = 8.0,
    high_intensity_limit = 10.0
}

-- Constructor
---@param profile table|nil Custom fatigue profile or nil for defaults
---@return FatigueCalculator
function FatigueCalculator.new(profile)
    local self = setmetatable({}, FatigueCalculator)
    self.profile = profile or DEFAULT_PROFILE
    return self
end

-- Get limit for activity level
---@param level string Activity level
---@return number
function FatigueCalculator:get_limit(level)
    if level == self.ActivityLevel.SEDENTARY then
        return self.profile.sedentary_limit
    elseif level == self.ActivityLevel.ACTIVE then
        return self.profile.active_limit
    elseif level == self.ActivityLevel.HIGH_INTENSITY then
        return self.profile.high_intensity_limit
    else
        error(self.Errors.INVALID_LEVEL)
    end
end

-- Calculate fatigue score
---@param score number Input score
---@param level string Activity level
---@return table Result with value or error
function FatigueCalculator:calculate_fatigue(score, level)
    if score < 0 then
        return { success = false, error = self.Errors.NEGATIVE_SCORE }
    end
    
    local limit = self:get_limit(level)
    return { success = true, value = math.min(score, limit) }
end

-- Calculate recovery
---@param fatigue number Current fatigue
---@param sleep number Sleep hours
---@return table Result with recovered fatigue or error
function FatigueCalculator:calculate_recovery(fatigue, sleep)
    if fatigue < 0 or sleep < 0 then
        return { success = false, error = self.Errors.NEGATIVE_SCORE }
    end
    
    local recovered = math.max(fatigue - (sleep * 0.1), 0)
    return { success = true, value = recovered }
end

-- Summarize scores
---@param scores table Array of scores
---@return table Result with summary or error
function FatigueCalculator:summarize(scores)
    if #scores == 0 then
        return { success = false, error = self.Errors.EMPTY_SLICE }
    end
    
    local total = 0
    local maximum = scores[1]
    local minimum = scores[1]
    
    for _, score in ipairs(scores) do
        total = total + score
        if score > maximum then maximum = score end
        if score < minimum then minimum = score end
    end
    
    local average = total / #scores
    
    return {
        success = true,
        value = {
            total = total,
            count = #scores,
            average = average,
            maximum = maximum,
            minimum = minimum,
            recovered = average < 5.0
        }
    }
end

-- Compute intensity metrics
---@param base number Base value
---@param multiplier number Multiplier
---@return table Result with intensity or error
function FatigueCalculator:compute_intensity_metrics(base, multiplier)
    if multiplier < 0 then
        return { success = false, error = self.Errors.INVALID_LEVEL }
    end
    return { success = true, value = base * multiplier }
end

-- Adjust for activity level
---@param base number Base value
---@param activity string Activity level
---@return table Result with adjusted value or error
function FatigueCalculator:adjust_for_activity_level(base, activity)
    local factors = {
        [self.ActivityLevel.SEDENTARY] = 1.0,
        [self.ActivityLevel.ACTIVE] = 1.2,
        [self.ActivityLevel.HIGH_INTENSITY] = 1.5
    }
    
    local factor = factors[activity]
    if not factor then
        return { success = false, error = self.Errors.INVALID_LEVEL }
    end
    
    return { success = true, value = base * factor }
end

-- Verify threshold
---@param computed number Computed value
---@param threshold number Threshold to check against
---@return table Result with boolean or error
function FatigueCalculator:verify_threshold(computed, threshold)
    if computed < 0 or threshold < 0 then
        return { success = false, error = self.Errors.NEGATIVE_SCORE }
    end
    return { success = true, value = computed >= threshold }
end

-- Convert metrics to JSON
---@param metrics table Metrics summary
---@return string JSON string
function FatigueCalculator:metrics_to_json(metrics)
    local parts = {}
    table.insert(parts, string.format('"total":%.2f', metrics.total))
    table.insert(parts, string.format('"count":%d', metrics.count))
    table.insert(parts, string.format('"average":%.2f', metrics.average))
    table.insert(parts, string.format('"maximum":%.2f', metrics.maximum))
    table.insert(parts, string.format('"minimum":%.2f', metrics.minimum))
    table.insert(parts, string.format('"recovered":%s', tostring(metrics.recovered)))
    return "{" .. table.concat(parts, ",") .. "}"
end

-- Parse metrics from JSON (simplified)
---@param json_str string JSON string
---@return table Result with metrics or error
function FatigueCalculator:metrics_from_json(json_str)
    -- This is a simplified implementation
    -- In production, use a proper JSON library like cjson or dkjson
    local success, metrics = pcall(function()
        -- Very basic parsing - assumes well-formed JSON
        local result = {}
        for k, v in json_str:gmatch('"(%w+)":([%d%.]+)') do
            result[k] = tonumber(v)
        end
        result.recovered = json_str:find('"recovered":true') ~= nil
        return result
    end)
    
    if not success then
        return { success = false, error = "JSON parse error" }
    end
    
    -- Ensure required fields
    if not (metrics.total and metrics.count and metrics.average) then
        return { success = false, error = "Missing required fields" }
    end
    
    return { success = true, value = metrics }
end

-- Serialize metrics
---@param metrics table Metrics to serialize
---@return string JSON string
function FatigueCalculator:serialize_metrics(metrics)
    return self:metrics_to_json(metrics)
end

-- Categorize fatigue level
---@param score number Score to categorize
---@return table Result with level or error
function FatigueCalculator:categorize_fatigue_level(score)
    if score < 0 then
        return { success = false, error = self.Errors.NEGATIVE_SCORE }
    end
    
    if score < 3.0 then
        return { success = true, value = self.FatigueLevel.MILD }
    elseif score < 7.0 then
        return { success = true, value = self.FatigueLevel.MODERATE }
    else
        return { success = true, value = self.FatigueLevel.SEVERE }
    end
end

-- Compute z-score
---@param values table Array of values
---@return table Result with z-score or error
function FatigueCalculator:compute_z_score(values)
    if #values == 0 then
        return { success = false, error = self.Errors.EMPTY_SLICE }
    end
    
    local sum = 0
    for _, v in ipairs(values) do
        sum = sum + v
    end
    local mean = sum / #values
    
    local variance_sum = 0
    for _, v in ipairs(values) do
        local diff = v - mean
        variance_sum = variance_sum + (diff * diff)
    end
    local variance = variance_sum / #values
    local std_dev = math.sqrt(variance)
    
    if std_dev == 0 then
        return { success = true, value = 0 }
    end
    
    return { success = true, value = (values[1] - mean) / std_dev }
end

-- Calculate RMSE
---@param predicted table Predicted values
---@param actual table Actual values
---@return table Result with RMSE or error
function FatigueCalculator:calculate_rmse(predicted, actual)
    if #predicted ~= #actual or #predicted == 0 then
        return { success = false, error = self.Errors.EMPTY_SLICE }
    end
    
    local sum_squared_error = 0
    for i = 1, #predicted do
        local err = predicted[i] - actual[i]
        sum_squared_error = sum_squared_error + (err * err)
    end
    
    local mse = sum_squared_error / #predicted
    return { success = true, value = math.sqrt(mse) }
end

-- Generate forecast trend
---@param historical table Historical data
---@param periods number Number of periods to forecast
---@return table Result with forecasts or error
function FatigueCalculator:generate_forecast_trend(historical, periods)
    if #historical == 0 or periods <= 0 then
        return { success = false, error = self.Errors.EMPTY_SLICE }
    end
    
    local last = historical[#historical]
    local forecasts = {}
    
    for i = 1, periods do
        local forecast = last + i
        table.insert(forecasts, forecast)
    end
    
    return { success = true, value = forecasts }
end

-- Create empty summary
---@return table Empty summary
function FatigueCalculator.empty_summary()
    return {
        total = 0,
        count = 0,
        average = 0,
        maximum = 0,
        minimum = 0,
        recovered = false
    }
end

return FatigueCalculator
