package com.localsewaapp

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.Executors
import kotlin.math.max
import kotlin.math.roundToInt

class ProfilePhotoPickerModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val REQUEST_PICK_PROFILE_PHOTO = 8917
    private const val MAX_IMAGE_DIMENSION = 1600
    private const val MAX_OUTPUT_BYTES = 4_500_000L
  }

  private val executor = Executors.newSingleThreadExecutor()
  private var pendingPromise: Promise? = null

  private val activityListener: ActivityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
      ) {
        if (requestCode != REQUEST_PICK_PROFILE_PHOTO) {
          return
        }

        val promise = pendingPromise ?: return
        pendingPromise = null

        if (resultCode != Activity.RESULT_OK) {
          promise.resolve(null)
          return
        }

        val uri = data?.data
        if (uri == null) {
          promise.reject(
            "PHOTO_PICK_FAILED",
            "No photo was selected.",
          )
          return
        }

        executor.execute {
          processPhoto(uri, promise)
        }
      }
    }

  init {
    reactContext.addActivityEventListener(activityListener)
  }

  override fun getName(): String = "ProfilePhotoPicker"

  @ReactMethod
  fun pickProfilePhoto(promise: Promise) {
    if (pendingPromise != null) {
      promise.reject(
        "PHOTO_PICK_BUSY",
        "A photo picker is already open.",
      )
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject(
        "PHOTO_PICK_UNAVAILABLE",
        "Photo picker is temporarily unavailable.",
      )
      return
    }

    val intent = createPhotoPickerIntent(activity)
    pendingPromise = promise

    activity.runOnUiThread {
      try {
        activity.startActivityForResult(
          intent,
          REQUEST_PICK_PROFILE_PHOTO,
        )
      } catch (error: Exception) {
        pendingPromise = null
        promise.reject(
          "PHOTO_PICK_FAILED",
          "Unable to open the Android photo picker.",
          error,
        )
      }
    }
  }

  private fun createPhotoPickerIntent(activity: Activity): Intent {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      val picker = Intent(MediaStore.ACTION_PICK_IMAGES).apply {
        type = "image/*"
      }

      if (picker.resolveActivity(activity.packageManager) != null) {
        return picker
      }
    }

    return Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
      addCategory(Intent.CATEGORY_OPENABLE)
      type = "image/*"
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
  }

  private fun processPhoto(uri: Uri, promise: Promise) {
    try {
      val resolver = reactApplicationContext.contentResolver
      val bounds = BitmapFactory.Options().apply {
        inJustDecodeBounds = true
      }

      resolver.openInputStream(uri).use { input ->
        if (input == null) {
          throw IllegalStateException("Selected photo could not be opened.")
        }
        BitmapFactory.decodeStream(input, null, bounds)
      }

      if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
        throw IllegalArgumentException("Please choose a valid image.")
      }

      var sampleSize = 1
      while (
        max(
          bounds.outWidth / sampleSize,
          bounds.outHeight / sampleSize,
        ) > MAX_IMAGE_DIMENSION * 2
      ) {
        sampleSize *= 2
      }

      val decodeOptions = BitmapFactory.Options().apply {
        inSampleSize = sampleSize
      }

      val decoded = resolver.openInputStream(uri).use { input ->
        if (input == null) {
          throw IllegalStateException("Selected photo could not be opened.")
        }
        BitmapFactory.decodeStream(input, null, decodeOptions)
      } ?: throw IllegalArgumentException(
        "This image format is not supported on this Android version.",
      )

      val oriented = applyOrientation(
        decoded,
        readOrientation(uri),
      )

      if (oriented !== decoded) {
        decoded.recycle()
      }

      val scaled = scaleDown(oriented)
      if (scaled !== oriented) {
        oriented.recycle()
      }

      val outputDir = File(
        reactApplicationContext.cacheDir,
        "profile-photo-upload",
      )
      if (!outputDir.exists() && !outputDir.mkdirs()) {
        scaled.recycle()
        throw IllegalStateException("Unable to prepare photo upload.")
      }

      outputDir.listFiles()?.forEach { file ->
        if (file.isFile) {
          file.delete()
        }
      }

      val outputFile = File(
        outputDir,
        "profile_${System.currentTimeMillis()}.jpg",
      )

      var quality = 90
      do {
        FileOutputStream(outputFile, false).use { output ->
          if (!scaled.compress(Bitmap.CompressFormat.JPEG, quality, output)) {
            throw IllegalStateException("Unable to prepare selected photo.")
          }
        }
        quality -= 8
      } while (
        outputFile.length() > MAX_OUTPUT_BYTES &&
        quality >= 66
      )

      val width = scaled.width
      val height = scaled.height
      scaled.recycle()

      if (outputFile.length() <= 0L) {
        throw IllegalStateException("Prepared photo is empty.")
      }

      if (outputFile.length() > 5L * 1024L * 1024L) {
        outputFile.delete()
        throw IllegalArgumentException(
          "The selected photo is too large after processing.",
        )
      }

      val result = Arguments.createMap().apply {
        putString("uri", Uri.fromFile(outputFile).toString())
        putString("name", outputFile.name)
        putString("type", "image/jpeg")
        putDouble("size", outputFile.length().toDouble())
        putInt("width", width)
        putInt("height", height)
      }

      reactApplicationContext.runOnUiQueueThread {
        promise.resolve(result)
      }
    } catch (error: Exception) {
      reactApplicationContext.runOnUiQueueThread {
        promise.reject(
          "PHOTO_PROCESS_FAILED",
          error.message ?: "Unable to prepare selected photo.",
          error,
        )
      }
    }
  }

  @Suppress("DEPRECATION")
  private fun readOrientation(uri: Uri): Int {
    return try {
      reactApplicationContext.contentResolver.openInputStream(uri).use { input ->
        if (input == null) {
          ExifInterface.ORIENTATION_NORMAL
        } else {
          ExifInterface(input).getAttributeInt(
            ExifInterface.TAG_ORIENTATION,
            ExifInterface.ORIENTATION_NORMAL,
          )
        }
      }
    } catch (_: Exception) {
      ExifInterface.ORIENTATION_NORMAL
    }
  }

  @Suppress("DEPRECATION")
  private fun applyOrientation(bitmap: Bitmap, orientation: Int): Bitmap {
    val matrix = Matrix()

    when (orientation) {
      ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
      ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
      ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
      ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
      ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
      ExifInterface.ORIENTATION_TRANSPOSE -> {
        matrix.preScale(-1f, 1f)
        matrix.postRotate(90f)
      }
      ExifInterface.ORIENTATION_TRANSVERSE -> {
        matrix.preScale(-1f, 1f)
        matrix.postRotate(270f)
      }
      else -> return bitmap
    }

    return Bitmap.createBitmap(
      bitmap,
      0,
      0,
      bitmap.width,
      bitmap.height,
      matrix,
      true,
    )
  }

  private fun scaleDown(bitmap: Bitmap): Bitmap {
    val largest = max(bitmap.width, bitmap.height)
    if (largest <= MAX_IMAGE_DIMENSION) {
      return bitmap
    }

    val ratio = MAX_IMAGE_DIMENSION.toFloat() / largest.toFloat()
    val width = (bitmap.width * ratio).roundToInt().coerceAtLeast(1)
    val height = (bitmap.height * ratio).roundToInt().coerceAtLeast(1)

    return Bitmap.createScaledBitmap(
      bitmap,
      width,
      height,
      true,
    )
  }
}
