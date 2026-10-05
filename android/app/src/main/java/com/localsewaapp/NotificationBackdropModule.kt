package com.localsewaapp

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NotificationBackdropModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "NotificationBackdrop"

  @ReactMethod
  fun setBlurred(enabled: Boolean) {
    val activity = reactApplicationContext.currentActivity ?: return

    activity.runOnUiThread {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val effect =
          if (enabled) {
            RenderEffect.createBlurEffect(
              18f,
              18f,
              Shader.TileMode.CLAMP,
            )
          } else {
            null
          }

        activity.window.decorView.setRenderEffect(effect)
      }
    }
  }
}
