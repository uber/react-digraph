
# Contributing to react-digraph

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to react-digraph, which are hosted in the [Uber Organization](https://github.com/uber) on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

We ask that everyone participating in this project be respectful, non-discriminatory, and maintain decorum and diplomacy. We are here to code and contribute to the world at large, and that means we must respect all individuals. We also respect discussion and differing opinions, but please remember to keep those opinions civil and based on the technology and code, never personalized. We also ask everyone participating to learn and have fun!

## How Can I Contribute?

### Reporting Bugs

Bug reports are essential to keeping react-digraph stable.

First, [go to the issues tab](https://github.com/uber/react-digraph/issues) and make sure to search for your issue in case it has already been answered. Be sure to check [Closed issues](https://github.com/uber/react-digraph/issues?q=is%3Aissue+is%3Aclosed) as well.

If the issue is not already present, then click the [New Issue](https://github.com/uber/react-digraph/issues/new/choose) button. You will be presented with some options, either you can create a bug report or a feature request.

When creating [a new bug report](https://github.com/uber/react-digraph/issues/new?template=bug_report.md) you will notice some instructions, such as description, reproduction steps (aka repro steps), expected behavior, screenshots, OS type, browser, and version (which refers to your react-digraph version), and some additional context. Please fill in as much as possible, but not all of it is required. The more information we have the better we can help.

Sometimes it's necessary to create an example demo for the developers. We recommend [plnkr.co](https://plnkr.co/), [jsfiddle](http://jsfiddle.net/), or [codepen.io](https://codepen.io/). We ask that you limit your example to the bare minimum amount of code which reproduces your issue. You can also [create a Gist in Github](https://gist.github.com/), which will allow us to see the code but we won't be able to run it.

### Requesting Features

Feature requests help drive the development of our project. Since this project is also driven by Uber goals, as it's under the Uber umbrella, some features may be added by internal teams. Hopefully all developers create feature requests in Github in order to make the public aware of the design decisions, but unfortunately sometimes that is missed.

If you think react-digraph needs a new feature, please create a new Feature request by [going to the issues tab](https://github.com/uber/react-digraph/issues). Again, make sure to search for your issue in case it has already been answered. Be sure to check [Closed issues](https://github.com/uber/react-digraph/issues?q=is%3Aissue+is%3Aclosed) as well.

If the issue is not already present, then click the [New Issue](https://github.com/uber/react-digraph/issues/new/choose) button. You will be presented with some options, either you can create a bug report or a feature request.

When creating [a new feature request](https://github.com/uber/react-digraph/issues/new?template=feature_request.md) you will notice some instructions, such as relation to a problem, solution you'd like, alternatives, and some additional context. Please fill in as much as possible, but not all of it is required. The more information we have the better we can help.

### Your First Code Contribution

#### Setup

In order to work on react-digraph you will need to fork the project to your user account in Github. Navigate to [react-digraph's main page](https://github.com/uber/react-digraph), then press the **Fork** button in the upper right. If the fork is successful you should see the URL and project name switch from "**uber/react-digraph**" to "**yourusername/react-digraph**".


First you will need to download the project and install the project dependencies. These instructions are based on [using a remote upstream repository](https://medium.com/sweetmeat/how-to-keep-a-downstream-git-repository-current-with-upstream-repository-changes-10b76fad6d97).

```bash
git clone git@github.com:yourusername/react-digraph.git
cd react-digraph
git remote add upstream git@github.com:uber/react-digraph.git # adds the parent repository as 'upstream'
git fetch upstream
npm install
```

#### Creating a working branch

Ideally, all work should be done on a working branch. This branch is then referenced when creating a Pull Request (PR).

First, you must rebase your own master on upstream's master.

```bash
git fetch upstream
git checkout master
git rebase upstream/master
```

```bash
git checkout -b my_new_feature # use any naming convention you want
```

Some people like to reference the issue number if their pull request is related to a bug or feature request. When doing so you should make sure your commit tells Github that you've fixed the issue in reference.

```bash
git checkout -b 71-fix-click-issue # use any naming convention you want
# make changes
git add .
git commit -m "Resolved #71"
```

#### Using the example site

react-digraph includes a simple example site. Every time the webpage is refreshed the data will reset. We would love more examples, so feel free to add more pages or modifications to suit your use cases.

The site should automatically open in the browser, and upon making changes to the code it should automatically refresh the page.

```bash
npm run example
```

#### Linking to react-digraph

By using npm linking you can point your website or project to a local version of react-digraph. Then you can make changes within react-digraph and, after a restart of your app, you can see the changes in your website.

Clone the website using the instructions above. Then use the following commands.

```bash
cd react-digraph
npm link

cd /path/to/your/project
npm link react-digraph
```

**Note:** Once you've linked a package within your project, you cannot run `npm install react-digraph` without breaking the link. If you break the link you should run `npm link react-digraph` again within your project directory. Your project's `package.json` file may be modified by npm when linking packages, be careful when submitting your code to a repository.

Now that the project is linked to your local react-digraph you may modify react-digraph and see the changes in your project.

```bash
# make modifications to react-digraph then run
cd react-digraph # make sure you're in the react-digraph directory
npm run package # this runs the linter, tests, and builds a production distribution file
```

Now you may stop your project's server and restart it to see the changes in your project.

#### Creating tests

Please make sure to test all of your code. We would prefer 100% code coverage. All tests are located in the `__tests__` folder, and all mocks in the `__mocks__` folder.

Tests are created using [Jest](https://jestjs.io/) and [Enzyme](https://github.com/airbnb/enzyme). See the documentation on those projects for help. Use the existing examples in `__tests__` to see the structure and other examples.

Test file and folder structure is as follows:

```
__tests__
  - components
    my-component.test.js
  - utilities
    - layout-engine
      snap-to-grid.test.js
```

The components under the `__tests__` folder should match the folder structure in `src`.
If you are more comfortable creating E2E tests, please create a `__tests__/e2e` folder and place them there.


#### Committing code

We ask that you limit the number of commits to a reasonable amount. If you're comfortable with [squashing your commits](https://github.com/todotxt/todo.txt-android/wiki/Squash-All-Commits-Related-to-a-Single-Issue-into-a-Single-Commit), please do that, otherwise you should be careful with how many commits you are making.

```
git add . #add your changes
git commit -m "Resolved #71"
git push origin 71-fix-click-issue # use whatever branch name you're on
```

Navigate to Github and select your new branch.

Press the "New pull request" button.

You should see a comparison with base: `master` with `yourusername/react-digraph` compare: `71-fix-click-issue`.

**Note:** If you performed a `git checkout -b` based on the react-digraph `v4.x.x` branch, then change base: `master` to `v4.x.x` instead.

## Testing

As mentioned before, react-digraph uses Jest and Enzyme. Tests are located in the `__tests__` folder.

To run the tests run `npm run test`.

# NPM Package Maintainers Only!

## Creating a new version

**Checkout master and pull updates**

```
git checkout master
git pull
```

**Create a new version**

Create a new version using `npm version [major|minor|patch]` depending on the version type. `major` for major breaking changes, `minor` for non-breaking backwards-compatible changes that introduce new features or improvements, `patch` for bugfixes.

```
npm version minor
npm publish
```

**Push updates**

```
git push origin master
git push origin --tags
```