# rbg-wonderland
A friendly, CAPTCHA-less portal to RarBG (media piracy site) powered using their torrentAPI
Access the web app at: [RarBG Portal](https://gabba.ga/rbg.html)

![alt text](/s_shot0.png "Screenshot_0")

## Limitations:
- Api limits maximum search results to 100 so if your query has >100 results all may not be displayed. The website indicated this by showing one how many results your query has above the results table, if this occurs either try narrowing your query or use rarBG. 
- You can't run the html file directly and instead need to bypass the COR's restriction in someway (I used apache's proxy functionality to spoof the source url)
- Unlike RarBG, the query submitted on their api needs to be word-by-word accurate else it fails, I've mitigated this by implementing suggestions as you type (powered by IMDB) 

## Features
- Cool looking GUI
- Table sorting: by seeds, leachers, name and file size. One can also group by file type
- Free of nasty CAPTCHAs (meaning I have to trust on random internet peeps not to abuse my website)
- Suggestions bar (Movies only)
- Direct magnet links


## Acknowledgments
Thanks to RarBG for creating TorrentAPI and documenting it!
