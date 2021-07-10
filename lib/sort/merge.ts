function mergeSort(arr: number[]): number[] {
  const length = arr.length
  if(length === 1) {
    return arr
  }
  const mid = Math.floor(length / 2)
  const left = arr.slice(0, mid)
  const right = arr.slice(mid)
  return merge(mergeSort(left), mergeSort(right))
}

function merge(arr1: number[], arr2: number[]): number[] {
  const result = []
  let il = 0, ir = 0, length1 = arr1.length, length2 = arr2.length
  while(il < length1 && ir < length2) {
    if(arr1[il] < arr2[ir]) {
      result.push(arr1[il])
      il++
    } else {
      result.push(arr2[ir])
      ir++
    }
  }
  while(il < length1) {
    result.push(arr1[il])
    il++
  }
  while(ir < length2) {
    result.push(arr2[ir])
    ir++
  }
  return result
}

console.log(mergeSort([3, 2, 1, 5, 9, 7, 8]))