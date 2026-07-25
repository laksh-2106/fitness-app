package com.fitnesstracker

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = RNEventEmitterModule.NAME)
class RNEventEmitterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNEventEmitter"
        const val EVENT_START = "onStartWorkout"
        const val EVENT_END = "onEndWorkout"

        private var instance: RNEventEmitterModule? = null

        fun emit(reactContext: ReactApplicationContext, eventName: String, params: WritableMap) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = NAME

    override fun getConstants(): Map<String, Any> {
        return mapOf(
            "onStartWorkout" to EVENT_START,
            "onEndWorkout" to EVENT_END
        )
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
