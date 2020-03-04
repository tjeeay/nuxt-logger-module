function prefixZero(num, length = 2) {
  let str = num.toString()
  while (str.length < length) {
    str = `0${str}`
  }
  return str
}

export const formatDate = (date, separator = '/') => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(prefixZero).join(separator)
}

export const formatTime = (date, separator = ':') => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [hour, minute, second].map(prefixZero).join(separator)
}

export const formatTimestamp = date => {
  const dateStr = formatDate(date)
  const timeStr = formatTime(date)
  const millisecondStr = prefixZero(date.getMilliseconds(), 3)
  return `${dateStr} ${timeStr}.${millisecondStr}`
}
