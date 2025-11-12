@echo off
echo Updating copyright notices to William Freeman...
echo This may take a few minutes for large codebases...
echo.

REM Update all JS, JSX, JSON, and MD files recursively (excluding node_modules)
powershell -Command "& {Get-ChildItem -Path '.' -Recurse -Include *.js,*.jsx,*.json,*.md | Where-Object { $_.FullName -notlike '*node_modules*' -and $_.FullName -notlike '*\.git\*' } | ForEach-Object {(Get-Content $_.FullName -Raw) -replace 'Billy Fraser', 'William Freeman' -replace 'billyfr77@example.com', 'williamfreeman@example.com' | Set-Content $_.FullName}}"

REM Update GitHub username in README
powershell -Command "& {(Get-Content 'README.md' -Raw) -replace 'Billyfr77', 'WilliamFreeman' | Set-Content 'README.md'}"

echo.
echo Copyright updates completed successfully!
echo All your source files are now protected under William Freeman.
echo Note: node_modules and .git directories were excluded from updates.
pause