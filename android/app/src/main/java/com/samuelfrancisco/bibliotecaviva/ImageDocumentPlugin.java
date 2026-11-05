package com.samuelfrancisco.bibliotecaviva;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.OutputStream;

/** A PNG-only document picker. No broad storage permission or backup contract change. */
@CapacitorPlugin(name = "ImageDocument")
public class ImageDocumentPlugin extends Plugin {
    @PluginMethod
    public void savePng(PluginCall call) {
        String name = call.getString("suggestedName");
        String data = call.getString("dataBase64");
        if (name == null || !name.matches("biblioteca-viva-(leitura|citacao|cinema)\\.png") ||
            data == null || data.length() > 16000000 || !data.matches("iVBORw0KGgo[A-Za-z0-9+/=]+")) {
            call.reject("Imagem PNG inválida.", "INVALID_IMAGE");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/png");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        try {
            startActivityForResult(call, intent, "imageCreated");
        } catch (RuntimeException error) {
            call.reject("Não foi possível abrir o seletor de imagens.", "IMAGE_PICKER_FAILED");
        }
    }

    @ActivityCallback
    private void imageCreated(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK) {
            response.put("status", "cancelled");
            call.resolve(response);
            return;
        }
        Intent intent = result.getData();
        Uri destination = intent == null ? null : intent.getData();
        String data = call.getString("dataBase64");
        if (destination == null || data == null) {
            call.reject("Destino da imagem indisponível.", "IMAGE_WRITE_FAILED");
            return;
        }
        // File work stays off the UI thread, including decoding the binary payload.
        getBridge().execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(destination, "w")) {
                if (stream == null) throw new IOException("Unavailable destination");
                stream.write(Base64.decode(data, Base64.NO_WRAP));
                stream.flush();
            } catch (IOException | RuntimeException error) {
                call.reject("Não foi possível salvar a imagem.", "IMAGE_WRITE_FAILED");
                return;
            }
            response.put("status", "saved");
            call.resolve(response);
        });
    }
}
