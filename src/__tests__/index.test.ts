import { ABTest } from "../index";

const classify = (user: string) => {
  const uid = parseInt(user, 10);
  return uid % 2 === 0 ? "A" : "B";
};
const handlers = {
  A: () => "A",
  B: () => "B"
};

let fixture: ABTest;
describe("ABTest", () => {
  beforeEach(() => {
    fixture = new ABTest({
      user: "1",
      classify(user: string) {
        const uid = parseInt(user, 10);
        return uid % 2 === 0 ? this.groups.A : this.groups.B;
      },
      handlers: {
        A: () => "A",
        B: {
          foo: () => "foo",
          bar: () => "bar"
        }
      }
    });
  });

  // constructor
  it("should be able to create ABTest", () => {
    expect(fixture.constructor).toBe(ABTest);
  });
  it("should throw when user is not provided", () => {
    const createABTest = () =>
      new ABTest({
        classify,
        handlers
      } as any);
    expect(createABTest).toThrow();
  });
  it("should throw when classify function is not provided", () => {
    const createABTest = () =>
      new ABTest({
        user: "1",
        handlers
      } as any);
    expect(createABTest).toThrow();
  });
  it("should throw when handler is not object", () => {
    const createABTest = () =>
      new ABTest({
        user: "1",
        classify,
        handlers: () => "foo"
      } as any);
    expect(createABTest).toThrow();
  });
  it("should be able to define custom groups", () => {
    fixture = new ABTest({
      user: "1",
      classify,
      handlers,
      groups: ["A", "B", "C", "D"]
    });
    expect(fixture.groups.D).toBe("D");
  });

  // getUser, setUser
  it("should be able to set and get user", () => {
    expect(fixture.getUser()).toBe("1");
    fixture.setUser("2");
    expect(fixture.getUser()).toBe("2");
  });

  // getGroupId
  it("should be able to get group id", () => {
    expect(fixture.getGroupId()).toBe("B");
  });
  it("should be able to update group id when setting user", () => {
    fixture.setUser("2");
    expect(fixture.getGroupId()).toBe("A");
  });

  // addHandler
  it("should throw when addHandler on group which does not exists", () => {
    const testFn = () => fixture.addHandler("baz", () => {}, "D");
    expect(testFn).toThrow();
  });
  it("should be able to addHandler on handler which is not defined", () => {
    fixture = new ABTest({
      user: "1",
      classify() {
        return this.groups.C;
      },
      handlers: {
        A: () => "A",
        B: () => "B"
      },
      groups: ["A", "B", "C"]
    });
    fixture.addHandler("foo", () => "foo");
    expect(fixture.run("foo")).toBe("foo");
  });
  it("should be able to addHandler on function type handler", () => {
    fixture.setUser("2");
    fixture.addHandler("baz", () => "baz");
    expect(fixture.run("baz")).toBe("baz");
    expect(fixture.run()).toBe("A");
  });
  it("should be able to addHandler on object type handler", () => {
    fixture.addHandler("baz", () => "baz");
    expect(fixture.run("foo")).toBe("foo");
    expect(fixture.run("baz")).toBe("baz");
  });

  // run
  it("should warn when handlers is not defined", () => {
    const spy = jest.spyOn(global.console, "warn");
    expect(fixture.run("qux")).toBeUndefined();
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("should be able to run function type handlers", () => {
    fixture.setUser("2");
    expect(fixture.run()).toBe("A");
  });
  it("should be able to run object type handlers", () => {
    expect(fixture.run("foo")).toBe("foo");
  });
  it("should throw when no name is provided for object type handlers", () => {
    const testFn = () => fixture.run();
    expect(testFn).toThrow();
  });
  it("should throw when a name is provided for function type handlers", () => {
    fixture.setUser("2");
    const testFn = () => fixture.run("foo");
    expect(testFn).toThrow();
  });
  it("should not run when shouldRunTest returns false", () => {
    fixture = new ABTest({
      user: "1",
      classify,
      handlers,
      shouldRunTest: () => false
    });
    expect(fixture.run("foo")).toBeUndefined();
  });
  it("should run with additional params", () => {
    fixture = new ABTest({
      user: "1",
      classify,
      handlers: {
        A: () => "A",
        B: {
          foo: bar => `foo: ${bar}`
        }
      }
    });
    expect(fixture.run("foo", "bar")).toBe("foo: bar");
  });
});
