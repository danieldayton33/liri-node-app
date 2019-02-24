

**Description**
Liri is a node.js application that takes in four search parameters on the command line and uses three different APIs to return information to the user. After providing the search type, the remaining command line entry is used to create the search (Song, Band, Movie).A log file is also appended for all search results.

**Search Types**
  * spotify-this-song: Uses Spotify API to search for song by song title 
  * concert-this: Uses BandinTown API to search for upcoming concerts by band name 
  * movie-this: Uses OMDB API to search for movies by title 
  * do-what-it-says: Uses fs to read a file and provide a search query from that file

**Check out this video to see it in action**
https://youtu.be/hynkUykCwIM 

**Node Modules required**
  * axios
  * spotify
  * moment
  * fs
