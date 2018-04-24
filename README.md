# abtest-util

A simple and extensible utility library for abtest

## Usage

## API

__new ABTest(config)__

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
      	return parseInt(user, 16) % 2 === 0
        	? this.groups.A
        	: this.groups.B
    },
    handlers: {
        A: () => 'Running default function of group A',
        B: {
            foo: () => 'Running foo of group B',
            bar: () => 'Running bar of group B'
        },
    }
})
```

__ABTest.prototype.setUser(user)__

Set current user.

__ABTest.prototype.getUser()__

Get current user.

```javascript
test.setUser('7ae4d9c517')
test.getUser() // 7ae4d9c517
```

__ABTest.prototype.getGroupId()__

Get current group id.

```javascript
test.getGroupId() // B
test.setUser('7ae4d9c517')
test.getGroupId() // A
```

__ABTest.prototype.addHandler(name, handler[, groupId])__

Adds the `handler` of `name` on group `groupId`(default: current groupId).

```javascript
test.getGroupId() // B
test.addHandler('baz', () => 'Running baz of group B')
test.run('baz') // Running foo of group B
test.setUser('7ae4d9c517')
test.getGroupId() // A
test.addHandler('foo', () => )
```

__ABTest.prototype.run__

```javascript
test.run() // Error: Name is required for object type handlers.
test.run() // 'Running default function of group A'
test.run('foo') // 'Running foo of group B'
test.run('bar') // 'Running bar of group B'
```