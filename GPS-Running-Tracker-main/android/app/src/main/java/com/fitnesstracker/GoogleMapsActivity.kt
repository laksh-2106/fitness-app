package com.fitnesstracker

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.location.Location
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.PolylineOptions
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class GoogleMapsActivity : AppCompatActivity(), OnMapReadyCallback {

    private var googleMap: GoogleMap? = null
    private var fusedLocationClient: FusedLocationProviderClient? = null
    private var locationCallback: LocationCallback? = null
    private var polyline: Polyline? = null
    private var polylineOptions: PolylineOptions? = null
    private var marker: Marker? = null

    private var isLive: Boolean = false
    private var currentlyGoingOn: Boolean = false
    private var startTime: Long = 0L
    private var totalDistance: Double = 0.0
    private var lastLatLng: LatLng? = null

    private var startButton: Button? = null
    private var stopButton: Button? = null
    private var timeLabel: TextView? = null
    private var distanceLabel: TextView? = null
    private var speedLabel: TextView? = null
    private var detailsContainer: LinearLayout? = null

    private val handler = Handler(Looper.getMainLooper())
    private var timerRunnable: Runnable? = null

    // Contract fields
    private var contractId: String? = null
    private var contractLob: String? = null
    private var contractType: String? = null
    private var contractSubType: String? = null
    private var contractDate: String? = null
    private var contractStartTime: String? = null
    private var contractEndTime: String? = null
    private var contractDuration: String? = null
    private var contractLength: String? = null
    private var contractAvgSpeed: String? = null
    private val contractCoordinates = mutableListOf<LatLng>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        val mapContainer = FrameLayoutHolder(this)
        mapContainer.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
        )
        root.addView(mapContainer)

        buildDetailsPanel(root)
        buildButtons(root)

        setContentView(root)

        parseContract(intent.extras)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val mapFragment = SupportMapFragment.newInstance()
        supportFragmentManager.beginTransaction()
            .replace(mapContainer.id, mapFragment)
            .commitNow()
        mapFragment.getMapAsync(this)
    }

    private fun parseContract(extras: Bundle?) {
        if (extras == null) return
        contractId = extras.getString("id")
        contractLob = extras.getString("lob", "self")
        contractType = extras.getString("type", "outdoor")
        contractSubType = extras.getString("subType", "running")
        contractDate = extras.getString("date", "")
        isLive = extras.getBoolean("isLive", false)
        currentlyGoingOn = extras.getBoolean("currentlyGoingOn", false)

        val details = extras.getBundle("activityDetails")
        if (details != null) {
            contractStartTime = details.getString("startTime")
            contractEndTime = details.getString("endTime")
            contractDuration = details.getString("duration")
            contractLength = details.getString("length")
            contractAvgSpeed = details.getString("averageSpeed")
            val coords = details.getSerializable("coordinates") as? ArrayList<*>
            coords?.forEach { item ->
                val coord = item as? Bundle
                val lat = coord?.getDouble("lat")
                val longVal = coord?.getDouble("long")
                if (lat != null && longVal != null) {
                    contractCoordinates.add(LatLng(lat, longVal))
                }
            }
        }
    }

    private fun buildDetailsPanel(root: LinearLayout) {
        detailsContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
            setBackgroundColor(Color.BLACK)
            visibility = View.GONE
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        timeLabel = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 18f
            text = "Time: 00:00"
        }
        distanceLabel = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 18f
            text = "Total Run: 0.00 km"
        }
        speedLabel = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 18f
            text = "Avg. Speed: 0.00 m/s"
        }

        detailsContainer?.addView(timeLabel)
        detailsContainer?.addView(distanceLabel)
        detailsContainer?.addView(speedLabel)
        root.addView(detailsContainer)
    }

    private fun buildButtons(root: LinearLayout) {
        startButton = Button(this).apply {
            text = "Start Workout"
            setBackgroundColor(Color.BLACK)
            setTextColor(Color.WHITE)
            setOnClickListener { startWorkout() }
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        stopButton = Button(this).apply {
            text = "Stop Workout"
            setBackgroundColor(Color.BLACK)
            setTextColor(Color.WHITE)
            visibility = View.GONE
            setOnClickListener { stopWorkout() }
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        root.addView(startButton)
        root.addView(stopButton)
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        polylineOptions = PolylineOptions().color(Color.BLUE).width(12f)

        if (contractCoordinates.isNotEmpty()) {
            // Viewing a past activity - draw the route
            polylineOptions?.addAll(contractCoordinates)
            polyline = googleMap?.addPolyline(polylineOptions!!)
            val first = contractCoordinates.first()
            moveCamera(first, 16f)
            marker = googleMap?.addMarker(MarkerOptions().position(first))
            fillActivityDetails()
            startButton?.visibility = View.GONE
            detailsContainer?.visibility = View.VISIBLE

            if (currentlyGoingOn) {
                lastLatLng = contractCoordinates.last()
                stopButton?.visibility = View.VISIBLE
                startLocationUpdates()
                tryResumeTimer()
            }
        } else if (isLive) {
            // Live new workout - wait for GPS, then start
            startLocationUpdates()
        } else {
            // No data - just show current location
            startLocationUpdates()
        }
    }

    private fun fillActivityDetails() {
        timeLabel?.text = "Time: ${contractDuration ?: "00:00"}"
        distanceLabel?.text = contractLength ?: "Total Run: 0.00 km"
        speedLabel?.text = contractAvgSpeed ?: "Avg. Speed: 0.00 m/s"
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        if (!hasLocationPermission()) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                1001
            )
            return
        }

        googleMap?.isMyLocationEnabled = true

        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
            .setMinUpdateIntervalMillis(2000L)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location -> handleNewLocation(location) }
            }
        }

        fusedLocationClient?.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper())
    }

    private fun handleNewLocation(location: Location) {
        val latLng = LatLng(location.latitude, location.longitude)

        if (lastLatLng == null && contractCoordinates.isEmpty()) {
            // First fix for a new live workout - set up the map
            lastLatLng = latLng
            moveCamera(latLng, 16f)
            marker = googleMap?.addMarker(MarkerOptions().position(latLng))
            return
        }

        val prev = lastLatLng ?: contractCoordinates.lastOrNull() ?: latLng
        val results = FloatArray(1)
        Location.distanceBetween(prev.latitude, prev.longitude, latLng.latitude, latLng.longitude, results)
        val distance = results[0]

        // Only count meaningful movement (>20m) to match iOS behavior
        if (distance < 20 && !currentlyGoingOn) {
            return
        }

        if (distance > 0) {
            totalDistance += distance
            lastLatLng = latLng
            polylineOptions?.add(latLng)
            polyline?.remove()
            polyline = googleMap?.addPolyline(polylineOptions!!)
            marker?.position = latLng
            updateDistanceAndSpeed()
        }
    }

    private fun moveCamera(latLng: LatLng, zoom: Float) {
        val position = CameraPosition.builder()
            .target(latLng)
            .zoom(zoom)
            .bearing(90f)
            .tilt(45f)
            .build()
        googleMap?.animateCamera(CameraUpdateFactory.newCameraPosition(position))
    }

    private fun startWorkout() {
        startButton?.visibility = View.GONE
        detailsContainer?.visibility = View.VISIBLE
        stopButton?.visibility = View.VISIBLE
        startLocationUpdates()
        startTimer()
        contractStartTime = currentIsoDate()
        sendStartEvent()
    }

    private fun stopWorkout() {
        stopButton?.visibility = View.GONE
        startButton?.visibility = View.VISIBLE
        stopTimer()
        fusedLocationClient?.removeLocationUpdates(locationCallback)
        contractEndTime = currentIsoDate()
        sendEndEvent()
    }

    private fun startTimer() {
        startTime = System.currentTimeMillis()
        timerRunnable = object : Runnable {
            override fun run() {
                val elapsed = (System.currentTimeMillis() - startTime) / 1000.0
                contractDuration = formatTime(elapsed)
                timeLabel?.text = "Time: ${contractDuration}"
                updateDistanceAndSpeed()
                handler.postDelayed(this, 1000L)
            }
        }
        handler.post(timerRunnable!!)
    }

    private fun tryResumeTimer() {
        if (contractStartTime != null) {
            try {
                val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ", Locale.US)
                sdf.timeZone = TimeZone.getDefault()
                val start = sdf.parse(contractStartTime!!)
                startTime = start?.time ?: System.currentTimeMillis()
                startTimer()
            } catch (e: Exception) {
                startTime = System.currentTimeMillis()
                startTimer()
            }
        }
    }

    private fun stopTimer() {
        timerRunnable?.let { handler.removeCallbacks(it) }
        timerRunnable = null
    }

    private fun updateDistanceAndSpeed() {
        val elapsed = (System.currentTimeMillis() - startTime) / 1000.0
        val km = totalDistance / 1000.0
        contractLength = "Total Run: %.2f km".format(km)
        distanceLabel?.text = contractLength

        if (elapsed > 0) {
            val speed = totalDistance / elapsed
            contractAvgSpeed = "Avg. Speed: %.2f m/s".format(speed)
            speedLabel?.text = contractAvgSpeed
        }
    }

    private fun formatTime(seconds: Double): String {
        val total = seconds.toInt()
        val hours = total / 3600
        val minutes = (total % 3600) / 60
        val secs = total % 60
        return if (hours > 0) {
            String.format(Locale.US, "%02d:%02d:%02d", hours, minutes, secs)
        } else {
            String.format(Locale.US, "%02d:%02d", minutes, secs)
        }
    }

    private fun currentIsoDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ", Locale.US)
        sdf.timeZone = TimeZone.getDefault()
        return sdf.format(Date())
    }

    private fun sendStartEvent() {
        val params = buildContractMap()
        RNEventEmitterModule.emit(reactApplicationContext, RNEventEmitterModule.EVENT_START, params)
    }

    private fun sendEndEvent() {
        val params = buildContractMap()
        params.putBoolean("isLive", false)
        RNEventEmitterModule.emit(reactApplicationContext, RNEventEmitterModule.EVENT_END, params)
    }

    private fun buildContractMap(): WritableMap {
        val map = WritableNativeMap()
        map.putString("id", contractId ?: "")
        map.putString("lob", contractLob ?: "self")
        map.putString("type", contractType ?: "outdoor")
        map.putString("subType", contractSubType ?: "running")
        map.putString("date", contractDate ?: "")
        map.putBoolean("isLive", isLive)
        map.putBoolean("currentlyGoingOn", currentlyGoingOn)

        val details = WritableNativeMap()
        details.putString("startTime", contractStartTime ?: "")
        details.putString("endTime", contractEndTime ?: "")
        details.putString("duration", contractDuration ?: "")
        details.putString("length", contractLength ?: "")
        details.putString("averageSpeed", contractAvgSpeed ?: "")

        val coords = Arguments.createArray()
        polylineOptions?.points?.forEach { latLng ->
            val coord = WritableNativeMap()
            coord.putDouble("lat", latLng.latitude)
            coord.putDouble("long", latLng.longitude)
            coords.pushMap(coord)
        }
        details.putArray("coordinates", coords)
        map.putMap("activityDetails", details)
        return map
    }

    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1001 && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startLocationUpdates()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopTimer()
        fusedLocationClient?.removeLocationUpdates(locationCallback)
    }
}
