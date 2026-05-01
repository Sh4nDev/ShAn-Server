<h3 align="center">
  
  <p align="center"><img src="https://img.shields.io/badge/WLCM%20TO -ShAn Server-green?colorA=%23ff0000&colorB=%23017e40&style=flat-square">  
  
</h3>




## Instalation :
```bash
> npm i shan-server
```
## Last Update 
```print
coming soon
```

## Example (all platform supported)
```bash
support url: facebook, tiktok, twitter, instagram, youtube, pinterest, capcut, likee, threads
note: Let me know if any of the platforms you use are missing
```
```js
const { ShAnAlldl } = require("shan-server")
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://vt.tiktok.com/ZS9ArCe4H"; //past video link
const res = await ShAnAlldl(url, author); 
console.log(res)
```
## Output Example (all platform supported)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "TikTok",
  "msg": "✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨!\n🔖 𝐏𝐥𝐚𝐭𝐟𝐫𝐨𝐦: TikTok\n𝐌𝐚𝐝𝐞 ♡︎ 𝗦𝗵𝗔𝗻 ♡︎😪",
  "ShAn": "https://v19.tiktokcdn-us.com/5e0b160a3232719ab55f5110154c4005/69f509dd/video/tos/alisg/tos-alisg-pve-0037c001/ogIZhfIAopAFVEHPz3jeoxfNbzDZDCBEtQwTqi/?a=1233&bti=OTg7QGo5QHM6OjZALTAzYCMvcCMxNDNg&&bt=472&ft=ha56B22xjQM9wwCLVsprU5~OAwEfLopiA00o~YBMEeF&mime_type=video_mp4&rc=O2dkODo5OmdmaDlmOGU6OkBpanhta245cnk2OjMzODczNEA0XjItXjE2Ni8xMDVeYmI2YSNeYWleMmRzcGVhLS1kMTFzcw%3D%3D&vvpl=1&l=2026050114150147CB72C856E9C43515A7&btag=e000b8200"
}
```
## Example (Instagram)
```js
const { ShAnInstadl } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://www.instagram.com/reel/DW4zex8E8m9/?igsh=cW5xbmh5bWZwdnZs" //past video link
const res = await ShAnInstadl(url, author);  
console.log(res)
```
## Output Example (Instagram)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Instagram",
  "ShAn": "https://d.rapidcdn.app/v2?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3Njb250ZW50LWJlcjEtMS5jZG5pbnN0YWdyYW0uY29tL28xL3YvdDE2L2YyL204Ni9BUVBQSENwNi1ndUI1OFhtbGNuTDY4T1phMHRTUy1LLWtsU2VFVVZhUXpSbWpFWkFRV1NfVndMeFBlbmtLSUZsVDR0dVdoUE1mNUVKOGZVNkEwaFlPeC16LVUzd2pzUEFmZ1h2NFg0Lm1wND9zdHA9ZHN0LW1wNCZlZmc9ZXlKeFpWOW5jbTkxY0hNaU9pSmJYQ0pwWjE5M1pXSmZaR1ZzYVhabGNubGZkblJ6WDI5MFpsd2lYU0lzSW5abGJtTnZaR1ZmZEdGbklqb2lkblJ6WDNadlpGOTFjbXhuWlc0dVkyeHBjSE11WXpJdU1USTRNQzVpWVhObGJHbHVaU0o5Jl9uY19jYXQ9MTA0JnZzPTE0MDg5NzQzNDEwMzMxOTNfMzI2NTQ5OTM4NCZfbmNfdnM9SEJrc0ZRSVlVbWxuWDNod2RsOXlaV1ZzYzE5d1pYSnRZVzVsYm5SZmMzSmZjSEp2WkM4ME9UUTVPVFl6TUVJeE5USXlSalpETlVJek1rWXhNamswTmpWRlJESTROMTkyYVdSbGIxOWtZWE5vYVc1cGRDNXRjRFFWQUFMSUFSSUFGUUlZVVdsblgzaHdkbDl3YkdGalpXMWxiblJmY0dWeWJXRnVaVzUwWDNZeUwwRkZOREkxTkRCRk16VXdPVVpDT0VWQlJqWTROa1JDTkVSQ1JVVTJNa0pHWDJGMVpHbHZYMlJoYzJocGJtbDBMbTF3TkJVQ0FzZ0JFZ0FvQUJnQUd3QVZBQUFtJTJCcWphM1pEJTJGM3o4VkFpZ0NRek1zRjBBbk16TXpNek16R0JKa1lYTm9YMkpoYzJWc2FXNWxYekZmZGpFUkFIWCUyQkIyWG1uUUVBJmNjYj05LTQmb2g9MDBfQWY0NEVsSGlabmk5aXM4TlE3SVlrRG5pNzdWWUFSR0xoWlZoWWpsUnEzZEVLZyZvZT02OUY2QTYxRiZfbmNfc2lkPTEwZDEzYiIsImZpbGVuYW1lIjoic25hcHNhdmUtYXBwXzM4NzEwNzAyOTUzMDI1ODg4NjEubXA0IiwiaGVhZGVycyI6eyJ1c2VyLWFnZW50IjoiVGVsZWdyYW1Cb3QgKGxpa2UgVHdpdHRlckJvdCkifSwiaWF0IjoxNzc3NjQ1MTYwfQ.64sKEOB7fZ_qxoe4wQNM_m0DoIW7rqgsmP5GmsdBJH4&dl=1&dl=1"
}
```
## Example (Instagram2)
```js
const { ShAnInstadl2 } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://www.instagram.com/reel/DW4zex8E8m9/?igsh=cW5xbmh5bWZwdnZs" //past video link
const res = await ShAnInstadl2(url, author); 
console.log(res)
```
## Output Example (Instagram2)
```
{
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Instagram",
  "title": "Ankit Shyam on Instagram: \"#newpost😍 #likesharecomment #r15v3",
  "ShAn": "https://d.rapidcdn.app/v2?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3Njb250ZW50LWFtczItMS5jZG5pbnN0YWdyYW0uY29tL28xL3YvdDE2L2YyL204Ni9BUVBQSENwNi1ndUI1OFhtbGNuTDY4T1phMHRTUy1LLWtsU2VFVVZhUXpSbWpFWkFRV1NfVndMeFBlbmtLSUZsVDR0dVdoUE1mNUVKOGZVNkEwaFlPeC16LVUzd2pzUEFmZ1h2NFg0Lm1wND9zdHA9ZHN0LW1wNCZlZmc9ZXlKeFpWOW5jbTkxY0hNaU9pSmJYQ0pwWjE5M1pXSmZaR1ZzYVhabGNubGZkblJ6WDI5MFpsd2lYU0lzSW5abGJtTnZaR1ZmZEdGbklqb2lkblJ6WDNadlpGOTFjbXhuWlc0dVkyeHBjSE11WXpJdU1USTRNQzVpWVhObGJHbHVaU0o5Jl9uY19jYXQ9MTA0JnZzPTE0MDg5NzQzNDEwMzMxOTNfMzI2NTQ5OTM4NCZfbmNfdnM9SEJrc0ZRSVlVbWxuWDNod2RsOXlaV1ZzYzE5d1pYSnRZVzVsYm5SZmMzSmZjSEp2WkM4ME9UUTVPVFl6TUVJeE5USXlSalpETlVJek1rWXhNamswTmpWRlJESTROMTkyYVdSbGIxOWtZWE5vYVc1cGRDNXRjRFFWQUFMSUFSSUFGUUlZVVdsblgzaHdkbDl3YkdGalpXMWxiblJmY0dWeWJXRnVaVzUwWDNZeUwwRkZOREkxTkRCRk16VXdPVVpDT0VWQlJqWTROa1JDTkVSQ1JVVTJNa0pHWDJGMVpHbHZYMlJoYzJocGJtbDBMbTF3TkJVQ0FzZ0JFZ0FvQUJnQUd3QVZBQUFtJTJCcWphM1pEJTJGM3o4VkFpZ0NRek1zRjBBbk16TXpNek16R0JKa1lYTm9YMkpoYzJWc2FXNWxYekZmZGpFUkFIWCUyQkIyWG1uUUVBJmNjYj05LTQmb2g9MDBfQWYzaWlWTzZ4LXlyRlFyUDlLX2UzbmZuN3BqR1Y3OUJUOEpKcWhLOEJfRTJGUSZvZT02OUYzQ0FERiZfbmNfc2lkPTEwZDEzYiIsImZpbGVuYW1lIjoic25hcHNhdmUtYXBwXzM4NzEwNzAyOTUzMDI1ODg4NjEubXA0IiwiaGVhZGVycyI6eyJ1c2VyLWFnZW50IjoiVGVsZWdyYW1Cb3QgKGxpa2UgVHdpdHRlckJvdCkifSwiaWF0IjoxNzc3NDY0NTYwfQ.55cQtXAihEi_yl3a1SbiACQsxvaaDcQn9rE7g9qh4iM&dl=1&dl=1"
}
```
## Example (Instagram3)
```js
const { ShAnInstadl3 } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://www.instagram.com/reel/DW4zex8E8m9/?igsh=cW5xbmh5bWZwdnZs" //past video link
const res = await ShAnInstadl3(url, author); 
console.log(res)
```
## Output Example (Instagram3)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Instagram",
  "ShAn": "https://instagram.fhan5-10.fna.fbcdn.net/o1/v/t2/f2/m86/AQPPHCp6-guB58XmlcnL68OZa0tSS-K-klSeEUVaQzRmjEZAQWS_VwLxPenkKIFlT4tuWhPMf5EJ8fU6A0hYOx-z-U3wjsPAfgXv4X4.mp4?_nc_cat=101&_nc_oc=AdpM7EBiXKACfCHeJgscYL2HN-05d4CFESR-3cpX-8DD7dCt6j4kqtwc14mLy0JgxH0&_nc_sid=5e9851&_nc_ht=instagram.fhan5-10.fna.fbcdn.net&_nc_ohc=OxbDhga5Sx8Q7kNvwEo60JH&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuMTI4MC5kYXNoX2Jhc2VsaW5lXzFfdjEiLCJ4cHZfYXNzZXRfaWQiOjE3OTQ0MDE0ODM0MTc2MjUzLCJhc3NldF9hZ2VfZGF5cyI6MjAsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=5502c8efabd95081&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC80OTQ5OTYzMEIxNTIyRjZDNUIzMkYxMjk0NjVFRDI4N192aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0FFNDI1NDBFMzUwOUZCOEVBRjY4NkRCNERCRUU2MkJGX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACb6w8jgkP_fPxUCKAJDMywXQCczMzMzMzMYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ZRnkNXgTNzeEPN-1KMFM7g&_nc_zt=28&_nc_ss=7a22e&oh=00_Af2iIpeorvCEOqqcXAgHHNH7MKv7WBlv84HufOszzwLjeQ&oe=69F3BCFA"
}
```
## Example (TikTok)
```js
const { ShAnTikdl } = require("shan-server"); 
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://vt.tiktok.com/ZS9ArCe4H"; //past video link
const res = await ShAnTikdl(url, author); 
console.log(res);
```
## Output Example (tikTok)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "TikTok",
  "ShAn": "https://v19.tiktokcdn-us.com/58a0f46700804bd423f66c03506f4aab/69f1200a/video/tos/alisg/tos-alisg-pve-0037c001/ogIZhfIAopAFVEHPz3jeoxfNbzDZDCBEtQwTqi/?a=1233&bti=OUBzOTg7QGo6OjZAL3AjLTAzYCMxNDNg&&bt=472&ft=BIcq8VY1wyqRft9EOr_hFJ4_A0pibcNQ4jKJPrDMs.0P3-I&mime_type=video_mp4&rc=O2dkODo5OmdmaDlmOGU6OkBpanhta245cnk2OjMzODczNEA0XjItXjE2Ni8xMDVeYmI2YSNeYWleMmRzcGVhLS1kMTFzcw%3D%3D&vvpl=1&l=20260428150034CA96395017A1CA05C7EA&btag=e000b8000"
}
```
## Example (TikTok Search)
```js
const { ShAntikSearch } = require("shan-server"); 
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const query = "anime edit; //past video link
const res = await ShAntikSearch(query, author); 
console.log(res);
```
## Output Example (TikTok Search)
```
[
  {
    "status": "success",
    "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
    "devfb": "https://m.facebook.com/Sh4n.Dev1",
    "devwp": "https://wa.me/+8801825829588",
    "title": "2018, mone ache Me To  #animeedit #fffffffffffyyyyyyyyyyypppppppppppp #foryou #anime #trending ",
    "duration": 17,
    "ShAn": "https://v77.tiktokcdn-eu.com/b83f0a65f05d1e0a1cd146653d023d0f/69f348e0/video/tos/alisg/tos-alisg-pve-0037c001/oom1iAAiJIDxPIEwOlC9U1E4sdGEBf1Aqtv0Xv/?a=1233&bti=NEBzNTY6QGo6OjZALnAjNDQuYCMxNDNg&&bt=145&ft=XsFbEqT0majPD12z1PIs3wUOx5EcMeF~O5&mime_type=video_mp4&rc=NDZpNzc1O2RnPDY2Zmg2aEBpam5yOGs5cjVrOjMzODczNEBjYjUuL2A0X14xXmIuYzY2YSNiZnA0MmRjaWthLS1kMTFzcw%3D%3D&vvpl=1&l=2026042912192630A4887F4B6AD45F4BC6&btag=e000b8000",
    "cover": "https://p16-common-sign.tiktokcdn-eu.com/tos-alisg-p-0037/ockDeUTAe8jMuCxNAToaj8QeWIAjuG3JupKy7B~tplv-tiktokx-origin.image?biz_tag=musically_video.video_cover&dr=10402&idc=no1a&ps=13740610&refresh_token=852b9995&shcp=9b759fb9&shp=c1333099&t=4d5b0474&x-expires=1777485600&x-signature=ODs52UwDRKFaWzPHXJmkkdc60uw%3D",
    "stats": {
      "views": 94332,
      "likes": 7923,
      "comments": 140,
      "shares": 576,
      "downloads": 171
    },
    "video_author": {
      "id": "7382061774658962439",
      "username": "your_anime_6",
      "nickname": "メ 𝘎 𝘖 𝘑 𝘖 🕊️",
      "avatar": "https://p19-common-sign.tiktokcdn-eu.com/tos-alisg-avt-0068/4d74d05780dff15c11239264490ce198~tplv-tiktokx-cropcenter-q:300:300:q70.jpeg?dr=9605&idc=no1a&ps=87d6e48a&refresh_token=a948fcb5&s=SEARCH&sc=avatar&shcp=c1333099&shp=d05b14bd&t=223449c4&x-expires=1777550400&x-signature=Ybxl4B4ShEtInjcc2SYpxJ5m2t4%3D"
    },
    "music": {
      "id": "7633349411464055570",
      "title": "original sound - your_anime_6",
      "author": "メ 𝘎 𝘖 𝘑 𝘖 🕊️",
      "duration": 17,
      "url": "https://sf16-ies-music-sg.tiktokcdn.com/obj/tiktok-obj/7633349412470983441.mp3"
    }
  }
]
```
## Example (YouTube Search)
```js
const { ShAnytSearch } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎";

const query = "paro";
const res = await ShAnytSearch(query, author);
console.log(res)
```
## Output Example (YouTube Search)
```
[
  {
    "status": "success",
    "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
    "devfb": "https://m.facebook.com/Sh4n.Dev1",
    "devwp": "https://wa.me/+8801825829588",
    "videoId": "cNgL40UfhbA",
    "url": "https://youtube.com/watch?v=cNgL40UfhbA",
    "title": "NEJ' - Paro (Lyrics)",
    "description": "NEJ' - Paro (Lyrics) Get it here: Follow NEJ' https://www.snapchat.com/add/nej3192 https://www.instagram.com/nejofficial ...",
    "thumbnail": "https://i.ytimg.com/vi/cNgL40UfhbA/hq720.jpg",
    "timestamp": "3:23",
    "ago": "3y ago",
    "views": 28761601
  }
]
```
## Example (YouTube)
```js
const { ShAnYtdl } = require("shan-server"); 
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://youtu.be/Ge70Eea5K1w"; //past video link
const res = await ShAnYtdl(url, author); 
console.log(res);
```
## Output Example (YouTube)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "YouTube",
  "thumbnail": "https://i.ytimg.com/vi/Ge70Eea5K1w/hqdefault.jpg",
  "ShAn": "https://todd87.savenow.to/pacific/?gE8UBWsWS5KOt8DUzLbbe9b",
  "title": "How To Create a Facebook Messenger Chat Bot (A To Z) কিভাবে একটি মেসেঞ্জার চ্যাট বট তৈরি করবেন..."
}
```
## Example (YouTube mp3)
```js
const { ShAnYtmp3 } = require("shan-server"); 
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://youtu.be/Ge70Eea5K1w"; //past video link
const res = await ShAnYtdl(url, author); 
console.log(res);
```
## Output Example (YouTube mp3)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "YouTube",
  "thumbnail": "https://i.ytimg.com/vi/Ge70Eea5K1w/hqdefault.jpg",
  "ShAn": "https://patrick17.savenow.to/pacific/?NXnKFiPINLQsNDzQQpJkNOP",
  "title": "How To Create a Facebook Messenger Chat Bot (A To Z) কিভাবে একটি মেসেঞ্জার চ্যাট বট তৈরি করবেন..."
}
```
## Example (Twitter)
```js
const { ShAnTwitdl } = require("shan-server"); 
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://twitter.com/TeamAbhiSha/status/1743351410761019794?t=vms8wxcU0mQuhVxwGCHjFw&s=19";
const res = await twitterdown(url, author); 
console.log(res)
```
## Output Example (Twitter)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Twitter",
  "ShAn": "https://patrick17.savenow.to/pacific/?NXnKFiPINLQsNDzQQpJkNOP"
}
```
## Example (Facebook)
```js
const { ShAnFbdl } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎" //dont change


const url = "https://www.facebook.com/reel/1694978081682345/?mibextid=9drbnH" //past video link
const res = await ShAnFbdl(url, author);
console.log(res)
```
## Output Example (Facebook)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Facebook",
  "ShAn": "https://d.rapidcdn.app/v2?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3ZpZGVvLWJlcjEtMS54eC5mYmNkbi5uZXQvbzEvdi90Mi9mMi9tMzY2L0FRT2FUejRfUk91d1U4V3BVRUFiblNLT1ZzSXBaX3FKSTR0QTBWbDRDMjlid2ZGalFMbGlJaDBfNmVEQXlIUVhHcUZFd2laNy1oOGRReUFfOUlUdUViem0xUVczdDMyaDd0ZlRsT3RXRXBGSUtBLm1wND9fbmNfY2F0PTEwMyZfbmNfc2lkPTVlOTg1MSZfbmNfaHQ9dmlkZW8tYmVyMS0xLnh4LmZiY2RuLm5ldCZfbmNfb2hjPXNYWmtoX2xrSGU4UTdrTnZ3RU9xampoJmVmZz1leUoyWlc1amIyUmxYM1JoWnlJNkluaHdkbDl3Y205bmNtVnpjMmwyWlM1R1FVTkZRazlQU3k0dVF6TXVOekl3TG1SaGMyaGZhREkyTkMxaVlYTnBZeTFuWlc0eVh6Y3lNSEFpTENKNGNIWmZZWE56WlhSZmFXUWlPamd6TmpNd05Ua3lNamcxTXpneE55d2lZWE56WlhSZllXZGxYMlJoZVhNaU9qTXNJblpwWDNWelpXTmhjMlZmYVdRaU9qRXdNVEl5TENKa2RYSmhkR2x2Ymw5eklqb3hOQ3dpZFhKc1oyVnVYM052ZFhKalpTSTZJbmQzZHlKOSZjY2I9MTctMSZ2cz01Y2Y5ODk0Y2M5YzUxNDcwJl9uY192cz1IQmtzRlFJWVJXWmlYMlZ3YUdWdFpYSmhiQzg0TmpSQk1qTkRSRVJET0VFeFJEZ3dORFZETWtJMFJEaENSall3TmpKQ1JGOXRkRjh4WDNacFpHVnZYMlJoYzJocGJtbDBMbTF3TkJVQUFzZ0JFZ0FWQWhoQVptSmZjR1Z5YldGdVpXNTBMMEV5TkRNMU9EVkdPVUpEUkVNd05qQXdNRGswTnpsRU9EYzBNVGxDTmtFNFgyRjFaR2x2WDJSaGMyaHBibWwwTG0xd05CVUNBc2dCRWdBb0FCZ0FHd0tJQjNWelpWOXZhV3dCTVJKd2NtOW5jbVZ6YzJsMlpWOXlaV05wY0dVQk1SVUFBQ2J5cnFUWHRLZjhBaFVDS0FKRE15d1hRQzNNek16TXpNMFlHV1JoYzJoZmFESTJOQzFpWVhOcFl5MW5aVzR5WHpjeU1IQVJBSFVDWlpTZUFRQSZfbmNfZ2lkPXhqaDcxVFJfOTR1ZVlaVTJiSXRvN1EmX25jX3NzPTcwMjBmJl9uY196dD0yOCZvaD0wMF9BZjBGZGthMEhxdl9zT041VFpvSEtULU9NRDRTV0lxeHZtSnFuU2VVZ29pdDBBJm9lPTY5RjZCNzMxJmJpdHJhdGU9NTgyMTM0JnRhZz1kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwiZmlsZW5hbWUiOiJzbmFwc2F2ZS1hcHBfMTY5NDk3ODA4MTY4MjM0NV9oZC5tcDQiLCJoZWFkZXJzIjp7InVzZXItYWdlbnQiOiJUZWxlZ3JhbUJvdCAobGlrZSBUd2l0dGVyQm90KSJ9LCJpYXQiOjE3Nzc0Njc4NzB9.mwgWdpjbMAdUE78Llufxwfwoh2AdttVEBnBNT0kfyUU&dl=1"
}
```
## Example (Pintarest)
```js
const { ShAnPindl } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎"; //dont change

const url = "https://pin.it/3m78CdJGW"; // //past video link
const res = ShAnPindl(url, author);
console.log(res)
```
## Output Example (Pintarest)  
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Pinterest",
  "title": "Dance with me𖨆♥︎𖠋",
  "ShAn": "https://v1.pinimg.com/videos/mc/720p/61/f6/9f/61f69f4b62a9998489d7fb3a2c605ace.mp4",
  "user": {
    "username": "Afortunat88",
    "full_name": "Afortunat",
    "profile_url": "https://www.pinterest.com/Afortunat88/",
    "avatar_url": "https://i.pinimg.com/75x75_RS/e3/32/ce/e332ce22ebb1132d0e00395b487a09e4.jpg"
  }
}
```
## Example (CapCut)
```js
const { ShAnCapcutdl } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎";

const url = "https://www.capcut.com/tv2/ZS9BGUdL1/"; // capcut link
const res = await ShAnCapcutdl(url, author);
console.log(res)
```
## Output Example (CapCut)  
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "CapCut",
  "title": "#foryou#capcut#jubayer6t9#viral",
  "cover": "https://p16-capcut-sign-sg.ibyteimg.com/tos-alisg-v-643f9f/oUL73AITzFxODi1AIf6hDbDEgoneInUAde5AEG~tplv-4d650qgzx3-image.image?lk3s=2d54f6b1&x-expires=1809089600&x-signature=EFU325ZihqzxEq%2FfrMlAm7eIVmk%3D",
  "ShAn": "https://3bic.com/api/cdn/aHR0cHM6Ly92MTYtdm9kLmNhcGN1dHZvZC5jb20vZGNmYzY0M2QxNmEzY2MzYmIzMGMwZDBjZDZiODQ1MTEvNjlmNzQ1NGMvdmlkZW8vdG9zL2FsaXNnL3Rvcy1hbGlzZy12LTY0M2Y5Zi9vNEJTSWZCcEJnQUlnSHQwQUUwb2ZBSkNPRWtENUY4OXdROUgzdS8_YT0zMDA2JmJ0aT1jSEozYnpGbWMzZG1aRUJ2WTE1dGFGNHJjbTFnWUElM0QlM0QmJmJ0PTMyNDgmZnQ9YXNkSjRxSTNtYm5QRDEyVVRXSXMzd1VGdk9DNk1lRn5PNSZtaW1lX3R5cGU9dmlkZW9fbXA0JnJjPU16ZHBaSGc1Y210cU9qTXpPR1ZrTkVCcE16ZHBaSGc1Y210cU9qTXpPR1ZrTkVCeGNWOHRNbVEwY21kaExTMWtZaTF6WVNOeGNWOHRNbVEwY21kaExTMWtZaTF6Y3clM0QlM0QmdnZwbD0xJmw9MjAyNjA0MzAyMDUzMTkxNDM3MEY3RDc4OTFGQjY4NTdDMiZidGFnPWUwMDA3MDAwMA"
}
```
## Example (Likee)
```js
const { ShAnLikeedl } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎";

const url = "https://l.likee.video/v/cZIk77" // past url
const res = await ShAnLikeedl(url, author);
console.log(res)
```
## Output Example (Likee)  
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Likee",
  "title": "ট্যাপ দিয়ে মেহেদী #LIKEE #reel @Likee Bangladesh ",
  "video_count": "1080",
  "like_count": "553",
  "comment_count": "27",
  "share_count": "106",
  "thumbnail": "https://videosnap.like.video/asia_live/ksy/1vz8Q500m33lYHC1MyIvM_4.jpg?wmk_sdk=1&type=8",
  "ShAn": "https://video.like.video/asia_live/ks2/21vz8Pz12Zjt.mp4?crc=352351112&type=5"
}
```
## Example (Threads)
```js
const { ShAnThreadl } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎";

 const url = "https://www.threads.com/@aj_adi_sam/post/DXytnXXD3gJ?xmt=AQF04KlQXs-ZfThqPoDXswXy3BQCgnZIL6jWrT8kvEhnXat4RchDe-UxU4e4qm9SckzGlMaC&slof=1"; // past url
 const res = await ShAnThreadl(url, author);
 console.log(res)

```
## Output Example (Threads)  
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "platform": "Threads",
  "title": "Posting content to reach 1k followers &#x1f62d;&#x1f940;\n#demonslayer #tanjirokamado #nezuko #anime #viral",
  "ShAn": "https://scontent-iad3-2.cdninstagram.com/o1/v/t2/f2/m86/AQMPDi0o_UU_jZFemSEH_8pJnzME4grwFGYJ1_NqZabKn8AFVh1L9mW8zwYwawdusOhMNcBcbAi7L0DwOhfC_VFOV02H18_Pp7EBXOE.mp4?_nc_cat=103&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=XyYIkJHjpQUQ7kNvwExvj2F&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uRkVFRC5DMy4xMjgwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTQ2Mjg0MzQ1MTgyNTg4MywiYXNzZXRfYWdlX2RheXMiOjAsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjozNywidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=4db3b4583564efbf&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC83NzQ3OThCMUNBMjRBMzA0NTdBRjA1QjMyQzkwRUNCMV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzlGNDQ0NTY1REFGNjg1N0FERkNCMUEzQkMwMTA5NTgwX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACa2-_aE2ZyZBRUCKAJDMywXQELzMzMzMzMYEmRhc2hfYmFzZWxpbmVfMV92MREAdeoHZeadAQA&_nc_gid=N_Js4MRigOlDvIsHQXx4Vw&_nc_zt=28&_nc_ss=7a22e&oh=00_Af49-bvORQCwO8C0-EAu-2HsaJaJ0_pxNWdQ7h6JRrnvPQ&oe=69F6A4C8"
}
```
## Example (Imgur upload)
```js
const { ShAnImgur } = require("shan-server");
const author = "♡︎ 𝗦𝗵𝗔𝗻 ♡︎";

const url = 'url' // past achievement url
const res = ShAnImgur(url, author);
console.log(res)
```
## Output Example (Imgur upload)
```
{
  "status": "success",
  "author": "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  "devfb": "https://m.facebook.com/Sh4n.Dev1",
  "devwp": "https://wa.me/+8801825829588",
  "ShAn": "", // Upload image url
}
```

  
[![WhatsApp](https://img.shields.io/badge/WhatsApp-green?style=for-the-badge&logo=whatsapp)](https://wa.me/+8801825829588)
[![Facebook](https://img.shields.io/badge/Facebook-green?style=for-the-badge&logo=facebook)](https://www.facebook.com/Sh4n.Dev1)
[![Messenger](https://img.shields.io/badge/Chat-Messenger-blue?style=for-the-badge&logo=messenger)](https://m.me/Sh4n.Dev1)
[![Github](https://img.shields.io/badge/Github-MrDarkYTgreen?style=for-the-badge&logo=github)](https://github.com/Sh4nDev)
