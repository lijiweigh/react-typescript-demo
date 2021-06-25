function asyncPool6<T>(limit: number, array: T[], iteratorFn: (item: T, arr?: T[], index?: number) => Promise<T>) {
  let i = 0
  let ret: Promise<T>[] = []
  let running: Promise<T>[] = []

  function run() {
    if(i >= array.length) {
      return Promise.resolve()
    }
    const idx = i++
    const p = Promise.resolve().then(() => iteratorFn(array[idx], array, idx))
    ret.push(p)
    let r: Promise<T | void> = Promise.resolve()
    if(limit <= array.length) {
      const e = p.then(() => running.splice(running.indexOf(e), 1))
      running.push(e)
      if(running.length >= limit) {
        r = Promise.race(running)
      }
    }
    return r.then(() => run())
  }
  return run().then(() => Promise.all(ret))
}

asyncPool6(2, [2000, 1000, 3000, 5000], (item, arr, index) => new Promise((resolve) => {
  setTimeout(() => {
    console.log(item, index)
    resolve(item)
  }, item);
})).then(res => console.log(res))