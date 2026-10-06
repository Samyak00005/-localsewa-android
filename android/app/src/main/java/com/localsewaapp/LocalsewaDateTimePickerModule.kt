package com.localsewaapp

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Calendar

class LocalsewaDateTimePickerModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String =
    "LocalsewaDateTimePicker"

  @ReactMethod
  fun pickDate(
    year: Int,
    month: Int,
    day: Int,
    promise: Promise,
  ) {
    val activity =
      reactApplicationContext.currentActivity

    if (activity == null) {
      promise.reject(
        "E_NO_ACTIVITY",
        "The Android date picker could not be opened.",
      )
      return
    }

    activity.runOnUiThread {
      try {
        val now =
          Calendar.getInstance()

        val initialYear =
          if (year > 0) {
            year
          } else {
            now.get(
              Calendar.YEAR,
            )
          }

        val initialMonth =
          (month - 1).coerceIn(
            0,
            11,
          )

        val initialDay =
          day.coerceAtLeast(
            1,
          )

        val dialog =
          DatePickerDialog(
            activity,
            {
              _,
              selectedYear,
              selectedMonth,
              selectedDay,
              ->
              val result =
                Arguments.createMap()

              result.putInt(
                "year",
                selectedYear,
              )
              result.putInt(
                "month",
                selectedMonth + 1,
              )
              result.putInt(
                "day",
                selectedDay,
              )

              promise.resolve(
                result,
              )
            },
            initialYear,
            initialMonth,
            initialDay,
          )

        val minimumDate =
          Calendar.getInstance().apply {
            set(
              Calendar.HOUR_OF_DAY,
              0,
            )
            set(
              Calendar.MINUTE,
              0,
            )
            set(
              Calendar.SECOND,
              0,
            )
            set(
              Calendar.MILLISECOND,
              0,
            )
          }

        dialog.datePicker.minDate =
          minimumDate.timeInMillis

        dialog.setOnCancelListener {
          promise.resolve(
            null,
          )
        }

        dialog.show()
      } catch (
        error: Exception,
      ) {
        promise.reject(
          "E_DATE_PICKER",
          error.message
            ?: "The Android date picker could not be opened.",
          error,
        )
      }
    }
  }

  @ReactMethod
  fun pickTime(
    hour: Int,
    minute: Int,
    promise: Promise,
  ) {
    val activity =
      reactApplicationContext.currentActivity

    if (activity == null) {
      promise.reject(
        "E_NO_ACTIVITY",
        "The Android time picker could not be opened.",
      )
      return
    }

    activity.runOnUiThread {
      try {
        val dialog =
          TimePickerDialog(
            activity,
            {
              _,
              selectedHour,
              selectedMinute,
              ->
              val result =
                Arguments.createMap()

              result.putInt(
                "hour",
                selectedHour,
              )
              result.putInt(
                "minute",
                selectedMinute,
              )

              promise.resolve(
                result,
              )
            },
            hour.coerceIn(
              0,
              23,
            ),
            minute.coerceIn(
              0,
              59,
            ),
            false,
          )

        dialog.setOnCancelListener {
          promise.resolve(
            null,
          )
        }

        dialog.show()
      } catch (
        error: Exception,
      ) {
        promise.reject(
          "E_TIME_PICKER",
          error.message
            ?: "The Android time picker could not be opened.",
          error,
        )
      }
    }
  }
}
