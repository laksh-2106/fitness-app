package com.fitnesstracker

import com.facebook.react.bridge.ReactApplicationContext

class StepCounter(private val reactContext: ReactApplicationContext) {

    /**
     * Returns step counts for the last 4 days.
     * A full implementation would use Health Connect or the Fitness Sensors API
     * with OAuth consent; here we return zeros so the UI renders without
     * requiring extra setup, matching the iOS fallback behavior.
     */
    fun fetchStepsForLastFourDays(): List<Int> {
        return listOf(0, 0, 0, 0)
    }
}
