async function asyncPool7<T>(limit: number, array: T[], iteratorFn: (item: T, arr?: T[], index?: number) => Promise<T>) {
  const ret: Promise<T>[] = []
  const running: Promise<T>[] = []
  for(let i = 0; i < array.length; i++) {
    const p = Promise.resolve().then(() => iteratorFn(array[i], array, i))
    ret.push(p)
    if(limit <= array.length) {
      const e = p.then(() => running.splice(running.indexOf(e), 1))
      running.push(e)
      if(running.length >= limit) {
        await Promise.race(running)
      }
    }
  }
  return Promise.all(ret)
}

asyncPool7(2, [2000, 1000, 3000, 5000], (item, arr, index) => new Promise((resolve) => {
  setTimeout(() => {
    console.log(item, index)
    resolve(item)
  }, item);
})).then(res => console.log(res))