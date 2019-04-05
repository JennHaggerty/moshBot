Notify by email of bands on tour

To run this program, you need a `config/index.js` file.
This takes the format of :
```
module.exports =
{
gmail: 'sender@email.com',
password: 'base64encodedPassword',
tourBoards: [/*ticketmaster api link, more to come*/],
whiteList: [/*keywords to notify sender of bands on tour*/]
}
```