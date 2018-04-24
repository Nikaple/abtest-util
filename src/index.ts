export type IGroupId = string;
export type IUser = string | number;
export type IClassify = (user: IUser) => IGroupId;
export type IHandler = (...param: any[]) => any;
export type IShouldRunTest = (user?: IUser) => boolean;

export interface IHandlerMap {
  [key: string]: IHandler;
}
export interface IHandlers {
  [key: string]: IHandler | IHandlerMap;
}
export interface IGroup {
  [key: string]: IGroupId;
}

const defaultKey = "__ABTEST__DEFAULT__";

export class ABTest {
  public groups: IGroup;
  private user: IUser;
  private shouldRunTest: IShouldRunTest;
  private groupId: IGroupId;
  private handlers: IHandlers;
  private classify: IClassify;

  /**
   * Creates an instance of ABTest.
   * @param {{
   *     user: IUser; // 当前用户
   *     classify: IClassify; // ABTest 分组方法
   *     handlers: IHandlers; // ABTest 处理函数
   *     shouldRunTest?: IShouldRunTest; // ABTest 执行前提
   *     groups?: IGroupId[]; // ABTest 分组信息
   *   }}
   * @memberof ABTest
   */
  constructor({
    user,
    classify,
    handlers,
    shouldRunTest = () => true,
    groups = ["A", "B"]
  }: {
    user: IUser;
    classify: IClassify;
    handlers: IHandlers;
    shouldRunTest?: IShouldRunTest;
    groups?: IGroupId[];
  }) {
    this.checkConfig({ user, classify, handlers });
    this.groups = this.setGroups(groups);
    this.handlers = handlers;
    this.classify = classify;
    this.shouldRunTest = shouldRunTest;
    this.setUser(user);
  }

  /**
   * 重新设置用户
   *
   * @param {IUser} user
   * @memberof ABTest
   */
  public setUser(user: IUser) {
    this.user = user;
    this.groupId = this.classify(user);
  }

  /**
   * 获取当前用户
   *
   * @returns {IUser}
   * @memberof ABTest
   */
  public getUser(): IUser {
    return this.user;
  }

  /**
   * 获取当前用户的组名
   *
   * @returns {IGroupId}
   * @memberof ABTest
   */
  public getGroupId(): IGroupId {
    return this.groupId;
  }

  /**
   * 增加 ABTest 处理函数
   *
   * @param {string} name 函数名
   * @param {IHandler} handler 函数体
   * @param {IGroupId} [groupId=this.groupId] 在哪一组增加，默认当前组
   * @memberof ABTest
   */
  public addHandler(name: string, handler: IHandler, groupId = this.groupId) {
    if (!(groupId in this.groups)) {
      throw new Error(
        `GroupId ${groupId} is not defined. Check your \`groups\` parameter in the constructor.`
      );
    }
    const handlers = this.handlers[groupId];
    if (typeof handlers !== "object") {
      const newHandlers: IHandlerMap = {};
      newHandlers[defaultKey] = handlers;
      newHandlers[name] = handler;
      this.handlers[groupId] = newHandlers;
      return;
    }
    handlers[name] = handler;
  }

  /**
   * 执行 ABTest
   *
   * @param {string} [name]
   * @param {...any[]} params
   * @returns
   * @memberof ABTest
   */
  public run(name?: string, ...params: any[]) {
    if (!this.shouldRunTest(this.user)) {
      return;
    }
    return this.getHandler(name).apply(this, params);
  }

  private checkConfig({
    user,
    classify,
    handlers
  }: {
    user: IUser;
    classify: IClassify;
    handlers: IHandlers;
  }) {
    if (typeof user === "undefined") {
      throw new Error("User should be defined.");
    }
    if (typeof classify === "undefined") {
      throw new Error(
        "Classify function should be provided to divide user into groups."
      );
    }
    if (typeof handlers !== "object") {
      throw new Error(
        `Handlers should be an object like {A: fn, B: fn}, see doc for more information.`
      );
    }
  }
  /**
   * 设置 ABTest 分组信息
   *
   * @param {string[]} group
   * @returns {IGroup}
   * @memberof ABTest
   */
  private setGroups(group: string[]): IGroup {
    this.groups = group.reduce<IGroup>((obj, groupId) => {
      obj[groupId] = groupId;
      return obj;
    }, {});
    return this.groups;
  }

  /**
   * 返回当前分组中，名称`name`对应的方法
   *
   * @private
   * @param {string} name
   * @returns
   * @memberof ABTest
   */
  private getHandler(name?: string) {
    const handler =
      typeof name === "undefined"
        ? this.getDefaultHandler()
        : this.getNamedHandler(name);
    if (typeof handler !== "function") {
      console.warn(
        `Handler ${name} of group ${
          this.groupId
        } is not a function. If nothing should happen for this handler, explicitly use \`ABTest.noop\` instead.`
      );
      return ABTest.noop;
    }
    return handler;
  }

  private getDefaultHandler() {
    const handlers = this.handlers[this.groupId];
    if (typeof handlers === "object") {
      if (defaultKey in handlers) {
        return handlers[defaultKey];
      }
      throw new Error(`Default handler is not found in group ${this.groupId}.`);
    }
    return handlers;
  }

  private getNamedHandler(name: string) {
    const handlers = this.handlers[this.groupId];
    if (typeof handlers === "function") {
      throw new Error(
        `Handlers of groupId ${
          this.groupId
        } is function type. Try change it to object type.`
      );
    }
    return handlers[name];
  }

  static noop = () => {};
}
