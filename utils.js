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
      if (this.newArr[i] === this.oldArr[i]) {
        i++;
        j++;
        continue;
      }

      if (this.newArr[i] < this.oldArr[i]) {
        added.push(this.newArr[i]);
      } else {
        deleted.push(this.oldArr[i]);
      }
    }

    return { added: added, deleted: deleted };
  }
}
