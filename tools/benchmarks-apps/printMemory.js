function printMemory(event) {
  const used = process.memoryUsage();
  const obj = {event};

  for (let key in used) {
    // console.log(`${key} ${} MB`);
    obj[key] = Math.round((used[key] / 1024 / 1024) * 100) / 100;
  }

  obj.timestamp = Date.now();

  console.log(JSON.stringify(obj));
}

exports.printMemory = printMemory;
