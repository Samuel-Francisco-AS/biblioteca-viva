package com.samuelfrancisco.bibliotecaviva;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.view.HapticFeedbackConstants;
import android.webkit.WebView;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * A tiny native bridge: Android WebView's navigator.vibrate is inconsistent
 * between devices. Honour the system haptic setting and never vibrate on
 * gestures, only explicit command activation.
 */
@CapacitorPlugin(name = "TactileFeedback")
public class TactileFeedbackPlugin extends Plugin {
    @PluginMethod
    public void pulse(PluginCall call) {
        final String kind = call.getString("kind", "selection");
        if (!"selection".equals(kind) && !"confirm".equals(kind)) {
            call.reject("Invalid tactile feedback request.", "INVALID_TACTILE_KIND");
            return;
        }
        final boolean confirm = "confirm".equals(kind);
        getActivity().runOnUiThread(() -> {
            try {
                if (Settings.System.getInt(
                    getContext().getContentResolver(),
                    Settings.System.HAPTIC_FEEDBACK_ENABLED,
                    1
                ) == 0) {
                    call.resolve();
                    return;
                }

                WebView view = getBridge().getWebView();
                view.setHapticFeedbackEnabled(true);
                boolean performed = view.performHapticFeedback(
                    confirm
                        ? HapticFeedbackConstants.VIRTUAL_KEY
                        : HapticFeedbackConstants.KEYBOARD_TAP
                );

                if (!performed) {
                    Vibrator vibrator = (Vibrator) getContext().getSystemService(
                        Context.VIBRATOR_SERVICE
                    );
                    if (vibrator != null && vibrator.hasVibrator()) {
                        final long milliseconds = confirm ? 15L : 9L;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            vibrator.vibrate(VibrationEffect.createOneShot(
                                milliseconds,
                                VibrationEffect.DEFAULT_AMPLITUDE
                            ));
                        } else {
                            vibrator.vibrate(milliseconds);
                        }
                    }
                }
                call.resolve();
            } catch (RuntimeException error) {
                // Optional feedback must never block a click/navigation.
                call.resolve();
            }
        });
    }
}
