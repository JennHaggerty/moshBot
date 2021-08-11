Notify by email of bands on tour

To run this program, you need a `config/index.js` file.
This takes the format of :
```
module.exports =
{
gmail: 'sender@gmail.com',
password: 'app password, provided by Google',
tourBoards: [/*ticketmaster api link, recommended getting your own API key not public one*/],
whiteList: [/*artist names*/]
}
```

Ticketmaster allows x5 requests per second.
Presently timeouts, intervals, concurrencies, and chunking are not enough to avoid 429.
We bypass the 429 by snoozing the script for 1 second after each request is sent.