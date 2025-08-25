//定义一个PubSub对象
const PubSub = {};

//分析数据结构  (用来保存所有待处理的回调函数的容器)
/*
  {
    '消息名1': {
      'token1': callback,
      'token2': callback
    },
    '消息名'2: {
      'token3': callback,
      'token4': callback
    },
    ......
  }
*/

//创建容器

// 实现功能
//1. token subscribe(msgName, callback): 订阅消息, 并返回一个标识token
//2. publish(msgName, data): 异步发布消息
//3. publishSync(msgName, data): 同步发布消息
/*
4. unsubscribe(flag): 根据flag取消订阅
  1. flag没有指定: 取消所有
  2. flag是一个token值: 取消对应的一个回调
  3. flag是msgName: 取消对应的所有
*/

export default new (class {
  id: number = 0;
  callbackContainer: { [key: string]: { [key: string]: (data: any) => void } } =
    {};

  subscribe(msgName: string, callback: (data: any) => void) {
    // 获取存放callback的小容器
    let callbacks = this.callbackContainer[msgName];

    // 如果小容器还没创建
    if (!callbacks) {
      // 创建一个小容器,并让callbackContainer[msgName]等于小容器
      callbacks = {};
      this.callbackContainer[msgName] = callbacks;
    }

    // 创建一个token
    const token = `event_${++this.id}`;

    // 将callback添加到小容器
    callbacks[token] = callback;

    // 把token返回
    return token;
  }

  publish(msgName: string, data?: any) {
    setTimeout(() => {
      // 获取存放callback的小容器
      const callbacks = this.callbackContainer[msgName];
      // 如果小容器存在
      if (callbacks) {
        // 将callbackContainer[msgName]里的回调函数全部异步执行，并传递对应的消息名data
        Object.values(callbacks).forEach((callback) => {
          callback(data);
        });
      }
    });
  }

  unsubscribe(flag: string) {
    if (flag === undefined) {
      // 如果没传递flag直接将所有消息清除
      this.callbackContainer = {};
    } else if (typeof flag === "string" && flag.indexOf("event_") === 0) {
      // 如果传递的是一个token
      Object.values(this.callbackContainer).forEach((callbacks) => {
        delete callbacks[flag];
      });
    } else {
      delete this.callbackContainer[flag];
    }
  }
})();
