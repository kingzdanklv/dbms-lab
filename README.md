# DBMS Lab

Practice SQL and DBMS theory in your browser. No install, no server, no API key.
SQL runs locally using [sql.js](https://github.com/sql-js/sql.js) (SQLite compiled to WebAssembly).

## Features
- **Practice**: 17 questions (SELECT, JOIN, GROUP BY, subqueries, INSERT/UPDATE/DELETE, CREATE TABLE) with hints, solutions and automatic answer checking
- **Playground**: run any SQL on the sample college database (students, departments, courses, enrollments)
- **Quiz**: 12 shuffled MCQs on keys, normalization, ACID, joins and SQL commands
- Progress saved in your browser

## Files
- `index.html` – page
- `style.css` – styles (light and dark mode follow your device)
- `data.js` – sample database, questions and quiz. **Add your own here**
- `app.js` – SQL engine, answer checking, quiz

## Add a question
Add an object to `QUESTIONS` in `data.js`:
```js
{ level:"Easy", topic:"SELECT", q:"Question text", hint:"Hint", answer:"SELECT ...;" }
```
For INSERT/UPDATE/DELETE/CREATE add `verify:"SELECT ..."` so the final table state is compared.

## Run locally
Open `index.html` (needs internet for the sql.js CDN) or run `npx serve .`

## Deploy
Repo → Settings → Pages → Deploy from branch → `main` / root.

Note: this uses SQLite syntax, which is close to standard SQL but differs from MySQL/Oracle in a few places.
