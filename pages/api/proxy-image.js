export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { url: imageUrl } = req.query
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing image URL' })
    }

    console.log('Fetching image from:', imageUrl) // Debug log

    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText)
      return res.status(404).json({ error: 'Failed to fetch image' })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    
    res.send(Buffer.from(imageBuffer))
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: `Internal server error: ${error.message}` })
  }
}