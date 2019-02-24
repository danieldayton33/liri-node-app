require("dotenv").config();

const keys = require("./keys.js");
const Spotify = require("node-spotify-api");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");


const spotify = new Spotify(keys.spotify);

const searchType = process.argv[2];
let queries= process.argv;
let queriesArr = [];
let userQuery;


for(let i = 3; i < queries.length; i++){
    queriesArr.push(queries[i]);
    userQuery = queriesArr.join(" ");
};
// console.log(searchType);
// console.log(userQuery || "I Want It That Way");

//constructor function for dealing with band data
const BandObject = function(venue, location, date) {
    this.venue = venue;
    this.location = location;
    this.date = moment(date).format("MM/DD/YYYY");
}

const SpotifyObject = function(artist, songName, spotifyLink, songAlbum){
    this.artist = artist;
    this.songName = songName;
    this.spotifyLink = spotifyLink;
    this.songAlbum = songAlbum; 
}

const writeToLog = function(responseInfo){
    fs.appendFile("log.txt", responseInfo, (err)=>{
        if(err){
            console.log("ERR: ", err);
        }
    });
}


//function for search spotify
const spotifySearch = (songTitle) =>{
spotify.search({
    type: 'track',
    query: songTitle,
},function(err, data){
    if(err){
        return console.log('Error occured: ', err);
    }
    // console.log(JSON.stringify(data, null, 2));
    let artists = [];
    let spotifyJson = data.tracks.items
    for( let i = 0; i < data.tracks.items.length; i++){
        let spotifyURL = spotifyJson[i].preview_url;
        let bandName = spotifyJson[i].album.artists[0].name;
        let albumTitle = spotifyJson[i].album.name;
        let songInfo = new SpotifyObject(bandName, songTitle, spotifyURL, albumTitle);
        // if(artists.indexOf(bandName) === -1)
        artists.push(songInfo);
    }
    if(artists.length > 0){
        console.log("Here's a list of artists with a song called " + songTitle);
        artists.forEach(SpotifyObject =>{
            let songInfo =
`
Arists: ${SpotifyObject.artist}
Song Title: ${SpotifyObject.songName}
Spotify Link: ${SpotifyObject.spotifyLink}
Album Title: ${SpotifyObject.songAlbum}
-----------------------------------------------
`;
            console.log(songInfo);
            writeToLog(songInfo);

            // console.log("Artist: " + SpotifyObject.artist);
            // console.log("Song Title: " + SpotifyObject.songName);
            // console.log("Spotify Link: " + SpotifyObject.spotifyLink);
            // console.log("Album Title: " + SpotifyObject.songAlbum);
            // console.log("-----------------------------");
        });
    }
    else{
        console.log("There are no results for " + songTitle + " in the spotify database. Please try another!"); 
    }
    // console.log(JSON.stringify(data, null, 2));
});
}

const bandsInTown = (bandName) => {
    axios.get("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp").then( response =>{
        const concerts = [];
        // console.log(response.data[0]);
        //for loop to create data objects
        for(let i = 0; i < response.data.length; i++){
            //variables to build location from data
            let locationInfo = [];
            let concertCity = response.data[i].venue.city;
            let concertState;
            //if US or International
            if(response.data[i].venue.region.length > 0){
                concertState = response.data[i].venue.region;
            }
            else{
                concertState = response.data[i].venue.country;
            }

                locationInfo.push(concertCity, concertState);
                location = locationInfo.join(", ");
                // console.log(location);
            //use constructor function to build Bandobject for each concert
            let concertInfo = new BandObject(response.data[i].venue.name, location, response.data[i].datetime);
            concerts.push(concertInfo);
        }
        if(concerts.length > 0){
        console.log("Here are the upcoming concerts for " + bandName + ":");
        concerts.forEach(BandObject =>{
            let bandInfo = 
`
venue: ${BandObject.venue}
location: ${BandObject.location}
date: ${BandObject.date}
--------------------------------
`
            // console.log(BandObject.venue);
            // console.log(BandObject.location);
            // console.log(BandObject.date);
            // console.log ("-------------");
            console.log(bandInfo);
            writeToLog(bandInfo);
        
            });
        }
        else{
            console.log("There are no upcoming shows for " + bandName + ". Try another band/performer!");
        }
    });
}

const omdbSearch = (movieTitle) => {
    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" +movieTitle).then(response => {
        if(response.data){
        let movieInfo = 
`
* Title: ${response.data.Title}
* Year of Release: ${response.data.Year}
* IMDB Rating: ${response.data.imdbRating}
* Rotten Tomatoes Rating: ${response.data.Ratings[1].Value}
* Country: ${response.data.Country}
* Language: ${response.data.Language}
* Plot: ${response.data.Plot}
* Actors: ${response.data.Actors}
------------------------------------------------------------
`;
        console.log(movieInfo);
        writeToLog(movieInfo);

        // console.log("* Title: " +response.data.Title);
        // console.log("* Year of Release: " +response.data.Year);
        // console.log("* IMDB Rating: " +response.data.imdbRating);
        // console.log("* Rotten Tomatoes Rating: " +response.data.Ratings[1].Value);
        // console.log("* Country: " +response.data.Country);
        // console.log("* Language: " +response.data.Language);
        // console.log("* Plot: " +response.data.Plot);
        // console.log("* Actors: " +response.data.Actors);
        }
        else{
            console.log("There are no reslts for " + movieTitle + ". Try another search!");
        }
    });
}

//check the type of search the user wants to do
if(searchType === "spotify-this-song"){
    if(!userQuery){
        spotifySearch("The Sign Ace of Base");
    }
    else{
    spotifySearch(userQuery);
    }
}
else if(searchType === "concert-this") {
    if(!userQuery){
        return console.log("Please enter a band name to search!");
    }
    bandsInTown(userQuery);
}
else if(searchType === "movie-this") {
    if(!userQuery){
        omdbSearch("Mr. Nobody")
    }
    else{
    omdbSearch(userQuery);
    }
}
else if(searchType === "do-what-it-says"){
    fs.readFile("randomn.txt", "utf8", function(error, data){
        if(error) {
            return console.log(error);
        }
        
        data = data.split(",");
        // console.log(data);
        spotifySearch(data[1]);
    });
}
else {
    console.log("Something went wrong here! Please use: (1)spotify-this-song, (2)concert-this, (3)movie-this, or (4)do-what-it-says for your search type!")
}

