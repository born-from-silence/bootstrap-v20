// FatigueCalculator.swift
// Swift implementation of fatigue calculation algorithms
// Ported from Rust reference implementation

import Foundation

public struct FatigueProfile: Hashable, Equatable {
    let sedentaryLimit: Decimal
    let activeLimit: Decimal
    let highIntensityLimit: Decimal
    
    func getLimit(for activity: ActivityLevel) -> Decimal {
        switch activity {
        case .sedentary: return sedentaryLimit
        case .active: return activeLimit
        case .highIntensity: return highIntensityLimit
        }
    }
}

public enum ActivityLevel: String, CaseIterable {
    case sedentary = "sedentary"
    case active = "active"
    case highIntensity = "high_intensity"
}

public enum FatigueError: Error {
    case negativeScore
    case invalidLevel
    case emptySlice
}

public struct FatigueSummary {
    let total: Decimal
    let count: Int
    let average: Decimal
    let maximum: Decimal
    let minimum: Decimal
    let recovered: Bool
}

public class FatigueCalculator {
    public let profile: FatigueProfile
    
    public init(profile: FatigueProfile) {
        self.profile = profile
    }
    
    public func calculateFatigue(score: Decimal, level: ActivityLevel) -> Result<Decimal, FatigueError> {
        if score < 0 {
            return .failure(.negativeScore)
        }
        
        let limit = profile.getLimit(for: level)
        return .success(min(score, limit))
    }
    
    public func calculateFatigue(score: Decimal, level: ActivityLevel) throws -> Decimal {
        if score < 0 {
            throw FatigueError.negativeScore
        }
        
        let limit = profile.getLimit(for: level)
        return min(score, limit)
    }
    
    public func calculateRecovery(fatigue: Decimal, sleep: Decimal) -> Result<Decimal, FatigueError> {
        if fatigue < 0 {
            return .failure(.negativeScore)
        }
        if sleep < 0 {
            return .failure(.negativeScore)
        }
        
        return .success(max(fatigue - (sleep * 0.1), 0))
    }
    
    public func summarize(scores: [Decimal]) -> Result<FatigueSummary, FatigueError> {
        if scores.isEmpty {
            return .failure(.emptySlice)
        }
        
        let total = scores.reduce(0) { $0 + $1 }
        let count = scores.count
        let average = total / Decimal(count)
        let maximum = scores.max() ?? 0
        let minimum = scores.min() ?? 0
        let recovered = average < 5
        
        return .success(FatigueSummary(
            total: total,
            count: count,
            average: average,
            maximum: maximum,
            minimum: minimum,
            recovered: recovered
        ))
    }
    
    public func computeIntensityMetrics(base: Decimal, multiplier: Decimal) -> Result<Decimal, FatigueError> {
        if multiplier < 0 {
            return .failure(.invalidLevel)
        }
        
        return .success(base * multiplier)
    }
    
    public func adjustForActivityLevel(base: Decimal, activity: ActivityLevel) -> Result<Decimal, FatigueError> {
        let adjustmentFactors: [ActivityLevel: Decimal] = [
            .sedentary: Decimal(1.0),
            .active: Decimal(1.2),
            .highIntensity: Decimal(1.5)
        ]
        
        guard let factor = adjustmentFactors[activity] else {
            return .failure(.invalidLevel)
        }
        
        return .success(base * factor)
    }
    
    public func verifyThreshold(computed: Decimal, threshold: Decimal) -> Result<Bool, FatigueError> {
        if computed < 0 || threshold < 0 {
            return .failure(.negativeScore)
        }
        return .success(computed >= threshold)
    }
    
    public func metricsToJSON(metrics: FatigueSummary) -> Data? {
        let dict: [String: Any] = [
            "total": metrics.total as NSDecimalNumber,
            "count": metrics.count,
            "average": metrics.average as NSDecimalNumber,
            "max": metrics.maximum as NSDecimalNumber,
            "min": metrics.minimum as NSDecimalNumber,
            "recovered": metrics.recovered
        ]
        return try? JSONSerialization.data(withJSONObject: dict, options: .prettyPrinted)
    }
    
    public func metricsFromJSON(data: Data) -> FatigueSummary? {
        guard let dict = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            return nil
        }
        
        guard let total = dict["total"] as? NSNumber,
              let count = dict["count"] as? Int,
              let average = dict["average"] as? NSNumber,
              let max = dict["max"] as? NSNumber,
              let min = dict["min"] as? NSNumber,
              let recovered = dict["recovered"] as? Bool else {
            return nil
        }
        
        return FatigueSummary(
            total: Decimal(total.doubleValue),
            count: count,
            average: Decimal(average.doubleValue),
            maximum: Decimal(max.doubleValue),
            minimum: Decimal(min.doubleValue),
            recovered: recovered
        )
    }
    
    public func serializeMetrics(metrics: FatigueSummary) -> String? {
        guard let data = metricsToJSON(metrics: metrics),
              let json = String(data: data, encoding: .utf8) else {
            return nil
        }
        return json
    }
    
    public func categorizeFatigueLevel(score: Decimal) -> Result<String, FatigueError> {
        switch score {
        case ..<3: return .success("mild")
        case 3..<7: return .success("moderate")
        case 7..<Integer.max: return .success("severe")
        default: return .failure(.negativeScore)
        }
    }
    
    public func computeZScore(values: [Decimal]) -> Result<Decimal, FatigueError> {
        if values.isEmpty {
            return .failure(.emptySlice)
        }
        
        let mean = values.reduce(0, +) / Decimal(values.count)
        let variance = values.reduce(0) { $0 + ($1 - mean) * ($1 - mean) } / Decimal(values.count)
        let stdDev = Decimal(Double(variance.doubleValue).squareRoot())
        
        if stdDev == 0 {
            return .success(0)
        }
        
        return .success((mean - mean) / stdDev)
    }
    
    public func calculateRMSE(predicted: [Decimal], actual: [Decimal]) -> Result<Decimal, FatigueError> {
        if predicted.count != actual.count || predicted.isEmpty {
            return .failure(.emptySlice)
        }
        
        let squaredErrors = zip(predicted, actual).map { ($0 - $1) * ($0 - $1) }
        let mse = squaredErrors.reduce(0, +) / Decimal(predicted.count)
        return .success(Decimal(Double(mse.doubleValue).squareRoot()))
    }
    
    public func generateForecastTrend(historical: [Decimal], periods: Int) -> Result<[Decimal], FatigueError> {
        if historical.isEmpty || periods <= 0 {
            return .failure(.emptySlice)
        }
        
        guard let lastValue = historical.last else {
            return .failure(.emptySlice)
        }
        
        var forecasts: [Decimal] = []
        for i in 1...periods {
            let forecast = lastValue + Decimal(i)
            forecasts.append(forecast)
        }
        
        return .success(forecasts)
    }
}
