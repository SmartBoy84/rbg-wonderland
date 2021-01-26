# rBG-Wonderland
A friendly, CAPTCHA-less portal to RarBG (media piracy site) powered using their torrentAPI

Access the web app at: [RarBG Portal](https://hamdan.rocks/rbg)

## Features
- Cool looking GUI
- Table sorting: by seeds, leechers, name or file size. One can also group by file type
- Free of nasty CAPTCHAs (meaning I have to trust on random internet peeps not to abuse my website)
- Suggestions bar (Movies only)
- Direct magnet links

![alt text](https://user-images.githubusercontent.com/12468102/105800947-eda95300-5fd2-11eb-9c75-f16770bdaa65.png "Screenshot_0")

## How to use
- Select one or more categories
- Type in the search query
  * if there is a suggestion available click it to refine your query
- Press enter/click the submit button
- A table with a bunch of links should be generated:
  * If you know what you're doing select your preferred file to open the magnet link
  * If not, the general rule of thumb is to select the file with the most seeds so click on the 'S.' to sort by seeds and select the file with the greatest seeds
- Clicking on a link should cause a prompt to appear asking you to open a [torrent client](https://www.qbittorrent.org/)

## Limitations:
- API limits maximum search results to 100 so if your query has >100 results, keep in mind that there are probably more results that aren't displayed. When results exceed 100 the result count above the results table is red and you should either try narrowing your query or use RarBG. 
- You can't run the html file directly due to the COR's restriction. You can either bypass it using [Cors Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino?hl=en) or just use my website
- Unlike RarBG, the query submitted on their API needs to be word-by-word accurate else it fails, I've mitigated this by implementing suggestions as you type (powered by IMDB) 

## Issues
Queries may not yield results the first time (it usually works the second/third time)

## Acknowledgments
Thanks to RarBG for creating TorrentAPI and documenting it!
<hr>

Finally, feel free to contribute however you like, I know my code is **far** from perfect!

Also, I would love it if you could [donate](https://ko-fi.com/barfangel) - It would make the week of my summer holidays spent on this project **completely** worthwhile 😊

Heck, even a star to this repo would be epic!
