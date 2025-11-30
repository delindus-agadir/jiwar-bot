# Script de création du projet PointageApp dans c:\dev\cam
Write-Host 'Création de la structure du projet...'

# Créer la structure de dossiers
\ = @(
    'c:\dev\cam',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\data\entity',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\data\dao',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\data\database',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\recognition',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\telegram',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\ui\camera',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\ui\attendance',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\ui\registration',
    'c:\dev\cam\app\src\main\java\com\delindus\pointage\utils',
    'c:\dev\cam\app\src\main\res\layout',
    'c:\dev\cam\app\src\main\res\values',
    'c:\dev\cam\app\src\main\res\menu',
    'c:\dev\cam\app\src\main\res\navigation',
    'c:\dev\cam\app\src\main\res\xml'
)

foreach (\ in \) {
    New-Item -ItemType Directory -Path \ -Force | Out-Null
}

Write-Host 'Structure créée avec succès!'
Write-Host 'Dossiers créés:' \.Count
