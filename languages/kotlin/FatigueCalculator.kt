// FatigueCalculator.kt
// Kotlin implementation of fatigue calculation algorithms
// Supports JVM, Android, and Kotlin/Native targets

package fatigue

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.math.sqrt

@Serializable
enum class ActivityLevel {
    SEDENTARY,
    ACTIVE,
    HIGH_INTENSITY
}

@Serializable
enum class FatigueLevel {
    MILD,
    MODERATE,
    SEVERE
}

class FatigueException(message: String) : Exception(message)

@Serializable
data class FatigueProfile(
    val sedentaryLimit: Double = 5.0,
    val activeLimit: Double = 8.0,
    val highIntensityLimit: Double = 10.0
) {
    fun getLimit(level: ActivityLevel): Double = when (level) {
        ActivityLevel.SEDENTARY -> sedentaryLimit
        ActivityLevel.ACTIVE -> activeLimit
        ActivityLevel.HIGH_INTENSITY -> highIntensityLimit
    }
}

@Serializable
data class FatigueSummary(
    val total: Double,
    val count: Int,
    val average: Double,
    val maximum: Double,
    val minimum: Double,
    val recovered: Boolean
) {
    companion object {
        fun empty(): FatigueSummary = FatigueSummary(
            total = 0.0,
            count = 0,
            average = 0.0,
            maximum = 0.0,
            minimum = 0.0,
            recovered = false
        )
    }
}

class FatigueCalculator(private val profile: FatigueProfile = FatigueProfile()) {
    
    init {
        if (profile.sedentaryLimit <= 0 || profile.activeLimit <= 0 || profile.highIntensityLimit <= 0) {
            throw FatigueException("Limits must be positive")
        }
    }
    
    fun calculateFatigue(score: Double, level: ActivityLevel): Result<Double> {
        if (score < 0) {
            return Result.failure(FatigueException("Score cannot be negative"))
        }
        
        val limit = profile.getLimit(level)
        return Result.success(minOf(score, limit))
    }
    
    fun calculateRecovery(fatigue: Double, sleep: Double): Result<Double> {
        if (fatigue < 0 || sleep < 0) {
            return Result.failure(FatigueException("Values cannot be negative"))
        }
        
        return Result.success(maxOf(fatigue - (sleep * 0.1), 0.0))
    }
    
    fun summarize(scores: List<Double>): Result<FatigueSummary> {
        if (scores.isEmpty()) {
            return Result.failure(FatigueException("Cannot summarize empty list"))
        }
        
        val total = scores.sum()
        val count = scores.size
        val average = total / count
        val maximum = scores.maxOrNull() ?: 0.0
        val minimum = scores.minOrNull() ?: 0.0
        val recovered = average < 5.0
        
        return Result.success(
            FatigueSummary(
                total = total,
                count = count,
                average = average,
                maximum = maximum,
                minimum = minimum,
                recovered = recovered
            )
        )
    }
    
    fun computeIntensityMetrics(base: Double, multiplier: Double): Result<Double> {
        if (multiplier < 0) {
            return Result.failure(FatigueException("Multiplier cannot be negative"))
        }
        return Result.success(base * multiplier)
    }
    
    fun adjustForActivityLevel(base: Double, activity: ActivityLevel): Result<Double> =
        calculateFatigue(base, activity)
    
    fun verifyThreshold(computed: Double, threshold: Double): Result<Boolean> {
        if (computed < 0 || threshold < 0) {
            return Result.failure(FatigueException("Values cannot be negative"))
        }
        return Result.success(computed >= threshold)
    }
    
    fun metricsToJSON(summary: FatigueSummary): String {
        return Json.encodeToString(FatigueSummary.serializer(), summary)
    }
    
    fun metricsFromJSON(json: String): Result<FatigueSummary> {
        return try {
            Result.success(Json.decodeFromString(FatigueSummary.serializer(), json))
        } catch (e: Exception) {
            Result.failure(FatigueException("Failed to parse JSON: ${e.message}"))
        }
    }
    
    fun serializeMetrics(summary: FatigueSummary): String = metricsToJSON(summary)
    
    fun categorizeFatigueLevel(score: Double): Result<FatigueLevel> {
        return when {
            score < 0 -> Result.failure(FatigueException("Score cannot be negative"))
            score < 3.0 -> Result.success(FatigueLevel.MILD)
            score < 7.0 -> Result.success(FatigueLevel.MODERATE)
            else -> Result.success(FatigueLevel.SEVERE)
        }
    }
    
    fun computeZScore(values: List<Double>): Result<Double> {
        if (values.isEmpty()) {
            return Result.failure(FatigueException("Cannot compute z-score for empty list"))
        }
        
        val mean = values.average()
        val variance = values.map { (it - mean) * (it - mean) }.average()
        val stdDev = sqrt(variance)
        
        return if (stdDev == 0.0) {
            Result.success(0.0)
        } else {
            Result.success((values.first() - mean) / stdDev)
        }
    }
    
    fun calculateRMSE(predicted: List<Double>, actual: List<Double>): Result<Double> {
        if (predicted.size != actual.size || predicted.isEmpty()) {
            return Result.failure(FatigueException("Lists must have same non-zero length"))
        }
        
        val mse = predicted.zip(actual) { p, a -> (p - a) * (p - a) }.average()
        return Result.success(sqrt(mse))
    }
    
    fun generateForecastTrend(historical: List<Double>, periods: Int): Result<List<Double>> {
        if (historical.isEmpty() || periods <= 0) {
            return Result.failure(FatigueException("Historical data required and periods must be positive"))
        }
        
        val last = historical.last()
        val trend = (historical.lastOrNull() ?: last) - (historical.firstOrNull() ?: last)
        
        val forecasts = (1..periods).map { i ->
            maxOf(0.0, last + (trend * i))
        }
        
        return Result.success(forecasts)
    }
    
    // Coroutine-based async versions for Kotlin concurrency
    suspend fun calculateFatigueAsync(score: Double, level: ActivityLevel): Result<Double> {
        return calculateFatigue(score, level)
    }
    
    suspend fun summarizeAsync(scores: List<Double>): Result<FatigueSummary> {
        return summarize(scores)
    }
}
