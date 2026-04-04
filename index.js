const axios = require('axios');

const Sh4n = 'https://sh-ans-api-07.vercel.app/';

module.exports = {
alldl: (url, author) => axios.get(`${Sh4n}ShAn-alldl?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
alldl2: (url, author) => axios.get(`${Sh4n}ShAn-alldl2?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
fbDL: (url, author) => axios.get(`${Sh4n}ShAn-fbDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
ytDL: (url, author) => axios.get(`${Sh4n}ShAn-ytDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
threaDL: (url, author) => axios.get(`${Sh4n}ShAn-threaDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
twitDL: (url, author) => axios.get(`${Sh4n}ShAn-twitDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
tikDL: (url, author) => axios.get(`${Sh4n}ShAn-tikDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
instaDL: (url, author) => axios.get(`${Sh4n}ShAn-instaDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
instaDL2: (url, author) => axios.get(`${Sh4n}ShAn-instaDL2?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
instaDL3: (url, author) => axios.get(`${Sh4n}ShAn-instaDL3?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
pinDL: (url, author) => axios.get(`${Sh4n}ShAn-pinDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
capcutDL: (url, author) => axios.get(`${Sh4n}ShAn-capcutDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
likeeDL: (url, author) => axios.get(`${Sh4n}ShAn-likeeDL?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
ytSearch: (query, author) => axios.get(`${Sh4n}alldl?url=${encodeURIComponent(query)}&author=${encodeURIComponent(author)}`).then(res => res.data),
alldown: (url) => axios.get(`${apiBaseUrl}alldown?url=${encodeURIComponent(url)}&author=${encodeURIComponent(author)}`).then(res => res.data),
spotifySearch: (name, limit) => axios.get(`${apiBaseUrl}spotify-search?name=${encodeURIComponent(name)}&limit=${limit}`).then(res => res.data),
spotifyDl: (url) => axios.get(`${apiBaseUrl}spotifyDl?url=${encodeURIComponent(url)}`).then(res => res.data)
}