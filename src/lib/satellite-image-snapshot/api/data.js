import { csv } from "d3-fetch"

function formatDateText(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export async function getData(URL) {
  if (!URL) throw new Error("Missing data URL")

  const res = await csv(URL)

  const data = res
    .map((row, index) => {
      const dateString = (row.date || "").trim()
      const timestamp = new Date(`${dateString}T00:00:00`).getTime()

      return {
        id: row.id ? Number(row.id) : index,
        title: row.title?.trim() || "",
        description: row.description?.trim() || "",
        date: dateString,
        timestamp,
        dateText: formatDateText(dateString),
        year: new Date(`${dateString}T00:00:00`).getFullYear(),
        imageLink: row.image?.trim() || "",
        imageAlt: row.image_alt?.trim() || "",
      }
    })
    .filter((item) => item.date && !Number.isNaN(item.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item, index, arr) => ({        // second map, after sort
      ...item,
      isNewYear: index === 0 || item.year !== arr[index - 1].year,
    }))

  return data
}
