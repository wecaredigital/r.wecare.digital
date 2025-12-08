# PowerShell script to update API Gateway mapping template
# This updates the GET /app endpoint response template to include the folder field

Write-Host "Updating API Gateway mapping template..." -ForegroundColor Green

# You need to replace these values with your actual API Gateway details
$API_ID = "xbj96ig388"  # Your API Gateway ID from the URL
$REGION = "ap-south-1"

# The updated mapping template
$MAPPING_TEMPLATE = @"
#set(`$inputRoot = `$input.path('`$'))
[
  #foreach(`$elem in `$inputRoot.Items) {
    "id":        "`$elem.id.S",
    "url":       "`$elem.url.S",
    "timestamp": "`$elem.timestamp.S",
    "owner":     "`$elem.owner.S",
    "folder":    "`$util.defaultIfNull(`$elem.folder.S, '')",
    "remark":    "`$util.defaultIfNull(`$elem.remark.S, '')"
  }#if(`$foreach.hasNext),#end
  #end
]
"@

Write-Host "Template to be applied:" -ForegroundColor Yellow
Write-Host $MAPPING_TEMPLATE

Write-Host "`nPlease update this manually in AWS Console:" -ForegroundColor Cyan
Write-Host "1. Go to: https://console.aws.amazon.com/apigateway" -ForegroundColor White
Write-Host "2. Select your API (ID: $API_ID)" -ForegroundColor White
Write-Host "3. Go to Resources -> GET /app -> Integration Response" -ForegroundColor White
Write-Host "4. Edit the 200 response mapping template" -ForegroundColor White
Write-Host "5. Replace with the template shown above" -ForegroundColor White
Write-Host "6. Save and Deploy to Prod stage" -ForegroundColor White
