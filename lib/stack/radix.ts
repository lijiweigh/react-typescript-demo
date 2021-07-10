function transfer(num: number, base: number) {
  const result: number[] = []
  const digits = '0123456789ABCDEF'
  let str = ''

  while(num > 0) {
    result.unshift(num % base)
    num = Math.floor(num / base)
  }
  for(const r of result) {
    str += digits[r]
  }
  return str
}

console.log(transfer(100345, 2))
console.log(transfer(100345, 8))
console.log(transfer(100345, 16))
