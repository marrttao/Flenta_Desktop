export function currentMonthRange(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return { from: `${year}-${month}-01`, through: `${year}-${month}-${day}` }
}
