package com.samuelfrancisco.bibliotecaviva;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "BackupDocument")
public class BackupDocumentPlugin extends Plugin {

    private static final String JSON_MIME_TYPE = "application/json";

    @PluginMethod
    public void saveBackupFile(PluginCall call) {
        String suggestedName = call.getString("suggestedName");
        String mimeType = call.getString("mimeType");
        String contentUtf8 = call.getString("contentUtf8");

        if (
            suggestedName == null ||
            !suggestedName.matches("biblioteca-viva-backup-[A-Za-z0-9._-]+\\.json") ||
            !JSON_MIME_TYPE.equals(mimeType) ||
            contentUtf8 == null
        ) {
            call.reject("Não foi possível preparar o salvamento.", "INVALID_SAVE_REQUEST");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(JSON_MIME_TYPE);
        intent.putExtra(Intent.EXTRA_TITLE, suggestedName);

        try {
            startActivityForResult(call, intent, "documentCreated");
        } catch (RuntimeException error) {
            call.reject("Não foi possível abrir o seletor de arquivos.", "DOCUMENT_PICKER_FAILED");
        }
    }

    @ActivityCallback
    private void documentCreated(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK) {
            JSObject response = new JSObject();
            response.put("status", "cancelled");
            call.resolve(response);
            return;
        }

        Intent resultData = result.getData();
        Uri destination = resultData == null ? null : resultData.getData();
        String contentUtf8 = call.getString("contentUtf8");
        if (destination == null || contentUtf8 == null) {
            call.reject("Não foi possível acessar o arquivo escolhido.", "DOCUMENT_WRITE_FAILED");
            return;
        }

        try (
            OutputStream stream = getContext().getContentResolver().openOutputStream(destination, "w")
        ) {
            if (stream == null) {
                call.reject("Não foi possível acessar o arquivo escolhido.", "DOCUMENT_WRITE_FAILED");
                return;
            }
            OutputStreamWriter writer = new OutputStreamWriter(stream, StandardCharsets.UTF_8);
            writer.write(contentUtf8);
            writer.flush();
        } catch (IOException | RuntimeException error) {
            call.reject("Não foi possível concluir a escrita do backup.", "DOCUMENT_WRITE_FAILED");
            return;
        }

        JSObject response = new JSObject();
        response.put("status", "saved");
        call.resolve(response);
    }
}
