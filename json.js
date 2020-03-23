const path = require('path')
const fs = require('fs')

let obj = {}

fs.readFile('./test.txt', 'utf-8', (err, data) => {
  err && console.log('err：' + err)
  console.log('========================================')
  data.split(',').forEach(item => {
    let index = item.indexOf('=')
    let key = item.slice(0, index)
    let val = item.slice(index + 1, item.length)
    obj[key.trim()] = val.trim()
  })

  console.log(obj)
})