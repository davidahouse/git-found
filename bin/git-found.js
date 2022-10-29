#!/usr/bin/env node
import fs from 'fs'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import Queue from 'better-queue'
import EventEmitter from 'events'
import path from 'path'
import rc from 'rc-house'
import git from 'simple-git'
import version from 'project-version'

const conf = rc("git-found", {
  // defaults
  workingFolder: ".",
  defaultBranches: "development,master,release,main",
  ignoreFolders: ".git,DerivedData,build,node_modules"
});

const eventEmitter = new EventEmitter();
const defaultBranches = conf.defaultBranches.split(",");
const ignoreFolders = conf.ignoreFolders.split(",");

clear();
console.log(
  chalk.green(figlet.textSync("git-found", { horizontalLayout: "full" }))
);
console.log(chalk.green(version));
console.log(chalk.green("searching for repositories in " + conf.workingFolder));

const q = new Queue(
  function (iteration, cb) {
    getStatus(iteration.folder, cb);
  },
  { concurrent: 3 }
);

q.on("drain", function () {
  eventEmitter.emit("finished");
});

eventEmitter.on("finished", function (result) {
  var stats = q.getStats();
  console.log(
    chalk.green("Finished checking " + stats.total + " repositories...")
  );
});

findRepos(conf.workingFolder);

/**
 * getStatus
 * @param {*} folder
 * @param {*} cb
 */
async function getStatus(folder, cb) {
  try {
    await git(folder)
      .fetch();
  } catch (e) { }
  const result = await git(folder).status();
  const basename = folder.replace(conf.workingFolder, "");
  if (
    result.files.length == 0 &&
    result.ahead == 0 &&
    result.behind > 0 &&
    defaultBranches.includes(result.current)
  ) {
    try {
      await git(folder)
        .pull();
      console.log(chalk.yellow("↩️ " + basename + "(" + result.current + ")"));
    } catch (e) {
      console.log(chalk.yellow("❌ " + basename + "(" + result.current + ")"));
    }
  }
  cb();
}

/**
 * findRepos
 * @param {string} folder The folder to find repositories in
 */
function findRepos(folder) {
  if (ignoreFolders.includes(path.basename(folder))) {
    return;
  }
  if (fs.existsSync(folder + "/.git")) {
    q.push({ folder: folder });
  } else {
    fs.readdirSync(folder).filter(function (file) {
      if (fs.statSync(folder + "/" + file).isDirectory()) {
        findRepos(folder + "/" + file);
      }
    });
  }
}
