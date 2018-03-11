$ErrorActionPreference = 'STOP' 
$credFile = gci (join-path $PSScriptRoot credentials) *.json | select -first 1 -ExpandProperty FullName
if(-not (test-path $credFile)) {
    write-error "you need to download credentials file from google API dev console first"
}
gapps auth "$credFile"