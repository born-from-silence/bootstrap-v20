// FatigueCalculatorTests.swift
// XCTest suite for Swift FatigueCalculator implementation

import XCTest
@testable import FatigueCalculator

class FatigueCalculatorTests: XCTestCase {
    
    var defaultProfile: FatigueProfile!
    var customProfile: FatigueProfile!
    var calculator: FatigueCalculator!
    
    override func setUp() {
        super.setUp()
        defaultProfile = FatigueProfile(sedentaryLimit: 5, activeLimit: 8, highIntensityLimit: 10)
        customProfile = FatigueProfile(sedentaryLimit: 3, activeLimit: 6, highIntensityLimit: 8)
        calculator = FatigueCalculator(profile: defaultProfile)
    }
    
    override func tearDown() {
        defaultProfile = nil
        customProfile = nil
        calculator = nil
        super.tearDown()
    }
    
    // MARK: - Initialization Tests
    
    func testProfileInitializationWithDefaults() {
        XCTAssertEqual(defaultProfile.sedentaryLimit, 5)
        XCTAssertEqual(defaultProfile.activeLimit, 8)
        XCTAssertEqual(defaultProfile.highIntensityLimit, 10)
    }
    
    func testProfileInitializationWithCustomValues() {
        XCTAssertEqual(customProfile.sedentaryLimit, 3)
        XCTAssertEqual(customProfile.activeLimit, 6)
        XCTAssertEqual(customProfile.highIntensityLimit, 8)
    }
    
    func testCalculatorInitialization() {
        let calc = FatigueCalculator(profile: defaultProfile)
        XCTAssertNotNil(calc)
    }
    
    // MARK: - calculateFatigue Tests
    
    func testCalculateFatigueSedentary() {
        let result = calculator.calculateFatigue(score: 3, level: .sedentary)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 3)
        case .failure(let error):
            XCTFail("Unexpected error: \(error)")
        }
    }
    
    func testCalculateFatigueActive() {
        let result = calculator.calculateFatigue(score: 6, level: .active)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 6)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCalculateFatigueHighIntensity() {
        let result = calculator.calculateFatigue(score: 9, level: .highIntensity)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 9)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCalculateFatigueClampsToLimit() {
        let result = calculator.calculateFatigue(score: 15, level: .sedentary)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 5) // Should clamp to sedentary limit
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCalculateFatigueNegativeScore() {
        let result = calculator.calculateFatigue(score: -1, level: .sedentary)
        switch result {
        case .success:
            XCTFail("Should fail with negative score")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.negativeScore)
        }
    }
    
    // MARK: - calculateRecovery Tests
    
    func testCalculateRecoveryReducesFatigue() {
        let result = calculator.calculateRecovery(fatigue: 10, sleep: 8)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 9.2) // 10 - (8 * 0.1)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCalculateRecoveryClampsToZero() {
        let result = calculator.calculateRecovery(fatigue: 0.5, sleep: 10)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 0)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCalculateRecoveryNegativeFatigue() {
        let result = calculator.calculateRecovery(fatigue: -1, sleep: 8)
        switch result {
        case .success:
            XCTFail("Should fail with negative fatigue")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.negativeScore)
        }
    }
    
    func testCalculateRecoveryNegativeSleep() {
        let result = calculator.calculateRecovery(fatigue: 10, sleep: -1)
        switch result {
        case .success:
            XCTFail("Should fail with negative sleep")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.negativeScore)
        }
    }
    
    // MARK: - summarize Tests
    
    func testSummarizeBasic() {
        let scores: [Decimal] = [3, 5, 7, 9, 11]
        let result = calculator.summarize(scores: scores)
        
        switch result {
        case .success(let summary):
            XCTAssertEqual(summary.total, 35)
            XCTAssertEqual(summary.count, 5)
            XCTAssertEqual(summary.average, 7)
            XCTAssertEqual(summary.maximum, 11)
            XCTAssertEqual(summary.minimum, 3)
            XCTAssertFalse(summary.recovered) // avg 7 >= 5
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testSummarizeEmptyScores() {
        let result = calculator.summarize(scores: [])
        switch result {
        case .success:
            XCTFail("Should fail with empty scores")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.emptySlice)
        }
    }
    
    func testSummarizeRecoveredTrue() {
        let scores: [Decimal] = [1, 2, 3, 4]
        let result = calculator.summarize(scores: scores)
        
        switch result {
        case .success(let summary):
            XCTAssertTrue(summary.recovered) // avg < 5
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    // MARK: - intensityMetrics Tests
    
    func testComputeIntensityMetricsValid() {
        let result = calculator.computeIntensityMetrics(base: 10, multiplier: 1.5)
        switch result {
        case .success(let value):
            XCTAssertEqual(value, 15)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testComputeIntensityMetricsNegativeMultiplier() {
        let result = calculator.computeIntensityMetrics(base: 10, multiplier: -1)
        switch result {
        case .success:
            XCTFail("Should fail with negative multiplier")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.invalidLevel)
        }
    }
    
    // MARK: - adjustForActivityLevel Tests
    
    func testAdjustForSedentary() {
        let result = calculator.adjustForActivityLevel(base: 10, activity: .sedentary)
        switch result {
        case .success(let value):
            // 10 * 1.0 = 10, clamped to sedentary limit 5
            XCTAssertEqual(value, 5)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testAdjustForActive() {
        let result = calculator.adjustForActivityLevel(base: 5, activity: .active)
        switch result {
        case .success(let value):
            // 5 * 1.2 = 6, within active limit 8
            XCTAssertEqual(value, 6)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testAdjustForHighIntensity() {
        let result = calculator.adjustForActivityLevel(base: 5, activity: .highIntensity)
        switch result {
        case .success(let value):
            // 5 * 1.5 = 7.5, within limit 10
            XCTAssertEqual(value, 7.5)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    // MARK: - verifyThreshold Tests
    
    func testVerifyThresholdTrue() {
        let result = calculator.verifyThreshold(computed: 10, threshold: 5)
        switch result {
        case .success(let value):
            XCTAssertTrue(value)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testVerifyThresholdFalse() {
        let result = calculator.verifyThreshold(computed: 4, threshold: 5)
        switch result {
        case .success(let value):
            XCTAssertFalse(value)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testVerifyThresholdNegativeComputed() {
        let result = calculator.verifyThreshold(computed: -1, threshold: 5)
        switch result {
        case .success:
            XCTFail("Should fail with negative computed")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.negativeScore)
        }
    }
    
    // MARK: - JSON Serialization Tests
    
    func testMetricsToJSON() {
        let summary = FatigueSummary(total: 100, count: 10, average: 10, maximum: 20, minimum: 5, recovered: false)
        let jsonData = calculator.metricsToJSON(metrics: summary)
        
        XCTAssertNotNil(jsonData)
        if let data = jsonData {
            XCTAssertGreaterThan(data.count, 0)
        }
    }
    
    func testSerializeMetrics() {
        let summary = FatigueSummary(total: 50, count: 5, average: 10, maximum: 15, minimum: 5, recovered: true)
        let jsonString = calculator.serializeMetrics(metrics: summary)
        
        XCTAssertNotNil(jsonString)
        XCTAssertTrue(jsonString?.contains("true") ?? false) // recovered field
    }
    
    // MARK: - Other Algorithm Tests
    
    func testCategorizeFatigueLevelMild() {
        let result = calculator.categorizeFatigueLevel(score: 2)
        switch result {
        case .success(let level):
            XCTAssertEqual(level, "mild")
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCategorizeFatigueLevelModerate() {
        let result = calculator.categorizeFatigueLevel(score: 5)
        switch result {
        case .success(let level):
            XCTAssertEqual(level, "moderate")
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCategorizeFatigueLevelSevere() {
        let result = calculator.categorizeFatigueLevel(score: 8)
        switch result {
        case .success(let level):
            XCTAssertEqual(level, "severe")
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testComputeZScore() {
        let values: [Decimal] = [1, 2, 3, 4, 5]
        let result = calculator.computeZScore(values: values)
        switch result {
        case .success(let zScore):
            // Z-score of first value should be approximately -1.414
            XCTAssertGreaterThan(zScore, -2)
            XCTAssertLessThan(zScore, 0)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testComputeZScoreEmpty() {
        let result = calculator.computeZScore(values: [])
        switch result {
        case .success:
            XCTFail("Should fail with empty values")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.emptySlice)
        }
    }
    
    func testCalculateRMSE() {
        let predicted: [Decimal] = [1, 2, 3, 4, 5]
        let actual: [Decimal] = [1.1, 1.9, 3.2, 3.8, 5.1]
        let result = calculator.calculateRMSE(predicted: predicted, actual: actual)
        switch result {
        case .success(let rmse):
            // RMSE should be small since values are close
            XCTAssertGreaterThan(rmse, 0)
            XCTAssertLessThan(rmse, 0.5)
        case .failure:
            XCTFail("Should not fail")
        }
    }
    
    func testCalculateRMSEMismatchedArrays() {
        let predicted: [Decimal] = [1, 2, 3]
        let actual: [Decimal] = [1, 2]
        let result = calculator.calculateRMSE(predicted: predicted, actual: actual)
        switch result {
        case .success:
            XCTFail("Should fail with mismatched arrays")
        case .failure(let error):
            XCTAssertEqual(error, FatigueError.emptySlice)
        }
    }
    
    func testGenerateForecastTrend() async throws {
        let historical: [Decimal] = [10, 11, 12, 13]
        let result = calculator.generateForecastTrend(historical: historical, periods: 3)
        switch result {
        case .success(let forecasts):
            XCTAssertEqual(forecasts.count, 3)
            XCTAssertEqual(forecasts[0], 14)
            XCTAssertEqual(forecasts[1], 15)
            XCTAssertEqual(forecasts[2], 16)
        case .failure:
            XCTFail("Should not fail")
        }
    }
}
