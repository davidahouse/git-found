## git-found

[![npm (scoped)](https://img.shields.io/npm/v/@davidahouse/git-found.svg)](https://www.npmjs.com/package/@davidahouse/git-found)

A command line tool for finding & updating local branches from the git origin

Installation:

```
npm install -g git-found
```

Usage:

```
git-found --workingFolder /someFolder
```

You can also create a ~/.git-foundrc file and set a global working folder so you don't have to specify it on the command line. Format is:

```
workingFolder=/someFolder
```

`git-found` will execute a `git pull` in any repository that is currently on the default branch and has no local changes. You can modify the list of default branches with the `defaultBranches` config option. By default the default branch can be `master`, `development`, or `release`.
