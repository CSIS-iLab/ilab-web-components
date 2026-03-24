import { csv } from "d3-fetch"

const URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQo-OXqVYW_x9qJwWYt1XDE9BkmOKuY4EUTLCPnXLusy00g3EdvbDkg8QE4exYVY315S02Hnwz5vKrj/pub?gid=0&single=true&output=csv"

export async function getData() {
  const data = await csv(URL)
  return data
  // const data = res.map( (row, index) => ({
  //   id: index,
  //   description: row.description,
  //   title: row.title,
  //   titleLink: row.title_link,
  //   bgImage: row.background_image,
  //   bgImageAlt: row.background_image_alt,
  // }))
  // return data
}
