function insertSort(arr: number[]) {
  let j, temp, length = arr.length
  for(let i = 1; i < length; i++) {
    temp = arr[i]
    j = i
    while(j > 0 && arr[j - 1] > temp) {
      arr[j] = arr[j - 1]
      j--
    }
    arr[j] = temp
  }
  return arr
}

console.log(insertSort([3, 2, 1, 5, 9, 7, 8]))
