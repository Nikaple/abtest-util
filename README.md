# abtest-util

[![CircleCI](https://circleci.com/gh/Nikaple/abtest-util.svg?style=shield)](https://circleci.com/gh/Nikaple/abtest-util)
[![Codecov](https://img.shields.io/codecov/c/github/nikaple/abtest-util.svg)](https://codecov.io/gh/Nikaple/abtest-util)
[![version](https://img.shields.io/npm/v/abtest-util.svg)](https://www.npmjs.com/package/abtest-util)
[![license](https://img.shields.io/npm/l/abtest-util.svg)](https://www.npmjs.com/package/abtest-util)
A simple and extensible utility library for abtest

## Usage

First, create your test with `new ABTest(config)`:

```javascript
const appId = require('./some.state')
const appIdToRunABTest = '1731035743'
const test = new ABTest({
    // current user
    user: "7ae4d9c516",
    // method to classify user into groups
    classify(user) {
      	return parseInt(user, 16) % 2 === 0
        	? this.groups.A
        	: this.groups.B
    },
    // assign handler(s) to each group
    handlers: {
        A: () => 'Running default function of group A',
        B: {
            foo: () => 'Running foo of group B',
            bar: ABTest.noop, // do nothing
        },
    }
    // optional: if you need 3 or more groups, assign them to
    // `groups`, and they can be accessed as this.groups.C
    groups: ['A', 'B', 'C'],
    // optional: conditionally run the test
    shouldRunTest(user) {
    	return appId === appIdToRunABTest
	}
})

module.exports = test
```

When you want to run the test:

```javascript
const test = require("./abtest");
// if user is in group A:
const resultA = test.run();
// if user is in group B:
const resultB = test.run("foo");
// NOTE: user can't be group A and group B!
// so one of (resultA, resultB) will throw an Error!
```

## API

**new ABTest(config)**

| config               | description                                    | type                                              |
| -------------------- | ---------------------------------------------- | ------------------------------------------------- |
| config.user          | required. Current user                         | string\|number                                    |
| config.classify      | required. Method to divide user into groups    | (string\|number) => string                        |
| config.handlers      | required. Individual handlers for groups       | see example                                       |
| config.shouldRunTest | optional. Method to decide whether test or not | (...param: any[]) => boolean. default: () => true |
| config.groups        | optional. All groups of current test           | string[]. default: ['A', 'B']                     |

```javascript
const test = new ABTest({
  user: "7ae4d9c516",
  classify(user) {
    return parseInt(user, 16) % 2 === 0 ? this.groups.A : this.groups.B;
  },
  handlers: {
    A: () => "Running default function of group A",
    B: {
      foo: () => "Running foo of group B",
      bar: () => "Running bar of group B"
    }
  }
});
```

**ABTest.prototype.setUser(user)**

Set current user.

**ABTest.prototype.getUser()**

Get current user.

```javascript
test.setUser("7ae4d9c517");
test.getUser(); // 7ae4d9c517
```

**ABTest.prototype.getGroupId()**

Get current group id.

```javascript
test.getGroupId(); // B
test.setUser("7ae4d9c517");
test.getGroupId(); // A
```

**ABTest.prototype.addHandler(name, handler[, groupId])**

Adds the `handler` of `name` on group `groupId`(default: current groupId).

```javascript
test.getGroupId() // B
test.addHandler('baz', () => 'Running baz of group B')
test.run('baz') // Running foo of group B
test.setUser('7ae4d9c517')
test.getGroupId() // A
test.addHandler('foo', () => )
```

**ABTest.prototype.run**

```javascript
test.run(); // Error: Name is required for object type handlers.
test.run(); // 'Running default function of group A'
test.run("foo"); // 'Running foo of group B'
test.run("bar"); // 'Running bar of group B'
```
