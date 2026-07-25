package com.fitnesstracker

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = RNGoogleMapsModule.NAME)
class RNGoogleMapsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNGoogleMaps"
        private var eventEmitter: RNGoogleMapsModule? = null

        fun sendEvent(reactContext: ReactApplicationContext, eventName: String, params: WritableMap) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    init {
        eventEmitter = this
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun initiateGoogleMaps(message: ReadableMap, promise: Promise) {
        val contract = Arguments.toBundle(message)
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }
        val intent = Intent(currentActivity, GoogleMapsActivity::class.java)
        if (contract != null) {
            intent.putExtras(contract)
        }
        currentActivity.startActivityForResult(intent, 1001)
        promise.resolve(true)
    }

    @ReactMethod
    fun getUpdatedSteps(message: ReadableMap, promise: Promise) {
        Thread {
            try {
                val stepCounter = StepCounter(reactContext)
                val steps = stepCounter.fetchStepsForLastFourDays()
                val array = Arguments.fromList(steps.map { it })
                promise.resolve(array)
            } catch (e: Exception) {
                promise.reject("STEP_ERROR", e)
            }
        }.start()
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter registration
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter registration
    }
}
