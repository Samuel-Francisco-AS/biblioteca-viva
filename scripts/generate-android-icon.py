"""Original Biblioteca Viva artwork. Requires ImageMagick (magick), no app dependency.
Run from repository root: python scripts/generate-android-icon.py
SVG paths are also the source of Android VectorDrawables; no tracing step.
"""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / 'android/app/src/main/res'
ART = ROOT / 'assets/android-icon'
# All essential artwork fits the central circle of radius 33 in the 108dp layer.
paths = [
    ('#9e7751', 'M54 23 C70 23 83 36 83 52 C83 68 70 81 54 81 C38 81 25 68 25 52 C25 36 38 23 54 23 Z M54 25 C39 25 27 37 27 52 C27 67 39 79 54 79 C69 79 81 67 81 52 C81 37 69 25 54 25 Z'),
    ('#110e21', 'M29 49 Q42 44 54 52 Q66 44 79 49 L79 70 Q65 68 54 76 Q43 68 29 70 Z'),
    ('#c59a60', 'M29 47 Q42 43 54 51 Q66 43 79 47 L79 67 Q66 65 54 73 Q42 65 29 67 Z'),
    ('#f3dfb9', 'M31 45 Q43 43 53 51 L53 69 Q43 62 31 64 Z'),
    ('#d5b78c', 'M55 51 Q65 43 77 45 L77 64 Q65 62 55 69 Z'),
    ('#fff0d0', 'M55 51 Q63 43 74 43 L74 60 Q64 60 55 67 Z'),
    ('#9e7751', 'M34 51 Q42 50 49 55 L49 56 Q42 52 34 53 Z M34 56 Q42 55 49 60 L49 61 Q42 57 34 58 Z M59 55 Q65 51 71 51 L71 53 Q65 53 59 57 Z M59 60 Q65 56 71 56 L71 58 Q65 58 59 62 Z'),
    ('#40273e', 'M54 60 C37 54 42 42 49 36 Q54 31 54 27 Q68 40 64 49 Q62 56 54 60 Z'),
    ('#b89bcc', 'M54 56 C44 51 47 44 51 40 Q55 36 55 33 Q64 43 60 49 Z'),
    ('#f9d794', 'M54 55 C49 51 51 47 54 44 L56 40 Q61 49 54 55 Z'),
    ('#fff3d1', 'M54 52 Q51 49 55 46 Q57 50 54 52 Z'),
    ('#efd097', 'M36 33 L37 37 L41 38 L37 39 L36 43 L35 39 L31 38 L35 37 Z M73 33 L74 36 L77 37 L74 38 L73 41 L72 38 L69 37 L72 36 Z M54 76 L56 78 L54 80 L52 78 Z'),
]
# Monochrome cutouts use even-odd paths, not an opaque background color.
mono = [('#ffffff', paths[2][1] + ' M32 49 Q43 47 51 53 L51 65 Q42 61 32 62 Z M57 53 Q65 47 76 49 L76 62 Q65 61 57 65 Z'), ('#ffffff', paths[7][1]), ('#ffffff', paths[-1][1])]
def svg(items, background=False):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">' + ('<path fill="#201729" d="M0 0H108V108H0Z"/>' if background else '') + ''.join(f'<path fill="{c}" fill-rule="evenodd" d="{d}"/>' for c,d in items) + '</svg>\n'
def vector(items):
    return '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n' + ''.join(f'  <path android:fillColor="{c}" android:fillType="evenOdd" android:pathData="{d}"/>\n' for c,d in items) + '</vector>\n'
ART.mkdir(exist_ok=True, parents=True)
for name,items,bg in [('foreground', paths, False), ('monochrome', mono, False), ('icon', paths, True)]:
    (ART/f'{name}.svg').write_text(svg(items,bg))
    if name != 'icon': (RES/f'drawable/ic_launcher_{name}.xml').write_text(vector(items))
(RES/'values/ic_launcher_background.xml').write_text('<resources><color name="ic_launcher_background">#201729</color></resources>\n')
(RES/'drawable/ic_launcher_background.xml').write_text(vector([('#201729','M0 0H108V108H0Z')]))
for api in [26,33]:
    folder=RES/f'mipmap-anydpi-v{api}'; folder.mkdir(exist_ok=True)
    xml='<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@color/ic_launcher_background"/>\n  <foreground android:drawable="@drawable/ic_launcher_foreground"/>\n' + ('  <monochrome android:drawable="@drawable/ic_launcher_monochrome"/>\n' if api==33 else '') + '</adaptive-icon>\n'
    for name in ['ic_launcher','ic_launcher_round']: (folder/f'{name}.xml').write_text(xml)
# Remove obsolete template resources, preventing density-specific shadowing.
(RES/'drawable-v24/ic_launcher_foreground.xml').unlink(missing_ok=True)
for density,size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    folder=RES/f'mipmap-{density}'
    (folder/'ic_launcher_foreground.png').unlink(missing_ok=True)
    for name,mask in [('ic_launcher','roundrectangle 0,0 431,431 82,82'),('ic_launcher_round','circle 216,216 216,0')]:
        # Crop adaptive viewport to the launcher-visible 72dp, then antialias mask.
        subprocess.run(['magick','-background','none','-density','576',str(ART/'icon.svg'),'-resize','648x648','-gravity','center','-crop','432x432+0+0','+repage','(','-size','432x432','xc:none','-fill','white','-draw',mask,')','-alpha','off','-compose','CopyOpacity','-composite','-resize',f'{size}x{size}','-depth','8','-strip',str(folder/f'{name}.png')],check=True)
subprocess.run(['magick','-background','none','-density','576',str(ART/'icon.svg'),'-resize','648x648','-strip',str(ART/'preview-full.png')],check=True)
subprocess.run(['magick','-background','none','-density','576',str(ART/'monochrome.svg'),'-resize','648x648','-strip',str(ART/'preview-monochrome.png')],check=True)
