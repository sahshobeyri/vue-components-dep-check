function removeQuoteMarks(str) {
  const first = str[0]
  const last = str[str.length - 1]
  if ((first === "'" && last === "'") || (first === '"' && last === '"')) return str.slice(1,-1)
  throw Error('bad string')
}

function removeParentheses(str) {
  const first = str[0]
  const last = str[str.length - 1]
  if (first === "(" && last === ")") return str.slice(1,-1)
  throw Error('bad string')
}

function datetimeStrForFilename(dateObj) {
  const dateData = [dateObj.getFullYear(),dateObj.getMonth() + 1,dateObj.getDate()]
  const timeData = [
    dateObj.getHours(),
    dateObj.getMinutes(),
    dateObj.getSeconds(),
    dateObj.getMilliseconds()
  ]
  const dateStr = dateData.join('-')
  const timeStr = timeData.join('-')
  return `${dateStr}(${timeStr})`
}

exports = {
  removeParentheses,
  removeQuoteMarks,
  datetimeStrForFilename,
}