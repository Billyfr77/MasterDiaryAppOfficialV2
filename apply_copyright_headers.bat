@echo off
REM Apply copyright headers to all JavaScript/TypeScript files
REM Run this script from the project root directory

echo Applying copyright headers...

REM Backend files
for /r "backend\src" %%f in (*.js) do (
    echo Processing %%f
    type "COPYRIGHT_HEADER.txt" > temp_header.txt
    type "%%f" >> temp_header.txt
    move /y temp_header.txt "%%f"
)

REM Frontend files (if applicable)
if exist "frontend\src" (
    for /r "frontend\src" %%f in (*.js *.jsx *.ts *.tsx) do (
        echo Processing %%f
        type "COPYRIGHT_HEADER.txt" > temp_header.txt
        type "%%f" >> temp_header.txt
        move /y temp_header.txt "%%f"
    )
)

echo Copyright headers applied successfully!
echo.
echo Next steps:
echo 1. Review modified files for any issues
echo 2. Test that the application still runs
echo 3. Commit changes to version control
echo.
pause