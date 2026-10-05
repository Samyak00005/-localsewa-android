package com.localsewaapp

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class ProfilePhotoPickerPackage : ReactPackage {
  override fun createNativeModules(
    reactContext: ReactApplicationContext,
  ): MutableList<NativeModule> = mutableListOf(
    ProfilePhotoPickerModule(reactContext),
  )

  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()
}
