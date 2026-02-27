$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"
$files = @(
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1"
)

$targetDir = "public/models"
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir
}

foreach ($file in $files) {
    $url = $baseUrl + $file
    $dest = Join-Path $targetDir $file
    Write-Host "Downloading $file from $url ..."
    
    # Using curl for better reliability on large files if available, otherwise fallback
    if (Get-Command curl -ErrorAction SilentlyContinue) {
        curl.exe -L $url -o $dest
    } else {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    }
}

Write-Host "Verifying file sizes..."
Get-ChildItem $targetDir | Select-Object Name, Length
