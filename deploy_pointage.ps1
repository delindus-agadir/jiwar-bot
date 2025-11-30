# Script PowerShell pour créer le projet PointageApp dans c:\dev\cam
# Exécutez ce script avec: powershell -ExecutionPolicy Bypass -File deploy_pointage.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Création du projet PointageApp" -ForegroundColor Cyan
Write-Host "Destination: c:\dev\cam" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour créer un fichier avec contenu
function Create-ProjectFile {
    param(
        [string]$Path,
        [string]$Content
    )
    
    $directory = Split-Path -Path $Path -Parent
    if (!(Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "✓ Créé: $Path" -ForegroundColor Green
}

Write-Host "Étape 1/5: Création de la structure de dossiers..." -ForegroundColor Yellow

# Créer tous les dossiers nécessaires
$folders = @(
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\data\entity",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\data\dao",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\data\database",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\recognition",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\telegram",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\ui\camera",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\ui\attendance",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\ui\registration",
    "c:\dev\cam\app\src\main\java\com\delindus\pointage\utils",
    "c:\dev\cam\app\src\main\res\layout",
    "c:\dev\cam\app\src\main\res\values",
    "c:\dev\cam\app\src\main\res\menu",
    "c:\dev\cam\app\src\main\res\navigation",
    "c:\dev\cam\app\src\main\res\xml"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}

Write-Host "✓ Structure de dossiers créée ($($folders.Count) dossiers)" -ForegroundColor Green
Write-Host ""

Write-Host "Étape 2/5: Création des fichiers de configuration Gradle..." -ForegroundColor Yellow

# settings.gradle.kts
$settingsGradle = @'
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "PointageApp"
include(":app")
'@

Create-ProjectFile -Path "c:\dev\cam\settings.gradle.kts" -Content $settingsGradle

# build.gradle.kts (root)
$buildGradleRoot = @'
// Top-level build file
plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.20" apply false
    id("com.google.devtools.ksp") version "1.9.20-1.0.14" apply false
}
'@

Create-ProjectFile -Path "c:\dev\cam\build.gradle.kts" -Content $buildGradleRoot

# gradle.properties
$gradleProperties = @'
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true

# Configuration Telegram - IMPORTANT: Remplacez par vos valeurs
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
'@

Create-ProjectFile -Path "c:\dev\cam\gradle.properties" -Content $gradleProperties

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROJET CRÉÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Ouvrez Android Studio" -ForegroundColor White
Write-Host "2. File > Open > Sélectionnez c:\dev\cam" -ForegroundColor White
Write-Host "3. Configurez Telegram dans gradle.properties" -ForegroundColor White
Write-Host "4. Sync Project with Gradle Files" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Les fichiers source Kotlin seront créés dans la partie 2 du script" -ForegroundColor Red
Write-Host "Appuyez sur une touche pour continuer vers la partie 2..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Étape 3/5: Création des fichiers source (partie 1)..." -ForegroundColor Yellow
Write-Host "Ce script est volumineux. Pour créer tous les fichiers," -ForegroundColor Yellow
Write-Host "veuillez consulter le fichier README.md dans c:\dev\cam" -ForegroundColor Yellow
Write-Host ""
Write-Host "Projet de base créé dans: c:\dev\cam" -ForegroundColor Green
'@

Create-ProjectFile -Path "c:\Antigravity\deploy_pointage.ps1" -Content $deployScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SCRIPT DE DÉPLOIEMENT CRÉÉ!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le script a été créé dans:" -ForegroundColor Yellow
Write-Host "c:\Antigravity\deploy_pointage.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Pour l'exécuter:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File c:\Antigravity\deploy_pointage.ps1" -ForegroundColor White
'@

Create-ProjectFile -Path "c:\Antigravity\deploy_pointage.ps1" -Content $deployScript
