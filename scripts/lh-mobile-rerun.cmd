@echo off
setlocal
cd /d "C:\Users\USER\Documents\FINAL DOC ADI PAGE"
set "PATH=C:\Users\USER\Documents\FINAL DOC ADI PAGE\node\node-v20.20.2-win-x64;%PATH%"
"C:\Users\USER\Documents\FINAL DOC ADI PAGE\node\node-v20.20.2-win-x64\npx.cmd" --yes lighthouse http://127.0.0.1:4174 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path="C:\Users\USER\Documents\FINAL DOC ADI PAGE\lighthouse-mobile-rerun-2.json" --chrome-flags="--headless=new --disable-gpu --no-sandbox" --no-enable-error-reporting --quiet
endlocal
