    //#region variables
    //array of all the categories in rarbg
    var categories = {
        Movies: {
            "Movies/XVID/720": "48",
            "Movies/x264/720": "45",

            "Movies/x264/1080": "44",
            "Movies/x265/1080": "54",

            "Movies/x264": "17",
            "Movies/XVID": "14",

            "Movies/x264/4k": "50",
            "Movies/x265/4k": "51",
            "Movs/x265/4k/HDR": "52",

            "Movies/x264/3D": "47",

            "Movies/Full BD": "42",
            "Movies/BD Remux": "46",
        },
        TV: {
            "TV Episodes": "18",
            "TV HD Episodes": "41",
            "TV UHD Episodes": "49"
        },
        Music: {
            "Music/MP3": "23",
            "Music/FLAC": "25",
        },
        Games: {
            "Games/PC ISO": "27",
            "Games/PC RIP": "28",
            "Games/PS3": "40",
            "Games/PS4": "53",
            "Games/XBOX-360": "32"
        },
        Software: {
            "Software/PC ISO": "33",
        }
    }

    var fullCategories = Object.keys(categories).reduce((acc, key) => acc.concat(Object.keys(categories[key])), [])
    console.log(fullCategories)
    //user editable variables
    var appID = 'gabba'
    var expiryTime = 15 //minutes
    var safeLoop = 10 //how many times it loops request before returning "no results found"
    var safeLoopTime = 100 //ms
    var seedMinimum = 25

    //stuff that changes dynamically (in the code)
    var chosenCategories = []
    var token = ""

    //preset constants
    const buttonStates = ["is-error", "is-success"]
    //const corsFix = ''
    const api = "/tapi/pubapi_v2.php?" + "app_id=" + appID

    //#endregion
    const statusText = [["not ready!", "is-error"], ["choose categories", "is-warning"], ["input the search!", "is-success"], ["processing...", "is-warning"], ["no results found!", "is-error"]]

    if (document.cookie.indexOf('token') == "-1") {
        console.log("getting new token...")
        getNewToken()
    }
    else {
        setup()
    }

    function getNewToken() {
        fetch(api + "&get_token=get_token")
            .then(response => response.json())
            .then(data => {
                var date = new Date();
                date.setTime(date.getTime() + (24 * 60 * 60 * 1000)); //every 24 hours
                var expires = "; expires=" + date.toGMTString();

                document.cookie = "token=" + data["token"] + expires
                setup()
            })
    }


    function setup() {
        var cookieJar = decodeURIComponent(document.cookie).split(";")

        for (cookie in cookieJar) {
            console.log(cookieJar)
            if (cookieJar[cookie].includes("token")) {
                token = cookieJar[cookie].split("=")[1]
                console.log(token)
            }
        }

        for (category in categories) {
            console.log(category)
            let categoryButton = document.createElement("button")
            categoryButton.setAttribute("class", "nes-btn is-error button")
            categoryButton.innerHTML = category
            categoryButton.addEventListener("click", button)
            document.getElementById("categories").appendChild(categoryButton)
        }

        let status = document.getElementById("status")
        status.innerHTML = statusText[1][0]
        status.className = "nes-text " + statusText[1][1]
    }

    function button() {
        var index = chosenCategories.indexOf(this.innerHTML)

        var status = document.getElementById("status")
        if (status.innerHTML != statusText[3][0]) {

            var input = document.getElementById("submit")

            if (index == "-1") {
                chosenCategories.push(this.innerHTML)
                if (chosenCategories.length == 1) {
                    status.innerHTML = statusText[2][0]
                    changeStatus(status, statusText[2][1])

                    changeStatus(input, buttonStates[1])
                    input.disabled = false
                }
            }
            else {
                chosenCategories.splice(index, 1)
                if (chosenCategories == 0) {
                    changeStatus(status, statusText[1][1])
                    status.innerHTML = statusText[1][0]

                    changeStatus(input, buttonStates[0])
                    input.disabled = true
                }
            }
            console.log(chosenCategories)
            changeStatus(this, buttonStates[index == "-1" ? 1 : 0])

        }
    }
    function changeStatus(obj, status) {
        let newArray = obj.className.split(" ")
        newArray[1] = status
        obj.className = newArray.join(" ")
    }

    var result

    var sortingPara
    var order = 0 //high to low
    var grouped = 0

    document.getElementById("form").addEventListener("submit", search, event)
    async function search(event) {
        event.preventDefault()

        if (controller) controller.abort()

        let entry = document.getElementById("input")

        if (entry.value.length == 0) return

        console.log(document.getElementById("input").innerHTML)
        var catString = ""

        for (category in chosenCategories) {
            catString += Object.values(categories[chosenCategories[category]]).join(";")
        }
        let searchRequest = api + "&mode=search&format=json_extended&limit=100&ranked=0&token=" + token + "&category=" + catString + "&search_string=" + entry.value.replace(/['&]/g, "")
        //window.location.href = searchRequest
        console.log(searchRequest)
        let status = document.getElementById("status")
        status.innerHTML = statusText[3][0]
        changeStatus(status, statusText[3][1])
        //also set the buttons to disabled state
        this.disabled = true

        for (var i = 0; i != safeLoop; i++) {
            /*await new Promise((resolve) => {
                setTimeout(() => {
                    resolve()
                }, 500);
            });*/

            result = await (await fetch(searchRequest)).json()

            let requestStart = performance.now()
            if (result["error"] == undefined) {
                console.log("breaking!")
                break
            }

            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve()
                }, safeLoopTime - performance.now() - requestStart);
            });
        }
        console.log("Passed!")
        if (i == safeLoop) {
            status.innerHTML = statusText[4][0]
            changeStatus(status, statusText[4][1])
            console.log(result["error"])
        }
        else {
            result = result["torrent_results"]

            //*********************************** main
            sort()
            createTable(result)
            //***************************end

            status.innerHTML = statusText[2][0]
            changeStatus(status, statusText[2][1])
        }

        //console.log(result)
        this.disabled = false
    }

    function sort(obj) {
        sortedArray = result

        if (obj == undefined) {
            if (sortingPara != undefined) {
                changeStatus(document.getElementById(sortingPara), "is-primary")
                sortingPara = undefined
            }
            changeStatus(document.getElementById("category"), "is-primary")

            grouped = 0
            order = 0
            return
        }
        if (obj.id == "category") {
            grouped = 1 - grouped
            changeStatus(obj, grouped == 1 ? "is-success" : "is-primary")
        }

        else {
            if (sortingPara != undefined && obj.id != sortingPara) {
                changeStatus(document.getElementById(sortingPara), "is-primary")
                order = 0
            }
            sortingPara = obj.id

            order = 1 - order
            changeStatus(obj, buttonStates[order])
        }

        if (grouped == 1) {
            result = result.reduce((acc, value) => {
                if (!acc[value.category]) {
                    acc[value.category] = []
                }
                acc[value.category].push(value)
                return acc

            }, {})

            //return
            //above all I do is first group array values by category and then get it's keys, sort it by the order in
            //the original var (above) and then run a reduce to map the sorted array into the results array

            result = Object.keys(result).sort((a, b) => {
                return fullCategories.indexOf(a) > fullCategories.indexOf(b) ? 1 : -1
            }).reduce((obj, key) => {
                obj[key] = result[key]
                return obj
            }, {})

            //above I first order the results by the order of the categories then I run a reducer function of the object in order to (if required) sort
            //each array by the sorting parameter and then flatten it into one array

            result = Object.keys(result).reduce((acc, chunk) => {
                let target = result[chunk]

                if (sortingPara != undefined) target.sort(sortArray)
                acc = acc.concat(result[chunk])
                return acc

            }, [])
        }
        else {
            result.sort(sortArray)
        }

        createTable(result)
    }

    function sortArray(a, b) {
        let values = [a, b]
        //console.log(values)

        let a1 = values[order][sortingPara]
        let b1 = values[1 - order][sortingPara]

        return a1 == b1 ? 0 : a1 < b1 ? -1 : 1
    }

    function createTable(result) {
        let tableDiv = document.getElementById("resultTable")
        let tableTitle = tableDiv.children[0]
        let tableResults = tableDiv.children[1]

        if (tableDiv.style.display == "block") {
            tableResults.removeChild(tableResults.getElementsByTagName("tbody")[0]);
        }
        else {
            tableDiv.style.display = "block"
        }

        var newBody = document.createElement("tbody")

        for (i in result) {
            var newEntry = `<tr style="font-size:0.9vw">
                <td style="color:#ee622c">${result[i]["category"]}</td>
                <td><a href="${result[i]["download"]}">${result[i]["title"]}</a></td>
                <td style = "color: #6b4423">${(result[i]["size"] / 1073741824).toFixed(2)}GB</td>
                <td><span style = "color: ${result[i]["seeders"] < seedMinimum ? "tomato" : "#92CC41"}">${result[i]["seeders"]}</span></td>
                <td>${result[i]["leechers"]}</td>
            </tr>`
            newBody.insertAdjacentHTML("beforeend", newEntry)
        }
        tableResults.appendChild(newBody)

        tableTitle.innerHTML = `Results - ${result.length}`
        if (result.length == 100) tableTitle.style.color = "tomato"

        //20 > green else red

    }

    var controller = undefined
    var currentResults = undefined
    var searching = false
    var currentTimeOut = undefined
    var timeout = 0
    var searchArray = {}

    document.getElementById("input").addEventListener("click", function (e) {
        e.stopPropagation();
        if (chosenCategories.length > 1 | !chosenCategories.includes("Movies")) return

        if (currentResults) renderResults(currentResults)
        if (controller) controller.abort()
    })

    document.addEventListener("click", function (e) {
        if (currentResults) renderResults()
        if (controller) controller.abort()
    })


    document.getElementById("input").addEventListener("input", function () {
        if (chosenCategories.length > 1 | !chosenCategories.includes("Movies")) return

        if (controller) controller.abort()

        let request = this.value

        if (request == "") {
            renderResults()
            return
        }
        else {
            for (i in searchArray) {
                if (i.startsWith(request)) {
                    renderResults(searchArray[i])
                    return
                }
            }
        }

        if (!searching) renderResults("searching")

        getResults(request)
    })

    async function getResults(request) {

        controller = new AbortController();

        await fetch(`/iapi/suggestion/${request.charAt(0).toLowerCase()}/${request.replace(/\s+/g, '_').trim().replace(/[^\w\s]/gi, '')}.json`, { signal: controller.signal })
            .then(response => response.json())
            .then(data => {
                searchArray[data["q"]] =
                    data["d"] == undefined ? null :
                        data["d"].reduce((totalResults, scopedResult) => {
                            if (scopedResult["q"] == "feature" && !totalResults.includes(scopedResult["l"])) {
                                totalResults.push(scopedResult["l"])
                            }
                            return totalResults
                        }, [])
                renderResults(searchArray[data["q"]])
                console.log(searchArray)

            })
            .catch(function (e) {

            })
    }

    function renderResults(results) {
        let main = document.getElementById("autocomplete-items")

        if (main) main.remove()

        if (!results) return

        //create primary div
        let pD = document.createElement("DIV")
        pD.setAttribute("id", "autocomplete-items")

        if (results == "searching") {
            currentResults = undefined
            node = document.createElement("DIV")
            node.innerHTML = "Finding movie..."

            pD.appendChild(node)
            searching = true
        }
        else {
            currentResults = results

            searching = false
            results.forEach(movie => {
                node = document.createElement("DIV")

                node.innerHTML = movie

                node.addEventListener("click", function (e) {
                    e.stopPropagation();
                    document.getElementById("input").value = this.innerHTML
                    renderResults()
                    if (controller) controller.abort()
                })

                pD.appendChild(node)
            });
        }
        document.getElementById("autocomplete").appendChild(pD)
    }