cd master
npm ci
npm run build
cd ..
rm -rf gh-pages/*
cp master/dist/* gh-pages/.
cp master/CNAME gh-pages/.
cd gh-pages

git config --global user.name "sabiz"
git config --global user.email "sabiz@users.noreply.github.com"

git remote set-url origin https://sabiz:${GITHUB_TOKEN}@github.com/sabiz/sabiz.jp.git

git add .
git commit -m"update."
git push origin HEAD
