export class DiffGenerator {
  constructor(oldArr, newArr) {
    this.newArr = newArr;
    this.oldArr = oldArr;
  }

  calculate() {
    this.newArr.sort();
    this.oldArr.sort();

    let i = 0;
    let j = 0;

    let added = [];
    let deleted = [];
    while (i < this.newArr.length && j < this.oldArr.length) {
      if (this.newArr[i] === this.oldArr[j]) {
        i++;
        j++;
        continue;
      }

      if (this.newArr[i] < this.oldArr[j]) {
        added.push(this.newArr[i]);
        i++;
      } else {
        deleted.push(this.oldArr[j]);
        j++;
      }
    }

    while (i < this.newArr.length) {
      added.push(this.newArr[i]);
      i++;
    }
    while (j < this.oldArr.length) {
      deleted.push(this.oldArr[j]);
      j++;
    }

    return { added: added, deleted: deleted };
  }
}


export function subsetOf(subset, superset) {
  if (subset.length > superset.length) return false;
  let supersetHM = {};
  for (let i = 0; i < superset.length; i++) {
    supersetHM[superset[i]] = true;
  }

  for (let i = 0; i < subset.length; i++) {
    if (!supersetHM[subset[i]]) return false;
  }
  return true;
}