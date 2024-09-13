const express = require("express")
const app = express()
const axios = require("axios")


const urlBase = "https://rickandmortyapi.com/api/character"


app.get("/characters", async ( req, res ) => {
  try {
    const response = await axios.get(urlBase)
    const data = response.data.results
    res.json(data)

  } catch (err) {
    res.status(500).json({mensaje: "Personaje no encontrado"})
  }
})

app.get("/characters/:name", async ( req, res ) => {
  const characterName = req.params.name
  console.log(characterName)
  try {
    const response = await axios.get(`${urlBase}/?name=${characterName}`)
    const data = response.data.results

    const characterData = data.map(character => {
      const {name, status, species, gender, image, origin: {name: origin}} = character
      return {name, status, species, gender, image, origin}
    })

    res.json(characterData)

  } catch (err) {
    res.status(500).json({mensaje: "Personaje no encontrado"})
  }
})

const PORT = 4000
app.listen(PORT, () => console.log(`El servidor está escuchando en el puerto http://localhost:${PORT}`))