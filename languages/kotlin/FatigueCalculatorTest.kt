// FatigueCalculatorTest.kt
// JUnit 5 test suite for Kotlin FatigueCalculator implementation

package fatigue

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.EnumSource
import org.junit.jupiter.api.Nested
import kotlinx.coroutines.runBlocking

@DisplayName("FatigueCalculator Tests")
class FatigueCalculatorTest {
    
    private lateinit var calculator: FatigueCalculator
    private val defaultProfile = FatigueProfile(
        sedentaryLimit = 5.0,
        activeLimit = 8.0,
        highIntensityLimit = 10.0
    )
    
    @BeforeEach
    fun setUp() {
        calculator = FatigueCalculator(defaultProfile)
    }
    
    @Nested
    @DisplayName("Profile Tests")
    inner class ProfileTests {
        
        @Test
        @DisplayName("Profile should have correct default values")
        fun `profile has correct default values`() {
            assertEquals(5.0, defaultProfile.sedentaryLimit)
            assertEquals(8.0, defaultProfile.activeLimit)
            assertEquals(10.0, defaultProfile.highIntensityLimit)
        }
        
        @Test
        @DisplayName("getLimit should return correct limit for each activity level")
        fun `getLimit returns correct limit for each activity level`() {
            assertEquals(5.0, defaultProfile.getLimit(ActivityLevel.SEDENTARY))
            assertEquals(8.0, defaultProfile.getLimit(ActivityLevel.ACTIVE))
            assertEquals(10.0, defaultProfile.getLimit(ActivityLevel.HIGH_INTENSITY))
        }
        
        @ParameterizedTest
        @EnumSource(ActivityLevel::class)
        @DisplayName("getLimit should return positive value for all activity levels")
        fun `getLimit returns positive value for all levels`(level: ActivityLevel) {
            assertTrue(defaultProfile.getLimit(level) > 0)
        }
    }
    
    @Nested
    @DisplayName("Initialization Tests")
    inner class InitializationTests {
        
        @Test
        @DisplayName("Calculator should initialize with default profile")
        fun `calculator initializes with default profile`() {
            assertNotNull(calculator)
        }
        
        @Test
        @DisplayName("Calculator should throw exception with invalid profile")
        fun `calculator throws exception with invalid profile`() {
            assertThrows(FatigueException::class.java) {
                FatigueCalculator(FatigueProfile(0.0, 0.0, 0.0))
            }
        }
    }
    
    @Nested
    @DisplayName("calculateFatigue Tests")
    inner class CalculateFatigueTests {
        
        @ParameterizedTest
        @CsvSource("3.0,SEDENTARY,5.0,3.0", "6.0,ACTIVE,8.0,6.0", "9.0,HIGH_INTENSITY,10.0,9.0")
        @DisplayName("Should calculate fatigue within limits")
        fun `calculateFatigue returns correct score`(score: Double, levelStr: String, limit: Double, expected: Double) {
            val level = ActivityLevel.valueOf(levelStr)
            val result = calculator.calculateFatigue(score, level)
            
            assertTrue(result.isSuccess)
            assertEquals(expected, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should clamp score to limit")
        fun `calculateFatigue clamps scores to limit`() {
            val result = calculator.calculateFatigue(15.0, ActivityLevel.SEDENTARY)
            
            assertTrue(result.isSuccess)
            assertEquals(5.0, result.getOrNull()) // Should clamp to sedentary limit
        }
        
        @Test
        @DisplayName("Should fail with negative score")
        fun `calculateFatigue fails with negative score`() {
            val result = calculator.calculateFatigue(-1.0, ActivityLevel.SEDENTARY)
            
            assertTrue(result.isFailure)
            val error = result.exceptionOrNull()
            assertNotNull(error)
        }
        
        @ParameterizedTest
        @EnumSource(ActivityLevel::class)
        @DisplayName("Should handle zero score for all levels")
        fun `calculateFatigue handles zero score`(level: ActivityLevel) {
            val result = calculator.calculateFatigue(0.0, level)
            
            assertTrue(result.isSuccess)
            assertEquals(0.0, result.getOrNull())
        }
    }
    
    @Nested
    @DisplayName("calculateRecovery Tests")
    inner class CalculateRecoveryTests {
        
        @Test
        @DisplayName("Should reduce fatigue based on sleep")
        fun `calculateRecovery reduces fatigue based on sleep`() {
            val result = calculator.calculateRecovery(10.0, 8.0)
            
            assertTrue(result.isSuccess)
            assertEquals(9.2, result.getOrNull()) // 10 - (8 * 0.1)
        }
        
        @Test
        @DisplayName("Should clamp to zero")
        fun `calculateRecovery clamps to zero`() {
            val result = calculator.calculateRecovery(0.5, 10.0)
            
            assertTrue(result.isSuccess)
            assertEquals(0.0, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should fail with negative fatigue")
        fun `calculateRecovery fails with negative fatigue`() {
            val result = calculator.calculateRecovery(-1.0, 8.0)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should fail with negative sleep")
        fun `calculateRecovery fails with negative sleep`() {
            val result = calculator.calculateRecovery(10.0, -1.0)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should handle zero fatigue")
        fun `calculateRecovery handles zero fatigue`() {
            val result = calculator.calculateRecovery(0.0, 8.0)
            
            assertTrue(result.isSuccess)
            assertEquals(0.0, result.getOrNull())
        }
    }
    
    @Nested
    @DisplayName("summarize Tests")
    inner class SummarizeTests {
        
        @Test
        @DisplayName("Should calculate correct summary")
        fun `summarize calculates correct statistics`() {
            val scores = listOf(3.0, 5.0, 7.0, 9.0, 11.0)
            val result = calculator.summarize(scores)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { summary ->
                assertEquals(35.0, summary.total)
                assertEquals(5, summary.count)
                assertEquals(7.0, summary.average)
                assertEquals(11.0, summary.maximum)
                assertEquals(3.0, summary.minimum)
                assertFalse(summary.recovered) // avg >= 5
            }
        }
        
        @Test
        @DisplayName("Should mark recovered when average < 5")
        fun `summarize marks recovered when average below threshold`() {
            val scores = listOf(1.0, 2.0, 3.0, 4.0)
            val result = calculator.summarize(scores)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { summary ->
                assertTrue(summary.recovered)
            }
        }
        
        @Test
        @DisplayName("Should fail with empty list")
        fun `summarize fails with empty list`() {
            val result = calculator.summarize(emptyList())
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should handle single value")
        fun `summarize handles single value`() {
            val result = calculator.summarize(listOf(5.0))
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { summary ->
                assertEquals(5.0, summary.total)
                assertEquals(1, summary.count)
                assertEquals(5.0, summary.maximum)
                assertEquals(5.0, summary.minimum)
            }
        }
    }
    
    @Nested
    @DisplayName("computeIntensityMetrics Tests")
    inner class ComputeIntensityMetricsTests {
        
        @Test
        @DisplayName("Should compute valid metrics")
        fun `computeIntensityMetrics returns correct value`() {
            val result = calculator.computeIntensityMetrics(10.0, 1.5)
            
            assertTrue(result.isSuccess)
            assertEquals(15.0, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should fail with negative multiplier")
        fun `computeIntensityMetrics fails with negative multiplier`() {
            val result = calculator.computeIntensityMetrics(10.0, -1.0)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should handle zero multiplier")
        fun `computeIntensityMetrics handles zero multiplier`() {
            val result = calculator.computeIntensityMetrics(10.0, 0.0)
            
            assertTrue(result.isSuccess)
            assertEquals(0.0, result.getOrNull())
        }
    }
    
    @Nested
    @DisplayName("adjustForActivityLevel Tests")
    inner class AdjustForActivityLevelTests {
        
        @ParameterizedTest
        @CsvSource("5.0,SEDENTARY,5.0", "5.0,ACTIVE,6.0", "5.0,HIGH_INTENSITY,7.5")
        @DisplayName("Should adjust base by activity factors")
        fun `adjustForActivityLevel adjusts by activity factors`(
            base: Double,
            levelStr: String,
            expected: Double
        ) {
            val level = ActivityLevel.valueOf(levelStr)
            val result = calculator.adjustForActivityLevel(base, level)
            
            assertTrue(result.isSuccess)
            assertEquals(expected, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should clamp to limit")
        fun `adjustForActivityLevel clamps to limit`() {
            val result = calculator.adjustForActivityLevel(10.0, ActivityLevel.SEDENTARY)
            
            assertTrue(result.isSuccess)
            // 10 * 1.0 = 10, clamped to sedentary limit 5
            assertEquals(5.0, result.getOrNull())
        }
    }
    
    @Nested
    @DisplayName("verifyThreshold Tests")
    inner class VerifyThresholdTests {
        
        @ParameterizedTest
        @CsvSource("10.0,5.0,true", "4.0,5.0,false")
        @DisplayName("Should verify threshold correctly")
        fun `verifyThreshold returns correct boolean`(computed: Double, threshold: Double, expected: Boolean) {
            val result = calculator.verifyThreshold(computed, threshold)
            
            assertTrue(result.isSuccess)
            assertEquals(expected, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should fail with negative computed")
        fun `verifyThreshold fails with negative computed`() {
            val result = calculator.verifyThreshold(-1.0, 5.0)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should fail with negative threshold")
        fun `verifyThreshold fails with negative threshold`() {
            val result = calculator.verifyThreshold(10.0, -1.0)
            
            assertTrue(result.isFailure)
        }
    }
    
    @Nested
    @DisplayName("JSON Serialization Tests")
    inner class JsonSerializationTests {
        
        @Test
        @DisplayName("Should serialize metrics to JSON")
        fun `metricsToJSON serializes correctly`() {
            val summary = FatigueSummary(
                total = 100.0,
                count = 10,
                average = 10.0,
                maximum = 20.0,
                minimum = 5.0,
                recovered = false
            )
            
            val json = calculator.metricsToJSON(summary)
            
            assertTrue(json.contains("total"))
            assertTrue(json.contains("count"))
            assertTrue(json.contains("recovered"))
        }
        
        @Test
        @DisplayName("Should parse metrics from JSON")
        fun `metricsFromJSON parses correctly`() {
            val json = """{"total":50.0,"count":5,"average":10.0,"maximum":15.0,"minimum":5.0,"recovered":true}"""
            val result = calculator.metricsFromJSON(json)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { summary ->
                assertEquals(50.0, summary.total)
                assertEquals(5, summary.count)
                assertTrue(summary.recovered)
            }
        }
    }
    
    @Nested
    @DisplayName("Other Algorithm Tests")
    inner class OtherAlgorithmTests {
        
        @ParameterizedTest
        @CsvSource("2.0,MILD", "4.0,MODERATE", "8.0,SEVERE")
        @DisplayName("Should categorize fatigue levels")
        fun `categorizeFatigueLevel returns correct level`(score: Double, expectedStr: String) {
            val result = calculator.categorizeFatigueLevel(score)
            val expected = FatigueLevel.valueOf(expectedStr)
            
            assertTrue(result.isSuccess)
            assertEquals(expected, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should fail with negative score")
        fun `categorizeFatigueLevel fails with negative score`() {
            val result = calculator.categorizeFatigueLevel(-1.0)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should compute z-score")
        fun `computeZScore returns correct value`() {
            val values = listOf(1.0, 2.0, 3.0, 4.0, 5.0)
            val result = calculator.computeZScore(values)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { zScore ->
                assertTrue(zScore < 0) // First value is below mean
            }
        }
        
        @Test
        @DisplayName("Should fail z-score with empty list")
        fun `computeZScore fails with empty list`() {
            val result = calculator.computeZScore(emptyList())
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should calculate RMSE")
        fun `calculateRMSE returns correct value`() {
            val predicted = listOf(1.0, 2.0, 3.0, 4.0, 5.0)
            val actual = listOf(1.1, 1.9, 3.2, 3.8, 5.1)
            val result = calculator.calculateRMSE(predicted, actual)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { rmse ->
                assertTrue(rmse > 0)
                assertTrue(rmse < 0.5) // Should be small
            }
        }
        
        @Test
        @DisplayName("Should fail RMSE with mismatched arrays")
        fun `calculateRMSE fails with mismatched arrays`() {
            val predicted = listOf(1.0, 2.0, 3.0)
            val actual = listOf(1.0, 2.0)
            
            val result = calculator.calculateRMSE(predicted, actual)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should generate forecast trend")
        fun `generateForecastTrend returns correct values`() {
            val historical = listOf(10.0, 11.0, 12.0, 13.0)
            val result = calculator.generateForecastTrend(historical, 3)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { forecasts ->
                assertEquals(3, forecasts.size)
                assertEquals(14.0, forecasts[0])
                assertEquals(15.0, forecasts[1])
                assertEquals(16.0, forecasts[2])
            }
        }
        
        @Test
        @DisplayName("Should fail forecast with empty historical")
        fun `generateForecastTrend fails with empty historical`() {
            val result = calculator.generateForecastTrend(emptyList(), 3)
            
            assertTrue(result.isFailure)
        }
        
        @Test
        @DisplayName("Should fail forecast with zero periods")
        fun `generateForecastTrend fails with zero periods`() {
            val result = calculator.generateForecastTrend(listOf(10.0), 0)
            
            assertTrue(result.isFailure)
        }
    }
    
    @Nested
    @DisplayName("Async Tests")
    inner class AsyncTests {
        
        @Test
        @DisplayName("Should calculate fatigue asynchronously")
        fun `calculateFatigueAsync works`() = runBlocking {
            val result = calculator.calculateFatigueAsync(5.0, ActivityLevel.ACTIVE)
            
            assertTrue(result.isSuccess)
            assertEquals(5.0, result.getOrNull())
        }
        
        @Test
        @DisplayName("Should summarize asynchronously")
        fun `summarizeAsync works`() = runBlocking {
            val scores = listOf(1.0, 2.0, 3.0)
            val result = calculator.summarizeAsync(scores)
            
            assertTrue(result.isSuccess)
            result.getOrNull()?.let { summary ->
                assertEquals(2.0, summary.average)
            }
        }
    }
}
