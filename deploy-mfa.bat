@echo off
REM MFA Deployment Script for URL Shortener (Windows)
REM This script helps deploy the MFA/TOTP feature

echo ==========================================
echo MFA/TOTP Deployment Script
echo ==========================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if SAM CLI is installed
where sam >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ! SAM CLI is not installed. You'll need to deploy manually.
    echo   Install SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
)

echo Step 1: Installing frontend dependencies...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install frontend dependencies
    exit /b 1
)
echo + Frontend dependencies installed
echo.

echo Step 2: Installing Lambda dependencies...
cd ..\lambda
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install Lambda dependencies
    exit /b 1
)
echo + Lambda dependencies installed
echo.

cd ..

echo Step 3: Creating Lambda deployment package...
echo Note: You may need to install 7-Zip or use PowerShell for zipping
echo.
powershell -Command "Compress-Archive -Path lambda\*.js, lambda\node_modules -DestinationPath mfa-functions.zip -Force"
if %ERRORLEVEL% EQU 0 (
    echo + Lambda package created: mfa-functions.zip
) else (
    echo ! Could not create zip file automatically
    echo   Please manually zip the lambda folder contents
)
echo.

echo ==========================================
echo Next Steps:
echo ==========================================
echo.
echo 1. Deploy Lambda functions:
echo    - Upload mfa-functions.zip to AWS Lambda
echo    - Create 5 Lambda functions (see MFA_IMPLEMENTATION.md^)
echo    - Set TABLE_NAME environment variable
echo.
echo 2. Update API Gateway:
echo    - Import updated api.yaml
echo    - Deploy API to stage
echo.
echo 3. Enable DynamoDB TTL:
echo    aws dynamodb update-time-to-live ^
echo      --table-name LinkTable ^
echo      --time-to-live-specification "Enabled=true, AttributeName=ttl"
echo.
echo 4. Deploy frontend:
echo    cd client
echo    npm run build
echo    # Deploy to Amplify or S3
echo.
echo For detailed instructions, see MFA_IMPLEMENTATION.md
echo.

pause
