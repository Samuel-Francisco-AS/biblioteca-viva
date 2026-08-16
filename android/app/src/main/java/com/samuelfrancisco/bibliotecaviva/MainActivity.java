package com.samuelfrancisco.bibliotecaviva;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(BackupDocumentPlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat systemBars =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        systemBars.setAppearanceLightStatusBars(false);
        systemBars.setAppearanceLightNavigationBars(false);
    }
}
